import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { onboardingSchema } from '@/lib/validators';
import { seedUserCategories } from '@/lib/defaults';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Strict single-user check: only one user may ever be registered
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json(
        {
          error: {
            code: 'REGISTRATION_LOCKED',
            message: 'An owner has already been configured. Registration is permanently closed.',
          },
        },
        { status: 403 }
      );
    }

    // 2. Validate request body
    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid input',
          },
        },
        { status: 400 }
      );
    }

    const { email, password, currency, name } = parsed.data;

    // 3. Cryptographic salt & hash (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Atomic initialization of User, default categories & subcategories, and starter accounts
    const result = await prisma.$transaction(async (tx) => {
      // Create owner user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          name: name?.trim() || email.split('@')[0],
          passwordHash,
          baseCurrency: currency,
        },
      });

      // Seed starter categories & subcategories
      await seedUserCategories(user.id, tx);

      // Seed starter accounts (LIQUID tier)
      await tx.account.create({
        data: {
          userId: user.id,
          name: 'Primary Checking',
          tier: 'LIQUID',
          subtype: 'CHECKING',
          currency: currency,
          currentBalance: 0,
          openingBalance: 0,
          institution: 'Primary Bank',
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          name: 'Cash in Hand',
          tier: 'LIQUID',
          subtype: 'CASH',
          currency: currency,
          currentBalance: 0,
          openingBalance: 0,
          institution: 'Physical Cash',
        },
      });

      return user;
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          currency: result.baseCurrency,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Onboarding failed:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to complete onboarding',
        },
      },
      { status: 500 }
    );
  }
}
