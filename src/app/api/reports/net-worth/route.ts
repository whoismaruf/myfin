import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getNetWorthSummary } from '@/lib/services/networth.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    const summary = await getNetWorthSummary(user.id);
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
