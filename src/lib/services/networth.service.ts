import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';

export interface NetWorthSummary {
  totalLiquid: number;
  totalLocked: number;
  totalInvested: number;
  grossAssets: number;
  totalCreditDebt: number;
  netWorth: number;
  currency: string;
  accountsByTier: {
    LIQUID: any[];
    LOCKED: any[];
    GROWTH: any[];
  };
}

export async function getNetWorthSummary(userId: string): Promise<NetWorthSummary> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { baseCurrency: true },
  });

  const currency = user?.baseCurrency || 'BDT';

  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true },
    include: {
      fixedDeposit: true,
      investmentPosition: true,
      cards: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate credit debt
  const creditCards = await prisma.card.findMany({
    where: { userId, cardType: 'CREDIT', isActive: true },
    select: { currentBalance: true },
  });

  const totalCreditDebt = creditCards.reduce((sum, card) => sum + Number(card.currentBalance || 0), 0);

  let totalLiquid = 0;
  let totalLocked = 0;
  let totalInvested = 0;

  const accountsByTier: { LIQUID: any[]; LOCKED: any[]; GROWTH: any[] } = {
    LIQUID: [],
    LOCKED: [],
    GROWTH: [],
  };

  for (const acc of accounts) {
    const balance = Number(acc.currentBalance);
    const sanitizedAccount = {
      ...acc,
      institution: decrypt(acc.institution),
      currentBalance: balance,
      openingBalance: Number(acc.openingBalance),
    };

    if (acc.tier === 'LIQUID') {
      totalLiquid += balance;
      accountsByTier.LIQUID.push(sanitizedAccount);
    } else if (acc.tier === 'LOCKED') {
      totalLocked += balance;
      accountsByTier.LOCKED.push(sanitizedAccount);
    } else if (acc.tier === 'GROWTH') {
      totalInvested += balance;
      accountsByTier.GROWTH.push(sanitizedAccount);
    }
  }

  const grossAssets = totalLiquid + totalLocked + totalInvested;
  const netWorth = grossAssets - totalCreditDebt;

  return {
    totalLiquid,
    totalLocked,
    totalInvested,
    grossAssets,
    totalCreditDebt,
    netWorth,
    currency,
    accountsByTier,
  };
}
