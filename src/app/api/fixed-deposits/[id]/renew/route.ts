import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateFDR } from '@/lib/services/interest.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const tenureMonths = Number(body.tenureMonths) || 12;
    const interestRate = body.interestRate !== undefined ? Number(body.interestRate) : undefined;
    const rolloverInterest = Boolean(body.rolloverInterest);

    const fdr = await prisma.fixedDeposit.findFirst({
      where: { id, userId: user.id },
      include: { account: true },
    });

    if (!fdr) {
      return NextResponse.json({ error: { message: 'Fixed deposit not found' } }, { status: 404 });
    }

    const rate = interestRate !== undefined ? interestRate : Number(fdr.interestRate);
    const openDate = new Date();
    const maturityDate = new Date(openDate);
    maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

    // Calculate new principal based on whether interest is rolled over
    const oldPrincipal = Number(fdr.principal);
    const metrics = calculateFDR(
      oldPrincipal,
      Number(fdr.interestRate),
      fdr.tenureMonths,
      fdr.openDate,
      fdr.maturityDate,
      fdr.compoundFrequency as any
    );

    const newPrincipal = rolloverInterest ? metrics.maturityValue : oldPrincipal;
    const newMetrics = calculateFDR(
      newPrincipal,
      rate,
      tenureMonths,
      openDate,
      maturityDate,
      fdr.compoundFrequency as any
    );

    const updated = await prisma.$transaction(async (tx) => {
      // Update account balance
      await tx.account.update({
        where: { id: fdr.accountId },
        data: {
          currentBalance: newPrincipal,
        },
      });

      return await tx.fixedDeposit.update({
        where: { id },
        data: {
          principal: newPrincipal,
          interestRate: rate,
          tenureMonths,
          openDate,
          maturityDate,
          status: 'ACTIVE',
          maturityValue: newMetrics.maturityValue,
        },
        include: { account: true, payoutAccount: true },
      });
    });

    return NextResponse.json({
      fixedDeposit: {
        ...updated,
        principal: Number(updated.principal),
        interestRate: Number(updated.interestRate),
        maturityValue: Number(updated.maturityValue),
        metrics: newMetrics,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
