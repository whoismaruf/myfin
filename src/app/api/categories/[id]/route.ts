import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, icon, color, parentId } = body;

    const category = await prisma.category.findFirst({
      where: { id, userId: user.id },
    });

    if (!category) {
      return NextResponse.json({ error: { message: 'Category not found' } }, { status: 404 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name ? name.trim() : category.name,
        icon: icon ?? category.icon,
        color: color ?? category.color,
        parentId: parentId !== undefined ? parentId : category.parentId,
      },
      include: {
        children: true,
        parent: true,
      },
    });

    return NextResponse.json({ category: updated });
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
    const category = await prisma.category.findFirst({
      where: { id, userId: user.id },
      include: { children: true },
    });

    if (!category) {
      return NextResponse.json({ error: { message: 'Category not found' } }, { status: 404 });
    }

    // 1. Unlink transactions & recurring schedules
    await prisma.transaction.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await prisma.recurringSchedule.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    // 2. If it has children, delete children or unlink them
    for (const child of category.children) {
      await prisma.transaction.updateMany({
        where: { categoryId: child.id },
        data: { categoryId: null },
      });
      await prisma.recurringSchedule.updateMany({
        where: { categoryId: child.id },
        data: { categoryId: null },
      });
      await prisma.category.delete({ where: { id: child.id } });
    }

    // 3. Delete category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
