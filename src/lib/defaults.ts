export interface DefaultCategory {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Income
  { name: 'Salary', type: 'INCOME', icon: 'Briefcase', color: '#10B981' },
  { name: 'Freelance & Consulting', type: 'INCOME', icon: 'Laptop', color: '#059669' },
  { name: 'Investments & Dividends', type: 'INCOME', icon: 'TrendingUp', color: '#047857' },
  { name: 'Other Income', type: 'INCOME', icon: 'PlusCircle', color: '#065F46' },

  // Expense
  { name: 'Groceries & Household', type: 'EXPENSE', icon: 'ShoppingCart', color: '#F97316' },
  { name: 'Rent & Housing', type: 'EXPENSE', icon: 'Home', color: '#EF4444' },
  { name: 'Utilities & Bills', type: 'EXPENSE', icon: 'Zap', color: '#EAB308' },
  { name: 'Food & Dining Out', type: 'EXPENSE', icon: 'Utensils', color: '#EC4899' },
  { name: 'Transport & Travel', type: 'EXPENSE', icon: 'Car', color: '#6366F1' },
  { name: 'Subscriptions & Software', type: 'EXPENSE', icon: 'Tv', color: '#8B5CF6' },
  { name: 'Health & Medical', type: 'EXPENSE', icon: 'HeartPulse', color: '#14B8A6' },
  { name: 'Shopping & Personal', type: 'EXPENSE', icon: 'ShoppingBag', color: '#F43F5E' },
  { name: 'General Expense', type: 'EXPENSE', icon: 'MoreHorizontal', color: '#6B7280' },
];
