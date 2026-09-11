import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { transferSchema } from '@/lib/validators';
import { encrypt, decrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const transfers = await prisma.transfer.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    take: 50,
    include: {
      fromAccount: { select: { id: true, name: true, tier: true, currency: true } },
      toAccount: { select: { id: true, name: true, tier: true, currency: true } },
    },
  });

  const decrypted = transfers.map((t) => ({
    ...t,
    amount: Number(t.amount),
    notes: decrypt(t.notes),
  }));

  return NextResponse.json({ transfers: decrypted });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = transferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message } },
        { status: 400 }
      );
    }

    const { fromAccountId, toAccountId, amount, date, notes } = parsed.data;

    // Verify both accounts belong to user
    const [fromAcc, toAcc] = await Promise.all([
      prisma.account.findFirst({ where: { id: fromAccountId, userId: user.id } }),
      prisma.account.findFirst({ where: { id: toAccountId, userId: user.id } }),
    ]);

    if (!fromAcc || !toAcc) {
      return NextResponse.json({ error: { message: 'Source or destination account not found' } }, { status: 404 });
    }

    // Atomic Zero-Sum Transfer
    const result = await prisma.$transaction(async (tx) => {
      // Debit source account
      await tx.account.update({
        where: { id: fromAccountId },
        data: { currentBalance: { decrement: amount } },
      });

      // Credit destination account
      await tx.account.update({
        where: { id: toAccountId },
        data: { currentBalance: { increment: amount } },
      });

      // Create Transfer record
      const transfer = await tx.transfer.create({
        data: {
          userId: user.id,
          fromAccountId,
          toAccountId,
          amount,
          date: new Date(date),
          notes: encrypt(notes),
        },
        include: {
          fromAccount: { select: { id: true, name: true, tier: true, currency: true } },
          toAccount: { select: { id: true, name: true, tier: true, currency: true } },
        },
      });

      return transfer;
    });

    return NextResponse.json(
      {
        transfer: {
          ...result,
          amount: Number(result.amount),
          notes: decrypt(result.notes),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
