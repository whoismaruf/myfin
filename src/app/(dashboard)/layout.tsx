import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import DashboardShell from '@/components/layout/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. First-run check: redirect to onboarding if 0 users exist
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    redirect('/onboarding');
  }

  // 2. Auth check: redirect to login if session missing
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
