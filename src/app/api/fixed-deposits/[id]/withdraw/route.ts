import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { calculateFDR } from '@/lib/services/interest.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const fdr = await prisma.fixedDeposit.findFirst({
      where: { id, userId: user.id },
      include: { account: true, payoutAccount: true },
    });

    if (!fdr) {
      return NextResponse.json({ error: { message: 'Fixed deposit not found' } }, { status: 404 });
    }

    if (fdr.status === 'WITHDRAWN') {
      return NextResponse.json({ error: { message: 'This deposit has already been withdrawn' } }, { status: 400 });
    }

    const currentBalance = Number(fdr.account.currentBalance);
    const metrics = calculateFDR(
      Number(fdr.principal),
      Number(fdr.interestRate),
      fdr.tenureMonths,
      fdr.openDate,
      fdr.maturityDate,
      fdr.compoundFrequency as any
    );

    // Liquidate payout amount
    const withdrawalAmount = currentBalance > 0 ? currentBalance : metrics.maturityValue;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Credit payout account
      await tx.account.update({
        where: { id: fdr.payoutAccountId },
        data: { currentBalance: { increment: withdrawalAmount } },
      });

      // 2. Zero out FDR account
      await tx.account.update({
        where: { id: fdr.accountId },
        data: { currentBalance: 0, isActive: false },
      });

      // 3. Mark FDR as WITHDRAWN
      const updatedFdr = await tx.fixedDeposit.update({
        where: { id },
        data: { status: 'WITHDRAWN' },
      });

      // 4. Create Transfer record for audit trail
      await tx.transfer.create({
        data: {
          userId: user.id,
          fromAccountId: fdr.accountId,
          toAccountId: fdr.payoutAccountId,
          amount: withdrawalAmount,
          date: new Date(),
          notes: encrypt(`FDR liquidation and maturity payout: ${fdr.account.name}`),
        },
      });

      return updatedFdr;
    });

    return NextResponse.json({ success: true, fixedDeposit: result });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
