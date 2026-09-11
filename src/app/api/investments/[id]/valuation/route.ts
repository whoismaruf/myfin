import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { valuationSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = valuationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.issues[0]?.message } },
        { status: 400 }
      );
    }

    const { currentPrice } = parsed.data;

    const position = await prisma.investmentPosition.findFirst({
      where: { id, userId: user.id },
    });

    if (!position) {
      return NextResponse.json({ error: { message: 'Position not found' } }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.investmentPosition.update({
        where: { id },
        data: {
          currentPrice,
          lastValuationDate: new Date(),
        },
      });

      // Update parent account balance
      const allPositions = await tx.investmentPosition.findMany({
        where: { accountId: position.accountId },
      });

      const totalVal = allPositions.reduce(
        (sum, p) => sum + (p.id === id ? Number(p.quantity) * currentPrice : Number(p.quantity) * Number(p.currentPrice)),
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
