import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { recurringSchema } from '@/lib/validators';
import { getNextRunDate } from '@/lib/services/recurring.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const schedules = await prisma.recurringSchedule.findMany({
    where: { userId: user.id },
    orderBy: { nextRunDate: 'asc' },
    include: {
      account: { select: { id: true, name: true, tier: true, currency: true } },
      category: true,
    },
  });

  const parsed = schedules.map((s) => ({
    ...s,
    amount: Number(s.amount),
  }));

  return NextResponse.json({ schedules: parsed });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = recurringSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message } },
        { status: 400 }
      );
    }

    const { name, type, amount, accountId, categoryId, frequency, intervalCount, startDate, endDate, reminderBufferDays, autoLog } = parsed.data;

    const start = new Date(startDate);
    const schedule = await prisma.recurringSchedule.create({
      data: {
        userId: user.id,
        name: name.trim(),
        type: type as any,
        amount,
        accountId,
        categoryId: categoryId || null,
        frequency: frequency as any,
        intervalCount,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        nextRunDate: start,
        reminderBufferDays,
        autoLog,
      },
      include: {
        account: true,
        category: true,
      },
    });

    return NextResponse.json(
      {
        schedule: {
          ...schedule,
          amount: Number(schedule.amount),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
