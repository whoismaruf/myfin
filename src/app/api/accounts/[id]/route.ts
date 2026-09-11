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
        take: 30,
        include: { category: true },
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

  return NextResponse.json({
    account: {
      ...account,
      institution: decrypt(account.institution),
      currentBalance: Number(account.currentBalance),
      openingBalance: Number(account.openingBalance),
      transactions: decryptedTransactions,
      reconciliations: decryptedReconciliations,
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

    if (body.name) updateData.name = body.name.trim();
    if (body.institution !== undefined) updateData.institution = encrypt(body.institution);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const account = await prisma.account.update({
      where: { id, userId: user.id },
      data: updateData,
    });

    return NextResponse.json({
      account: {
        ...account,
        institution: decrypt(account.institution),
        currentBalance: Number(account.currentBalance),
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
    await prisma.account.update({
      where: { id, userId: user.id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
