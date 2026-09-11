import React from 'react';
import {
  Briefcase,
  ShoppingCart,
  Home,
  Zap,
  Utensils,
  Car,
  Tv,
  HeartPulse,
  ShoppingBag,
  TrendingUp,
  Wallet,
  Laptop,
  PlusCircle,
  MoreHorizontal,
  ArrowRightLeft,
  DollarSign,
  Landmark,
  Building,
  CreditCard,
  Layers,
  GraduationCap,
  Gamepad2,
  Heart,
  Coffee,
  Tag,
  Sparkles,
  Shield,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Briefcase,
  ShoppingCart,
  Home,
  Zap,
  Utensils,
  Car,
  Tv,
  HeartPulse,
  ShoppingBag,
  TrendingUp,
  Wallet,
  Laptop,
  PlusCircle,
  MoreHorizontal,
  ArrowRightLeft,
  DollarSign,
  Landmark,
  Building,
  CreditCard,
  Layers,
  GraduationCap,
  Gamepad2,
  Heart,
  Coffee,
  Tag,
  Sparkles,
  Shield,
};

interface CategoryIconProps {
  name?: string | null;
  className?: string;
}

export default function CategoryIcon({ name, className = 'w-5 h-5' }: CategoryIconProps) {
  const IconComponent = (name && ICON_MAP[name]) || HelpCircle;
  return <IconComponent className={className} />;
}
