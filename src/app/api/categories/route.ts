import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, type, icon, color, parentId } = body;

    if (!name || !type) {
      return NextResponse.json({ error: { message: 'Name and type are required' } }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name: name.trim(),
        type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        icon: icon || 'Tag',
        color: color || '#10B981',
        parentId: parentId || null,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
