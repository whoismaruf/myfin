import prisma from '@/lib/prisma';

export interface ForecastEvent {
  date: string;
  scheduleId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  signedAmount: number;
  projectedBalance: number;
}

export interface RiskAlert {
  date: string;
  shortfall: number;
  message: string;
}

export interface ForecastResult {
  horizonDays: number;
  startingLiquidBalance: number;
  endingProjectedBalance: number;
  events: ForecastEvent[];
  riskAlerts: RiskAlert[];
}

export async function generateForecast(
  userId: string,
  horizonDays: number = 30
): Promise<ForecastResult> {
  // 1. Get current liquid balance
  const liquidAccounts = await prisma.account.findMany({
    where: { userId, tier: 'LIQUID', isActive: true },
    select: { currentBalance: true },
  });

  const startingLiquidBalance = liquidAccounts.reduce(
    (sum, acc) => sum + Number(acc.currentBalance),
    0
  );

  // 2. Fetch active recurring rules
  const recurringRules = await prisma.recurringSchedule.findMany({
    where: { userId, isActive: true },
  });

  const now = new Date();
  const endDateHorizon = new Date(now);
  endDateHorizon.setDate(now.getDate() + horizonDays);

  // 3. Project occurrences
  const projectedEvents: Omit<ForecastEvent, 'projectedBalance'>[] = [];

  for (const rule of recurringRules) {
    let nextDate = new Date(rule.nextRunDate);
    const amount = Number(rule.amount);
    const signedAmount = rule.type === 'INCOME' ? amount : -amount;

    while (nextDate <= endDateHorizon) {
      if (rule.endDate && nextDate > new Date(rule.endDate)) {
        break;
      }

      if (nextDate >= now) {
        projectedEvents.push({
          date: nextDate.toISOString().split('T')[0],
          scheduleId: rule.id,
          name: rule.name,
          type: rule.type,
          amount,
          signedAmount,
        });
      }

      // Increment date according to frequency
      const d = new Date(nextDate);
      const interval = rule.intervalCount || 1;
      switch (rule.frequency) {
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
      nextDate = d;
    }
  }

  // Sort events chronologically
  projectedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 4. Calculate running projected balance and detect risk alerts
  let runningBalance = startingLiquidBalance;
  const events: ForecastEvent[] = [];
  const riskAlerts: RiskAlert[] = [];

  for (const ev of projectedEvents) {
    runningBalance += ev.signedAmount;
    events.push({
      ...ev,
      projectedBalance: Math.round(runningBalance * 100) / 100,
    });

    if (runningBalance < 0) {
      riskAlerts.push({
        date: ev.date,
        shortfall: Math.abs(runningBalance),
        message: `Projected liquid balance would drop to ${runningBalance.toFixed(2)} after scheduled "${ev.name}"`,
      });
    }
  }

  return {
    horizonDays,
    startingLiquidBalance,
    endingProjectedBalance: Math.round(runningBalance * 100) / 100,
    events,
    riskAlerts,
  };
}
