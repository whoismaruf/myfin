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

  const account = await prisma.account.findFirst({
    where: { id, userId: user.id },
    include: {
      transactions: {
        orderBy: { date: 'desc' },
        take: 100,
        include: { category: true },
      },
      cards: {
        where: { isActive: true },
      },
      fixedDeposit: true,
      investmentPosition: true,
      reconciliations: {
        orderBy: { reconciledAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!account) {
    return NextResponse.json({ error: { message: 'Account not found' } }, { status: 404 });
  }

  const decryptedTransactions = account.transactions.map((t) => ({
    ...t,
    amount: Number(t.amount),
    notes: decrypt(t.notes),
  }));

  const decryptedReconciliations = account.reconciliations.map((r) => ({
    ...r,
    statementBalance: Number(r.statementBalance),
    appBalance: Number(r.appBalance),
    difference: Number(r.difference),
    notes: decrypt(r.notes),
  }));

  const decryptedCards = (account.cards || []).map((c) => ({
    ...c,
    cardNumberLast4: c.cardNumberLast4,
    cardholderName: decrypt(c.encryptedCardholderName),
    expiry: decrypt(c.encryptedExpiry),
    creditLimit: c.creditLimit ? Number(c.creditLimit) : null,
    currentBalance: c.currentBalance ? Number(c.currentBalance) : 0,
    apr: c.apr ? Number(c.apr) : null,
    minPayment: c.minPayment ? Number(c.minPayment) : null,
  }));

  return NextResponse.json({
    account: {
      ...account,
      institution: decrypt(account.institution),
      accountNumber: decrypt(account.accountNumber),
      description: decrypt(account.description),
      currentBalance: Number(account.currentBalance),
      openingBalance: Number(account.openingBalance),
      transactions: decryptedTransactions,
      reconciliations: decryptedReconciliations,
      cards: decryptedCards,
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
    const body = await req.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.tier !== undefined) updateData.tier = body.tier;
    if (body.subtype !== undefined) updateData.subtype = body.subtype;
    if (body.institution !== undefined) updateData.institution = encrypt(body.institution);
    if (body.accountNumber !== undefined) updateData.accountNumber = encrypt(body.accountNumber);
    if (body.description !== undefined) updateData.description = encrypt(body.description);
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const account = await prisma.account.update({
      where: { id, userId: user.id },
      data: updateData,
    });

    return NextResponse.json({
      account: {
        ...account,
        institution: decrypt(account.institution),
        accountNumber: decrypt(account.accountNumber),
        description: decrypt(account.description),
        currentBalance: Number(account.currentBalance),
        openingBalance: Number(account.openingBalance),
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
    // Check if account has transactions or transfers
    const [txCount, transferCount] = await Promise.all([
      prisma.transaction.count({ where: { accountId: id } }),
      prisma.transfer.count({
        where: {
          OR: [{ fromAccountId: id }, { toAccountId: id }],
        },
      }),
    ]);

    if (txCount > 0 || transferCount > 0) {
      // Soft-delete to preserve transaction history integrity
      await prisma.account.update({
        where: { id, userId: user.id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: 'Account archived (has linked transactions/transfers)',
      });
    } else {
      // Hard delete cleanly if no transactions exist
      await prisma.account.delete({
        where: { id, userId: user.id },
      });
      return NextResponse.json({
        success: true,
        message: 'Account deleted successfully',
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
