import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const sellQty = Number(body.quantity);
    const sellPrice = Number(body.price);

    if (isNaN(sellQty) || sellQty <= 0) {
      return NextResponse.json({ error: { message: 'Valid quantity required' } }, { status: 400 });
    }

    const position = await prisma.investmentPosition.findFirst({
      where: { id, userId: user.id },
    });

    if (!position) {
      return NextResponse.json({ error: { message: 'Position not found' } }, { status: 404 });
    }

    const currentQty = Number(position.quantity);
    if (sellQty > currentQty) {
      return NextResponse.json({ error: { message: 'Cannot sell more than held quantity' } }, { status: 400 });
    }

    const remainingQty = currentQty - sellQty;

    const result = await prisma.$transaction(async (tx) => {
      // Record SELL transaction
      await tx.investmentTxn.create({
        data: {
          positionId: position.id,
          type: 'SELL',
          quantity: sellQty,
          price: sellPrice || Number(position.currentPrice),
          date: new Date(),
        },
      });

      // Update position
      const updated = await tx.investmentPosition.update({
        where: { id },
        data: {
          quantity: remainingQty,
          lastValuationDate: new Date(),
        },
      });

      // Update parent account balance
      const allPositions = await tx.investmentPosition.findMany({
        where: { accountId: position.accountId },
      });

      const totalVal = allPositions.reduce(
        (sum, p) => sum + (p.id === id ? remainingQty * Number(p.currentPrice) : Number(p.quantity) * Number(p.currentPrice)),
        0
      );

      await tx.account.update({
        where: { id: position.accountId },
        data: { currentBalance: totalVal },
      });

      return updated;
    });

    return NextResponse.json({ position: result });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
