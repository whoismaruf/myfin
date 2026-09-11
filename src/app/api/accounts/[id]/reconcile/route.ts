import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { reconcileSchema } from '@/lib/validators';
import { encrypt, decrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = reconcileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.issues[0]?.message } },
        { status: 400 }
      );
    }

    const { statementBalance, notes } = parsed.data;

    const account = await prisma.account.findFirst({
      where: { id, userId: user.id },
    });

    if (!account) {
      return NextResponse.json({ error: { message: 'Account not found' } }, { status: 404 });
    }

    const currentBalance = Number(account.currentBalance);
    const difference = Math.round((statementBalance - currentBalance) * 100) / 100;

    const log = await prisma.reconciliationLog.create({
      data: {
        accountId: account.id,
        statementBalance,
        appBalance: currentBalance,
        difference,
        notes: encrypt(notes),
      },
    });

    return NextResponse.json(
      {
        log: {
          ...log,
          statementBalance: Number(log.statementBalance),
          appBalance: Number(log.appBalance),
          difference: Number(log.difference),
          notes: decrypt(log.notes),
        },
        isBalanced: difference === 0,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
