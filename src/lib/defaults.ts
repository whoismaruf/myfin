import prisma from '@/lib/prisma';

export interface DefaultSubcategory {
  name: string;
  icon?: string;
  color?: string;
}

export interface DefaultCategory {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  subcategories: DefaultSubcategory[];
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // ── INCOME CATEGORIES ──
  {
    name: 'Salary & Wages',
    type: 'INCOME',
    icon: 'Briefcase',
    color: '#10B981',
    subcategories: [
      { name: 'Base Salary', icon: 'Briefcase', color: '#10B981' },
      { name: 'Performance Bonus', icon: 'Sparkles', color: '#059669' },
      { name: 'Overtime & Allowances', icon: 'PlusCircle', color: '#34D399' },
      { name: 'Commission', icon: 'TrendingUp', color: '#6EE7B7' },
    ],
  },
  {
    name: 'Business & Freelance',
    type: 'INCOME',
    icon: 'Laptop',
    color: '#059669',
    subcategories: [
      { name: 'Client Invoices', icon: 'Laptop', color: '#059669' },
      { name: 'Consulting Fees', icon: 'Briefcase', color: '#10B981' },
      { name: 'Digital Products', icon: 'Layers', color: '#047857' },
      { name: 'Contract Work', icon: 'Building', color: '#065F46' },
    ],
  },
  {
    name: 'Investments & Dividends',
    type: 'INCOME',
    icon: 'TrendingUp',
    color: '#047857',
    subcategories: [
      { name: 'Stock Dividends', icon: 'TrendingUp', color: '#047857' },
      { name: 'FDR Interest Payout', icon: 'Landmark', color: '#059669' },
      { name: 'Capital Gains', icon: 'Sparkles', color: '#10B981' },
      { name: 'Rental Income', icon: 'Home', color: '#065F46' },
    ],
  },
  {
    name: 'Other Income',
    type: 'INCOME',
    icon: 'PlusCircle',
    color: '#065F46',
    subcategories: [
      { name: 'Cashbacks & Rewards', icon: 'CreditCard', color: '#10B981' },
      { name: 'Gifts Received', icon: 'Heart', color: '#059669' },
      { name: 'Refunds & Reimbursements', icon: 'ArrowRightLeft', color: '#34D399' },
      { name: 'Miscellaneous Income', icon: 'MoreHorizontal', color: '#047857' },
    ],
  },

  // ── EXPENSE CATEGORIES ──
  {
    name: 'Housing & Rent',
    type: 'EXPENSE',
    icon: 'Home',
    color: '#EF4444',
    subcategories: [
      { name: 'House Rent / Mortgage', icon: 'Home', color: '#EF4444' },
      { name: 'Home Repairs & Maintenance', icon: 'Building', color: '#DC2626' },
      { name: 'Furniture & Decor', icon: 'Layers', color: '#F87171' },
      { name: 'Property Tax', icon: 'Landmark', color: '#B91C1C' },
    ],
  },
  {
    name: 'Utilities & Bills',
    type: 'EXPENSE',
    icon: 'Zap',
    color: '#EAB308',
    subcategories: [
      { name: 'Electricity Bill', icon: 'Zap', color: '#EAB308' },
      { name: 'Water & Gas', icon: 'Layers', color: '#CA8A04' },
      { name: 'Internet & WiFi', icon: 'Tv', color: '#FACC15' },
      { name: 'Mobile / Phone Bill', icon: 'Laptop', color: '#A16207' },
    ],
  },
  {
    name: 'Food & Groceries',
    type: 'EXPENSE',
    icon: 'ShoppingCart',
    color: '#F97316',
    subcategories: [
      { name: 'Supermarket & Groceries', icon: 'ShoppingCart', color: '#F97316' },
      { name: 'Fresh Bazar & Meat', icon: 'ShoppingCart', color: '#EA580C' },
      { name: 'Snacks & Beverages', icon: 'Coffee', color: '#FB923C' },
      { name: 'Household Supplies', icon: 'Home', color: '#C2410C' },
    ],
  },
  {
    name: 'Dining Out & Cafes',
    type: 'EXPENSE',
    icon: 'Utensils',
    color: '#EC4899',
    subcategories: [
      { name: 'Restaurants & Diners', icon: 'Utensils', color: '#EC4899' },
      { name: 'Coffee & Cafes', icon: 'Coffee', color: '#DB2777' },
      { name: 'Food Delivery (Uber/Foodpanda)', icon: 'Car', color: '#F472B6' },
      { name: 'Fast Food', icon: 'Utensils', color: '#BE185D' },
    ],
  },
  {
    name: 'Transportation & Travel',
    type: 'EXPENSE',
    icon: 'Car',
    color: '#6366F1',
    subcategories: [
      { name: 'Fuel & CNG', icon: 'Zap', color: '#6366F1' },
      { name: 'Rideshare (Uber/Pathao)', icon: 'Car', color: '#4F46E5' },
      { name: 'Public Transit (Bus/Train)', icon: 'Car', color: '#818CF8' },
      { name: 'Vehicle Maintenance & Tolls', icon: 'Shield', color: '#4338CA' },
    ],
  },
  {
    name: 'Shopping & Personal',
    type: 'EXPENSE',
    icon: 'ShoppingBag',
    color: '#F43F5E',
    subcategories: [
      { name: 'Clothing & Apparel', icon: 'ShoppingBag', color: '#F43F5E' },
      { name: 'Electronics & Gadgets', icon: 'Laptop', color: '#E11D48' },
      { name: 'Personal Care & Grooming', icon: 'Sparkles', color: '#FB7185' },
      { name: 'Footwear & Bags', icon: 'ShoppingBag', color: '#BE123C' },
    ],
  },
  {
    name: 'Health & Medical',
    type: 'EXPENSE',
    icon: 'HeartPulse',
    color: '#14B8A6',
    subcategories: [
      { name: 'Doctor Consultations', icon: 'HeartPulse', color: '#14B8A6' },
      { name: 'Medicines & Pharmacy', icon: 'HeartPulse', color: '#0D9488' },
      { name: 'Diagnostic Tests & Labs', icon: 'Layers', color: '#2DD4BF' },
      { name: 'Health & Life Insurance', icon: 'Shield', color: '#0F766E' },
    ],
  },
  {
    name: 'Subscriptions & Software',
    type: 'EXPENSE',
    icon: 'Tv',
    color: '#8B5CF6',
    subcategories: [
      { name: 'Streaming (Netflix/Spotify)', icon: 'Tv', color: '#8B5CF6' },
      { name: 'Software & Cloud Tools', icon: 'Laptop', color: '#7C3AED' },
      { name: 'Gym & Fitness Membership', icon: 'HeartPulse', color: '#A78BFA' },
      { name: 'Domain & Hosting', icon: 'Layers', color: '#6D28D9' },
    ],
  },
  {
    name: 'Education & Learning',
    type: 'EXPENSE',
    icon: 'GraduationCap',
    color: '#3B82F6',
    subcategories: [
      { name: 'Tuition & Academic Fees', icon: 'GraduationCap', color: '#3B82F6' },
      { name: 'Books & Learning Materials', icon: 'Tag', color: '#2563EB' },
      { name: 'Online Courses & Certifications', icon: 'Laptop', color: '#60A5FA' },
    ],
  },
  {
    name: 'Financial & Card Fees',
    type: 'EXPENSE',
    icon: 'CreditCard',
    color: '#64748B',
    subcategories: [
      { name: 'Credit Card Annual Fee', icon: 'CreditCard', color: '#64748B' },
      { name: 'Bank Charges & Government VAT', icon: 'Landmark', color: '#475569' },
      { name: 'Interest & Finance Charges', icon: 'TrendingUp', color: '#94A3B8' },
    ],
  },
  {
    name: 'Entertainment & Leisure',
    type: 'EXPENSE',
    icon: 'Gamepad2',
    color: '#A855F7',
    subcategories: [
      { name: 'Movies, Events & Outings', icon: 'Sparkles', color: '#A855F7' },
      { name: 'Vacation & Weekend Trips', icon: 'Car', color: '#9333EA' },
      { name: 'Gaming & Hobbies', icon: 'Gamepad2', color: '#C084FC' },
    ],
  },
  {
    name: 'Charity & Gifts',
    type: 'EXPENSE',
    icon: 'Heart',
    color: '#D946EF',
    subcategories: [
      { name: 'Zakat & Sadqah', icon: 'Heart', color: '#D946EF' },
      { name: 'Donations & Non-Profit', icon: 'Heart', color: '#C026D3' },
      { name: 'Gifts for Family & Friends', icon: 'Sparkles', color: '#E879F9' },
    ],
  },
];

export async function seedUserCategories(userId: string, customPrisma?: any) {
  const db = customPrisma || prisma;

  // Retrieve existing categories to prevent duplicates
  const existing = await db.category.findMany({
    where: { userId },
    select: { id: true, name: true, parentId: true },
  });

  const existingMap = new Map<string, string>();
  for (const cat of existing) {
    const key = `${cat.name.toLowerCase()}:${cat.parentId || 'root'}`;
    existingMap.set(key, cat.id);
  }

  const createdCategories: any[] = [];

  // 1. Create root categories if missing
  for (const catDef of DEFAULT_CATEGORIES) {
    const rootKey = `${catDef.name.toLowerCase()}:root`;
    let parentId: string | undefined = existingMap.get(rootKey);

    if (!parentId) {
      const parent = await db.category.create({
        data: {
          userId,
          name: catDef.name,
          type: catDef.type,
          icon: catDef.icon,
          color: catDef.color,
          parentId: null,
        },
      });
      parentId = parent.id;
      existingMap.set(rootKey, parent.id);
      createdCategories.push(parent);
    }
  }

  // 2. Batch create all missing subcategories using createMany
  const subcategoriesToCreate: any[] = [];
  for (const catDef of DEFAULT_CATEGORIES) {
    const rootKey = `${catDef.name.toLowerCase()}:root`;
    const parentId = existingMap.get(rootKey);
    if (!parentId) continue;

    for (const sub of catDef.subcategories) {
      const subKey = `${sub.name.toLowerCase()}:${parentId}`;
      if (!existingMap.has(subKey)) {
        subcategoriesToCreate.push({
          userId,
          name: sub.name,
          type: catDef.type,
          icon: sub.icon || catDef.icon,
          color: sub.color || catDef.color,
          parentId: parentId,
        });
      }
    }
  }

  if (subcategoriesToCreate.length > 0) {
    await db.category.createMany({
      data: subcategoriesToCreate,
    });
    createdCategories.push(...subcategoriesToCreate);
  }

  return createdCategories;
}

