import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.accountId) updateData.accountId = body.accountId;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.frequency) updateData.frequency = body.frequency;
    if (body.intervalCount !== undefined) updateData.intervalCount = Number(body.intervalCount);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.autoLog !== undefined) updateData.autoLog = Boolean(body.autoLog);

    const schedule = await prisma.recurringSchedule.update({
      where: { id, userId: user.id },
      data: updateData,
    });

    return NextResponse.json({
      schedule: {
        ...schedule,
        amount: Number(schedule.amount),
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
    await prisma.recurringSchedule.delete({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
