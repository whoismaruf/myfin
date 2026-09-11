import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { transactionSchema } from '@/lib/validators';
import { encrypt, decrypt } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');
  const categoryId = searchParams.get('categoryId');
  const type = searchParams.get('type');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const q = searchParams.get('q');
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const skip = (page - 1) * limit;

  const where: any = { userId: user.id };

  if (accountId) where.accountId = accountId;
  if (categoryId) where.categoryId = categoryId;
  if (type === 'INCOME' || type === 'EXPENSE') where.type = type;

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  if (q) {
    where.OR = [
      { description: { contains: q, mode: 'insensitive' } },
      { tags: { has: q } },
    ];
  }

  const [totalCount, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      include: {
        account: { select: { id: true, name: true, tier: true, currency: true } },
        category: true,
      },
    }),
  ]);

  const decrypted = transactions.map((t) => ({
    ...t,
    amount: Number(t.amount),
    notes: decrypt(t.notes),
  }));

  return NextResponse.json({
    transactions: decrypted,
    pagination: {
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message } },
        { status: 400 }
      );
    }

    const { accountId, categoryId, type, amount, date, description, notes, tags, recurringScheduleId } = parsed.data;

    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id },
    });

    if (!account) {
      return NextResponse.json({ error: { message: 'Account not found' } }, { status: 404 });
    }

    const balanceDelta = type === 'INCOME' ? amount : -amount;

    // Atomic double-entry update
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          accountId,
          categoryId: categoryId || null,
          type: type as any,
          amount,
          date: new Date(date),
          description: description?.trim() || null,
          notes: encrypt(notes),
          tags: tags || [],
          recurringScheduleId: recurringScheduleId || null,
        },
        include: {
          account: true,
          category: true,
        },
      });

      await tx.account.update({
        where: { id: accountId },
        data: {
          currentBalance: {
            increment: balanceDelta,
          },
        },
      });

      return transaction;
    });

    return NextResponse.json(
      {
        transaction: {
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
