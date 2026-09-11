import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { investmentSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const positions = await prisma.investmentPosition.findMany({
    where: { userId: user.id },
    include: {
      account: { select: { id: true, name: true, tier: true, currency: true } },
      txns: { orderBy: { date: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  let totalPortfolioValue = 0;
  let totalCostBasis = 0;

  const parsed = positions.map((pos) => {
    const qty = Number(pos.quantity);
    const avgPrice = Number(pos.avgPurchasePrice);
    const currPrice = Number(pos.currentPrice);

    const currentValue = Math.round(qty * currPrice * 100) / 100;
    const costBasis = Math.round(qty * avgPrice * 100) / 100;
    const unrealizedPL = Math.round((currentValue - costBasis) * 100) / 100;
    const unrealizedPLPercent = costBasis > 0 ? Math.round(((currentValue - costBasis) / costBasis) * 10000) / 100 : 0;

    totalPortfolioValue += currentValue;
    totalCostBasis += costBasis;

    return {
      ...pos,
      quantity: qty,
      avgPurchasePrice: avgPrice,
      currentPrice: currPrice,
      currentValue,
      costBasis,
      unrealizedPL,
      unrealizedPLPercent,
      txns: pos.txns.map((t) => ({
        ...t,
        quantity: Number(t.quantity),
        price: Number(t.price),
      })),
    };
  });

  const totalGainLoss = Math.round((totalPortfolioValue - totalCostBasis) * 100) / 100;
  const totalGainLossPercent = totalCostBasis > 0 ? Math.round((totalGainLoss / totalCostBasis) * 10000) / 100 : 0;

  return NextResponse.json({
    positions: parsed,
    summary: {
      totalPortfolioValue,
      totalCostBasis,
      totalGainLoss,
      totalGainLossPercent,
    },
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = investmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message } },
        { status: 400 }
      );
    }

    const { accountId, assetName, assetType, quantity, price, date } = parsed.data;

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id },
    });

    if (!account) {
      return NextResponse.json({ error: { message: 'Account not found' } }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find if position already exists for this account & asset
      let position = await tx.investmentPosition.findFirst({
        where: { userId: user.id, accountId, assetName },
      });

      if (position) {
        const oldQty = Number(position.quantity);
        const oldPrice = Number(position.avgPurchasePrice);
        const newQty = oldQty + quantity;
        const newAvgPrice = ((oldQty * oldPrice) + (quantity * price)) / newQty;

        position = await tx.investmentPosition.update({
          where: { id: position.id },
          data: {
            quantity: newQty,
            avgPurchasePrice: newAvgPrice,
            currentPrice: price,
            lastValuationDate: new Date(),
          },
        });
      } else {
        position = await tx.investmentPosition.create({
          data: {
            userId: user.id,
            accountId,
            assetName,
            assetType,
            quantity,
            avgPurchasePrice: price,
            currentPrice: price,
          },
        });
      }

      // Record transaction
      await tx.investmentTxn.create({
        data: {
          positionId: position.id,
          type: 'BUY',
          quantity,
          price,
          date: new Date(date),
        },
      });

      // Update account balance to reflect invested valuation
      const totalPositionVal = Number(position.quantity) * Number(position.currentPrice);
      await tx.account.update({
        where: { id: accountId },
        data: {
          currentBalance: totalPositionVal,
        },
      });

      return position;
    });

    return NextResponse.json({ position: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
