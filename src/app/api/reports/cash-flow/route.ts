import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Fetch transactions strictly excluding transfers
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: sixMonthsAgo },
      },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    // 1. Monthly series aggregation
    const monthlyMap: Record<string, { month: string; income: number; expense: number; net: number }> = {};

    // Initialize past 6 months in chronological order
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      monthlyMap[key] = { month: monthLabel, income: 0, expense: 0, net: 0 };
    }

    // 2. Category distribution
    const categoryMap: Record<string, { name: string; color: string; amount: number }> = {};
    let totalExpenseAllTime = 0;
    let totalIncomeAllTime = 0;

    for (const t of transactions) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const amt = Number(t.amount);

      if (monthlyMap[key]) {
        if (t.type === 'INCOME') {
          monthlyMap[key].income += amt;
          totalIncomeAllTime += amt;
        } else {
          monthlyMap[key].expense += amt;
          totalExpenseAllTime += amt;

          const catName = t.category?.name || 'Uncategorized';
          const catColor = t.category?.color || '#9CA3AF';
          if (!categoryMap[catName]) {
            categoryMap[catName] = { name: catName, color: catColor, amount: 0 };
          }
          categoryMap[catName].amount += amt;
        }
        monthlyMap[key].net = monthlyMap[key].income - monthlyMap[key].expense;
      }
    }

    const monthlySeries = Object.values(monthlyMap);
    const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);

    return NextResponse.json({
      monthlySeries,
      categoryBreakdown,
      totals: {
        totalIncome: Math.round(totalIncomeAllTime * 100) / 100,
        totalExpense: Math.round(totalExpenseAllTime * 100) / 100,
        netCashFlow: Math.round((totalIncomeAllTime - totalExpenseAllTime) * 100) / 100,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
