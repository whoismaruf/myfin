import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: user.id },
    include: { account: true, category: true },
  });

  if (!transaction) {
    return NextResponse.json({ error: { message: 'Transaction not found' } }, { status: 404 });
  }

  return NextResponse.json({
    transaction: {
      ...transaction,
      amount: Number(transaction.amount),
      notes: decrypt(transaction.notes),
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: { message: 'Transaction not found' } }, { status: 404 });
    }

    const body = await req.json();
    const newAmount = body.amount !== undefined ? Number(body.amount) : Number(existing.amount);
    const newType = body.type || existing.type;
    const newAccountId = body.accountId || existing.accountId;

    // Calculate balance effect delta
    const oldEffect = existing.type === 'INCOME' ? Number(existing.amount) : -Number(existing.amount);
    const newEffect = newType === 'INCOME' ? newAmount : -newAmount;

    const result = await prisma.$transaction(async (tx) => {
      // If account changed, reverse from old and apply to new
      if (newAccountId !== existing.accountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { currentBalance: { decrement: oldEffect } },
        });
        await tx.account.update({
          where: { id: newAccountId },
          data: { currentBalance: { increment: newEffect } },
        });
      } else {
        const netDelta = newEffect - oldEffect;
        if (netDelta !== 0) {
          await tx.account.update({
            where: { id: existing.accountId },
            data: { currentBalance: { increment: netDelta } },
          });
        }
      }

      const updated = await tx.transaction.update({
        where: { id },
        data: {
          accountId: newAccountId,
          categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
          type: newType,
          amount: newAmount,
          date: body.date ? new Date(body.date) : existing.date,
          description: body.description !== undefined ? body.description : existing.description,
          notes: body.notes !== undefined ? encrypt(body.notes) : existing.notes,
          tags: body.tags !== undefined ? body.tags : existing.tags,
        },
        include: { account: true, category: true },
      });

      return updated;
    });

    return NextResponse.json({
      transaction: {
        ...result,
        amount: Number(result.amount),
        notes: decrypt(result.notes),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: { message: 'Transaction not found' } }, { status: 404 });
    }

    const oldEffect = existing.type === 'INCOME' ? Number(existing.amount) : -Number(existing.amount);

    await prisma.$transaction(async (tx) => {
      // Revert balance impact on account
      await tx.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { decrement: oldEffect } },
      });

      await tx.transaction.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
