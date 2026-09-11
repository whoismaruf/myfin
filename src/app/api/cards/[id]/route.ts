import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/crypto';
import { sanitizeCardNumber, encryptCardDetails } from '@/lib/services/card.service';
import { CardNetwork } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const reveal = searchParams.get('reveal') === 'true';

  const card = await prisma.card.findFirst({
    where: { id, userId: user.id, isActive: true },
    include: {
      account: {
        select: { id: true, name: true, currentBalance: true, tier: true, currency: true },
      },
    },
  });

  if (!card) {
    return NextResponse.json({ error: { message: 'Card not found' } }, { status: 404 });
  }

  const decryptedCard = {
    ...card,
    cardNumber: reveal ? decrypt(card.encryptedCardNumber) : `•••• •••• •••• ${card.cardNumberLast4}`,
    cardholderName: decrypt(card.encryptedCardholderName),
    expiry: reveal ? decrypt(card.encryptedExpiry) : '••/••',
    cvv: reveal ? decrypt(card.encryptedCvv) : '•••',
    notes: decrypt(card.encryptedNotes),
    // Remove encrypted fields from response
    encryptedCardNumber: undefined,
    encryptedCardholderName: undefined,
    encryptedExpiry: undefined,
    encryptedCvv: undefined,
    encryptedNotes: undefined,
  };

  return NextResponse.json({ card: decryptedCard });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const card = await prisma.card.findFirst({
      where: { id, userId: user.id },
    });

    if (!card) {
      return NextResponse.json({ error: { message: 'Card not found' } }, { status: 404 });
    }

    const body = await req.json();
    const {
      cardName,
      network,
      color,
      creditLimit,
      currentBalance,
      statementDay,
      dueDay,
      apr,
      minPayment,
      cardNumber,
      cardholderName,
      expiry,
      cvv,
      notes,
    } = body;

    let updateData: any = {};

    if (cardName !== undefined) updateData.cardName = cardName.trim();
    if (network !== undefined && network in CardNetwork) updateData.network = network;
    if (color !== undefined) updateData.color = color;
    if (creditLimit !== undefined) updateData.creditLimit = parseFloat(creditLimit);
    if (currentBalance !== undefined) updateData.currentBalance = parseFloat(currentBalance);
    if (statementDay !== undefined) updateData.statementDay = parseInt(statementDay, 10);
    if (dueDay !== undefined) updateData.dueDay = parseInt(dueDay, 10);
    if (apr !== undefined) updateData.apr = parseFloat(apr);
    if (minPayment !== undefined) updateData.minPayment = parseFloat(minPayment);

    // If sensitive data is updated, re-encrypt
    if (cardNumber && sanitizeCardNumber(cardNumber).length >= 12) {
      const cleanNumber = sanitizeCardNumber(cardNumber);
      updateData.cardNumberLast4 = cleanNumber.slice(-4);
      updateData.encryptedCardNumber = encrypt(cleanNumber);
    }
    if (cardholderName !== undefined) {
      updateData.encryptedCardholderName = encrypt(cardholderName ? cardholderName.trim() : null);
    }
    if (expiry !== undefined) {
      updateData.encryptedExpiry = encrypt(expiry ? expiry.trim() : null);
    }
    if (cvv !== undefined) {
      updateData.encryptedCvv = encrypt(cvv ? cvv.trim() : null);
    }
    if (notes !== undefined) {
      updateData.encryptedNotes = encrypt(notes ? notes.trim() : null);
    }

    const updated = await prisma.card.update({
      where: { id },
      data: updateData,
      include: {
        account: {
          select: { id: true, name: true, currentBalance: true, tier: true },
        },
      },
    });

    return NextResponse.json({ card: updated });
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
    const card = await prisma.card.findFirst({
      where: { id, userId: user.id },
    });

    if (!card) {
      return NextResponse.json({ error: { message: 'Card not found' } }, { status: 404 });
    }

    await prisma.card.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Card deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
