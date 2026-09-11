import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      isOnboarded: userCount > 0,
    });
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return NextResponse.json(
      { error: { message: 'Database query failed' } },
      { status: 500 }
    );
  }
}
