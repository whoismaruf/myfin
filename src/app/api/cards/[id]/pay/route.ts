import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { fromAccountId, amount, notes } = body;

    const payAmount = parseFloat(amount);
    if (!payAmount || payAmount <= 0) {
      return NextResponse.json({ error: { message: 'A valid positive payment amount is required' } }, { status: 400 });
    }

    // 1. Fetch card
    const card = await prisma.card.findFirst({
      where: { id, userId: user.id },
    });

    if (!card) {
      return NextResponse.json({ error: { message: 'Card not found' } }, { status: 404 });
    }

    if (card.cardType !== 'CREDIT') {
      return NextResponse.json({ error: { message: 'Payments can only be recorded against CREDIT cards' } }, { status: 400 });
    }

    // 2. Fetch paying account
    const fromAccount = await prisma.account.findFirst({
      where: { id: fromAccountId, userId: user.id },
    });

    if (!fromAccount) {
      return NextResponse.json({ error: { message: 'Payment account not found' } }, { status: 404 });
    }

    if (Number(fromAccount.currentBalance) < payAmount) {
      return NextResponse.json({ error: { message: 'Insufficient funds in paying account' } }, { status: 400 });
    }

    // 3. Execute atomic debt payment
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from paying account
      const updatedFromAccount = await tx.account.update({
        where: { id: fromAccount.id },
        data: {
          currentBalance: {
            decrement: payAmount,
          },
        },
      });

      // Reduce credit card debt balance
      const currentDebt = Number(card.currentBalance || 0);
      const newDebt = Math.max(0, currentDebt - payAmount);

      const updatedCard = await tx.card.update({
        where: { id: card.id },
        data: {
          currentBalance: newDebt,
        },
      });

      // Find or assign category for card payment
      const paymentCategory = await tx.category.findFirst({
        where: { userId: user.id, name: { contains: 'Financial' } },
      });

      // Record transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          accountId: fromAccount.id,
          categoryId: paymentCategory?.id || null,
          type: 'EXPENSE',
          amount: payAmount,
          date: new Date(),
          description: `Credit Card Payment: ${card.cardName} (•••• ${card.cardNumberLast4})`,
          notes: encrypt(notes || `Paid from ${fromAccount.name}`),
          tags: ['Credit Card', 'Debt Payment'],
        },
      });

      return {
        card: updatedCard,
        fromAccount: updatedFromAccount,
        transaction,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully paid ${payAmount} toward ${card.cardName}`,
      result,
    });
  } catch (error: any) {
    console.error('Error paying credit card:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
