import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { accountSchema } from '@/lib/validators';
import { encrypt, decrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tier = searchParams.get('tier');

  const whereClause: any = { userId: user.id, isActive: true };
  if (tier) {
    whereClause.tier = tier;
  }

  const accounts = await prisma.account.findMany({
    where: whereClause,
    orderBy: [{ tier: 'asc' }, { name: 'asc' }],
    include: {
      fixedDeposit: true,
      investmentPosition: true,
      cards: {
        where: { isActive: true },
        select: {
          id: true,
          cardName: true,
          cardType: true,
          network: true,
          cardNumberLast4: true,
          creditLimit: true,
          currentBalance: true,
          color: true,
        },
      },
    },
  });

  const decrypted = accounts.map((acc) => ({
    ...acc,
    institution: decrypt(acc.institution),
    currentBalance: Number(acc.currentBalance),
    openingBalance: Number(acc.openingBalance),
    cards: (acc.cards || []).map((c) => ({
      ...c,
      creditLimit: c.creditLimit ? Number(c.creditLimit) : null,
      currentBalance: c.currentBalance ? Number(c.currentBalance) : 0,
    })),
  }));

  return NextResponse.json({ accounts: decrypted });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = accountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message } },
        { status: 400 }
      );
    }

    const { name, tier, subtype, institution, currency, openingBalance } = parsed.data;

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        name: name.trim(),
        tier: tier as any,
        subtype: subtype as any,
        institution: encrypt(institution),
        currency: currency || user.currency || 'BDT',
        openingBalance: openingBalance,
        currentBalance: openingBalance,
      },
    });

    return NextResponse.json(
      {
        account: {
          ...account,
          institution: decrypt(account.institution),
          currentBalance: Number(account.currentBalance),
          openingBalance: Number(account.openingBalance),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
