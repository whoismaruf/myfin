import { z } from 'zod';

export const onboardingSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  currency: z.enum(['BDT', 'USD', 'GBP']).default('BDT'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  tier: z.enum(['LIQUID', 'LOCKED', 'GROWTH']),
  subtype: z.enum([
    'CHECKING',
    'SAVINGS',
    'CASH',
    'WALLET',
    'FDR',
    'DPS',
    'CERTIFICATE_OF_DEPOSIT',
    'EQUITY',
    'MUTUAL_FUND',
    'COMMODITY',
    'INDEX',
  ]),
  institution: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  currency: z.string().default('BDT'),
  openingBalance: z.coerce.number().default(0),
});

export const transactionSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().optional().nullable(),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().or(z.date()),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  recurringScheduleId: z.string().optional().nullable(),
});

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Source account is required'),
  toAccountId: z.string().min(1, 'Destination account is required'),
  amount: z.coerce.number().positive('Transfer amount must be positive'),
  date: z.string().or(z.date()),
  notes: z.string().optional().nullable(),
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: "Source and destination accounts cannot be the same",
  path: ["toAccountId"],
});

export const recurringSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive('Amount must be positive'),
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().optional().nullable(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'CUSTOM']),
  intervalCount: z.coerce.number().int().positive().default(1),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  reminderBufferDays: z.coerce.number().int().min(0).default(3),
  autoLog: z.boolean().default(false),
});

export const fixedDepositSchema = z.object({
  name: z.string().min(1, 'Deposit name or reference is required'),
  institution: z.string().optional().nullable(),
  principal: z.coerce.number().positive('Principal must be greater than 0'),
  interestRate: z.coerce.number().positive('Interest rate must be positive'),
  tenureMonths: z.coerce.number().int().positive('Tenure must be at least 1 month'),
  compoundFrequency: z.enum(['SIMPLE', 'MONTHLY', 'QUARTERLY', 'AT_MATURITY']).default('SIMPLE'),
  openDate: z.string().or(z.date()),
  payoutAccountId: z.string().min(1, 'Payout account is required'),
});

export const investmentSchema = z.object({
  accountId: z.string().min(1, 'Investment account is required'),
  assetName: z.string().min(1, 'Asset name is required'),
  assetType: z.enum(['EQUITY', 'MUTUAL_FUND', 'COMMODITY', 'INDEX']),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  price: z.coerce.number().positive('Price must be positive'),
  date: z.string().or(z.date()).default(() => new Date().toISOString()),
});

export const valuationSchema = z.object({
  currentPrice: z.coerce.number().positive('Price must be positive'),
});

export const reconcileSchema = z.object({
  statementBalance: z.coerce.number(),
  notes: z.string().optional().nullable(),
});
