import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getUserCards, encryptCardDetails, sanitizeCardNumber } from '@/lib/services/card.service';
import { CardType, CardNetwork } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const revealId = searchParams.get('revealId') || undefined;

  try {
    const data = await getUserCards(user.id, revealId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      accountId,
      cardType,
      cardName,
      network = 'VISA',
      cardNumber,
      cardholderName,
      expiry,
      cvv,
      color = 'indigo',
      creditLimit,
      currentBalance,
      statementDay,
      dueDay,
      apr,
      minPayment,
      notes,
    } = body;

    // Validation
    if (!accountId) {
      return NextResponse.json({ error: { message: 'Account is required' } }, { status: 400 });
    }
    if (!cardName || !cardName.trim()) {
      return NextResponse.json({ error: { message: 'Card name is required' } }, { status: 400 });
    }
    if (!cardNumber || sanitizeCardNumber(cardNumber).length < 12) {
      return NextResponse.json({ error: { message: 'A valid card number is required' } }, { status: 400 });
    }
    if (!['DEBIT', 'CREDIT'].includes(cardType)) {
      return NextResponse.json({ error: { message: 'Card type must be DEBIT or CREDIT' } }, { status: 400 });
    }

    // Verify account belongs to current user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id },
    });
    if (!account) {
      return NextResponse.json({ error: { message: 'Account not found or access denied' } }, { status: 404 });
    }

    // Encrypt sensitive card details with AES-256-GCM
    const encrypted = encryptCardDetails({
      cardNumber,
      cardholderName,
      expiry,
      cvv,
      notes,
    });

    const isCredit = cardType === 'CREDIT';

    const card = await prisma.card.create({
      data: {
        userId: user.id,
        accountId: account.id,
        cardType: cardType as CardType,
        cardName: cardName.trim(),
        network: (network in CardNetwork ? network : 'VISA') as CardNetwork,
        cardNumberLast4: encrypted.cardNumberLast4,
        encryptedCardNumber: encrypted.encryptedCardNumber,
        encryptedCardholderName: encrypted.encryptedCardholderName,
        encryptedExpiry: encrypted.encryptedExpiry,
        encryptedCvv: encrypted.encryptedCvv,
        encryptedNotes: encrypted.encryptedNotes,
        color: color || 'indigo',
        creditLimit: isCredit && creditLimit ? parseFloat(creditLimit) : null,
        currentBalance: isCredit && currentBalance ? parseFloat(currentBalance) : 0,
        statementDay: isCredit && statementDay ? parseInt(statementDay, 10) : null,
        dueDay: isCredit && dueDay ? parseInt(dueDay, 10) : null,
        apr: isCredit && apr ? parseFloat(apr) : null,
        minPayment: isCredit && minPayment ? parseFloat(minPayment) : null,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            currentBalance: true,
            tier: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, card }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating card:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
