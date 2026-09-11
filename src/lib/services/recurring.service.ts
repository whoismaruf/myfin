import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';

/**
 * Calculates next run date based on frequency and interval.
 */
export function getNextRunDate(
  currentDate: Date,
  frequency: string,
  intervalCount: number = 1
): Date {
  const d = new Date(currentDate);
  const interval = intervalCount || 1;

  switch (frequency) {
    case 'DAILY':
      d.setDate(d.getDate() + interval);
      break;
    case 'WEEKLY':
      d.setDate(d.getDate() + 7 * interval);
      break;
    case 'BIWEEKLY':
      d.setDate(d.getDate() + 14 * interval);
      break;
    case 'MONTHLY':
      d.setMonth(d.getMonth() + interval);
      break;
    case 'QUARTERLY':
      d.setMonth(d.getMonth() + 3 * interval);
      break;
    case 'ANNUAL':
      d.setFullYear(d.getFullYear() + interval);
      break;
    default:
      d.setMonth(d.getMonth() + interval);
      break;
  }

  return d;
}

/**
 * Executes a recurring schedule item:
 * 1. Creates a Transaction linked to this schedule.
 * 2. Mutates account.currentBalance atomically.
 * 3. Advances schedule.nextRunDate.
 */
export async function executeRecurringSchedule(scheduleId: string, userId: string) {
  return await prisma.$transaction(async (tx) => {
    const schedule = await tx.recurringSchedule.findFirst({
      where: { id: scheduleId, userId, isActive: true },
      include: { account: true },
    });

    if (!schedule) {
      throw new Error('Recurring schedule not found or inactive');
    }

    const amount = Number(schedule.amount);
    const balanceDelta = schedule.type === 'INCOME' ? amount : -amount;

    // 1. Create Transaction
    const transaction = await tx.transaction.create({
      data: {
        userId,
        accountId: schedule.accountId,
        categoryId: schedule.categoryId,
        type: schedule.type,
        amount: schedule.amount,
        date: new Date(),
        description: `Recurring: ${schedule.name}`,
        notes: encrypt(`Auto-logged from recurring schedule: ${schedule.name}`),
        recurringScheduleId: schedule.id,
      },
    });

    // 2. Update Account Balance
    await tx.account.update({
      where: { id: schedule.accountId },
      data: {
        currentBalance: {
          increment: balanceDelta,
        },
      },
    });

    // 3. Advance nextRunDate
    const nextDate = getNextRunDate(schedule.nextRunDate, schedule.frequency, schedule.intervalCount);
    let isActive = true;
    if (schedule.endDate && nextDate > new Date(schedule.endDate)) {
      isActive = false;
    }

    const updatedSchedule = await tx.recurringSchedule.update({
      where: { id: schedule.id },
      data: {
        nextRunDate: nextDate,
        isActive,
      },
    });

    return { transaction, schedule: updatedSchedule };
  });
}
