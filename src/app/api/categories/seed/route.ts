import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { seedUserCategories } from '@/lib/defaults';

export const dynamic = 'force-dynamic';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const created = await seedUserCategories(user.id);
    return NextResponse.json({ success: true, count: created.length, message: `Loaded ${created.length} new categories and subcategories` });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
