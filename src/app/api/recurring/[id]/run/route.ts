import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { executeRecurringSchedule } from '@/lib/services/recurring.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await executeRecurringSchedule(id, user.id);
    return NextResponse.json({
      success: true,
      transaction: {
        ...result.transaction,
        amount: Number(result.transaction.amount),
      },
      schedule: {
        ...result.schedule,
        amount: Number(result.schedule.amount),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
