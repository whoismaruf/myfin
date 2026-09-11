import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/crypto';
import { CardType, CardNetwork } from '@prisma/client';

export interface CardSummaryDTO {
  id: string;
  accountId: string;
  accountName: string;
  accountTier: string;
  cardType: CardType;
  cardName: string;
  network: CardNetwork;
  cardNumberLast4: string;
  maskedNumber: string;
  cardholderName?: string | null;
  expiry?: string | null;
  color: string;
  // For Debit Cards:
  linkedAccountBalance?: number;
  // For Credit Cards:
  creditLimit?: number;
  currentDebt?: number;
  availableCredit?: number;
  utilizationRate?: number;
  statementDay?: number | null;
  dueDay?: number | null;
  minPayment?: number | null;
  apr?: number | null;
  createdAt: string;
}

export interface CreditDebtOverview {
  totalCreditLimit: number;
  totalCreditDebt: number;
  totalAvailableCredit: number;
  overallUtilization: number;
  activeCardsCount: number;
}

export async function getUserCards(userId: string, revealId?: string): Promise<{ cards: CardSummaryDTO[]; overview: CreditDebtOverview }> {
  const cards = await prisma.card.findMany({
    where: { userId, isActive: true },
    include: {
      account: {
        select: {
          id: true,
          name: true,
          tier: true,
          currentBalance: true,
          currency: true,
        },
      },
    },
    orderBy: [{ cardType: 'desc' }, { createdAt: 'desc' }],
  });

  let totalLimit = 0;
  let totalDebt = 0;
  let creditCardCount = 0;

  const dtos: CardSummaryDTO[] = cards.map((card) => {
    const isDebit = card.cardType === 'DEBIT';
    const isCredit = card.cardType === 'CREDIT';
    const isRevealed = revealId === card.id;

    const accountBalance = Number(card.account.currentBalance);
    const creditLimit = Number(card.creditLimit || 0);
    const currentDebt = Number(card.currentBalance || 0);
    const availableCredit = Math.max(0, creditLimit - currentDebt);
    const utilizationRate = creditLimit > 0 ? (currentDebt / creditLimit) * 100 : 0;

    if (isCredit) {
      totalLimit += creditLimit;
      totalDebt += currentDebt;
      creditCardCount++;
    }

    let maskedNumber = `•••• •••• •••• ${card.cardNumberLast4}`;
    let cardholderName = card.encryptedCardholderName ? decrypt(card.encryptedCardholderName) : null;
    let expiry = card.encryptedExpiry ? decrypt(card.encryptedExpiry) : null;

    if (isRevealed) {
      const fullDecrypted = decrypt(card.encryptedCardNumber);
      if (fullDecrypted) {
        // format nicely as chunks of 4
        maskedNumber = fullDecrypted.replace(/(\d{4})/g, '$1 ').trim();
      }
    }

    return {
      id: card.id,
      accountId: card.accountId,
      accountName: card.account.name,
      accountTier: card.account.tier,
      cardType: card.cardType,
      cardName: card.cardName,
      network: card.network,
      cardNumberLast4: card.cardNumberLast4,
      maskedNumber,
      cardholderName,
      expiry,
      color: card.color || 'indigo',
      ...(isDebit
        ? {
            linkedAccountBalance: accountBalance,
          }
        : {
            creditLimit,
            currentDebt,
            availableCredit,
            utilizationRate: Math.round(utilizationRate * 10) / 10,
            statementDay: card.statementDay,
            dueDay: card.dueDay,
            minPayment: card.minPayment ? Number(card.minPayment) : null,
            apr: card.apr ? Number(card.apr) : null,
          }),
      createdAt: card.createdAt.toISOString(),
    };
  });

  const overallUtilization = totalLimit > 0 ? (totalDebt / totalLimit) * 100 : 0;

  return {
    cards: dtos,
    overview: {
      totalCreditLimit: totalLimit,
      totalCreditDebt: totalDebt,
      totalAvailableCredit: Math.max(0, totalLimit - totalDebt),
      overallUtilization: Math.round(overallUtilization * 10) / 10,
      activeCardsCount: creditCardCount,
    },
  };
}

export function sanitizeCardNumber(num: string): string {
  return num.replace(/\s+|-/g, '');
}

export function encryptCardDetails(data: {
  cardNumber: string;
  cardholderName?: string | null;
  expiry?: string | null;
  cvv?: string | null;
  notes?: string | null;
}) {
  const cleanNumber = sanitizeCardNumber(data.cardNumber);
  const last4 = cleanNumber.slice(-4);

  return {
    cardNumberLast4: last4,
    encryptedCardNumber: encrypt(cleanNumber)!,
    encryptedCardholderName: data.cardholderName ? encrypt(data.cardholderName.trim()) : null,
    encryptedExpiry: data.expiry ? encrypt(data.expiry.trim()) : null,
    encryptedCvv: data.cvv ? encrypt(data.cvv.trim()) : null,
    encryptedNotes: data.notes ? encrypt(data.notes.trim()) : null,
  };
}
