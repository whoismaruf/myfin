import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateForecast } from '@/lib/services/forecast.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = Math.min(180, Math.max(7, Number(searchParams.get('days')) || 30));

  try {
    const forecast = await generateForecast(user.id, days);
    return NextResponse.json(forecast);
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
