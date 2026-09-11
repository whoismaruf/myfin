import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { fixedDepositSchema } from '@/lib/validators';
import { calculateFDR } from '@/lib/services/interest.service';
import { encrypt, decrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const deposits = await prisma.fixedDeposit.findMany({
    where: { userId: user.id },
    orderBy: { maturityDate: 'asc' },
    include: {
      account: true,
      payoutAccount: { select: { id: true, name: true, tier: true, currency: true } },
    },
  });

  const parsed = deposits.map((d) => {
    const fdrMetrics = calculateFDR(
      Number(d.principal),
      Number(d.interestRate),
      d.tenureMonths,
      d.openDate,
      d.maturityDate,
      d.compoundFrequency as any
    );

    return {
      ...d,
      institution: decrypt(d.institution),
      principal: Number(d.principal),
      interestRate: Number(d.interestRate),
      maturityValue: fdrMetrics.maturityValue,
      metrics: fdrMetrics,
    };
  });

  return NextResponse.json({ fixedDeposits: parsed });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = fixedDepositSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message } },
        { status: 400 }
      );
    }

    const { name, institution, principal, interestRate, tenureMonths, compoundFrequency, openDate, payoutAccountId } = parsed.data;

    const open = new Date(openDate);
    const maturity = new Date(open);
    maturity.setMonth(maturity.getMonth() + tenureMonths);

    const fdrMetrics = calculateFDR(principal, interestRate, tenureMonths, open, maturity, compoundFrequency as any);

    // Create LOCKED-tier account + FixedDeposit record atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create LOCKED Account
      const account = await tx.account.create({
        data: {
          userId: user.id,
          name: name.trim(),
          tier: 'LOCKED',
          subtype: 'FDR',
          institution: encrypt(institution),
          currency: user.currency || 'BDT',
          openingBalance: principal,
          currentBalance: principal,
        },
      });

      // 2. Create FixedDeposit record
      const fdr = await tx.fixedDeposit.create({
        data: {
          userId: user.id,
          accountId: account.id,
          institution: encrypt(institution),
          principal,
          interestRate,
          tenureMonths,
          compoundFrequency: compoundFrequency as any,
          openDate: open,
          maturityDate: maturity,
          payoutAccountId,
          status: 'ACTIVE',
          maturityValue: fdrMetrics.maturityValue,
        },
        include: {
          account: true,
          payoutAccount: true,
        },
      });

      return fdr;
    });

    return NextResponse.json(
      {
        fixedDeposit: {
          ...result,
          institution: decrypt(result.institution),
          principal: Number(result.principal),
          interestRate: Number(result.interestRate),
          maturityValue: Number(result.maturityValue),
          metrics: fdrMetrics,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
