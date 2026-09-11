'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Sparkles,
  Layers,
  CheckCircle2,
  X,
  ChevronRight,
} from 'lucide-react';
import CategoryIcon from '@/components/ui/CategoryIcon';

const AVAILABLE_ICONS = [
  'Briefcase',
  'ShoppingCart',
  'Home',
  'Zap',
  'Utensils',
  'Car',
  'Tv',
  'HeartPulse',
  'ShoppingBag',
  'TrendingUp',
  'Wallet',
  'Laptop',
  'PlusCircle',
  'Landmark',
  'Building',
  'CreditCard',
  'Layers',
  'GraduationCap',
  'Gamepad2',
  'Heart',
  'Coffee',
  'Tag',
  'Sparkles',
  'Shield',
];

const AVAILABLE_COLORS = [
  '#10B981', // Emerald
  '#059669', // Dark Green
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#64748B', // Slate
  '#A855F7', // Violet
  '#D946EF', // Fuchsia
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // Modals
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Form states
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [catIcon, setCatIcon] = useState('Tag');
  const [catColor, setCatColor] = useState('#10B981');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/categories/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSeedMessage(data.message || 'General categories and subcategories loaded successfully!');
        fetchCategories();
        setTimeout(() => setSeedMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to seed categories:', err);
    } finally {
      setSeeding(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: catName,
          type: selectedParentId ? activeTab : catType,
          icon: catIcon,
          color: catColor,
          parentId: selectedParentId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to save category');

      setCatName('');
      setIsAddCatModalOpen(false);
      setIsAddSubModalOpen(false);
      setSelectedParentId(null);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}" and its subcategories?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const openAddSubcategory = (parentId: string) => {
    setSelectedParentId(parentId);
    setCatIcon('Tag');
    setCatColor('#6366F1');
    setIsAddSubModalOpen(true);
  };

  // Group into root categories with their subcategories
  const roots = categories.filter((c) => !c.parentId && c.type === activeTab);
  const totalSubcategories = categories.filter((c) => c.parentId && c.type === activeTab).length;

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & ACTIONS
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Categories & Subcategories</h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              Taxonomy
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Organize transactions with two-tier categories for precise spending and revenue insights.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
            title="Load standard general categories and subcategories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{seeding ? 'Loading...' : 'Load General Categories'}</span>
          </button>

          <button
            onClick={() => {
              setSelectedParentId(null);
              setCatType(activeTab);
              setIsAddCatModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. TYPE TABS (EXPENSE VS INCOME)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('EXPENSE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'EXPENSE'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expense Categories
          </button>
          <button
            onClick={() => setActiveTab('INCOME')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'INCOME'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income Categories
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          {roots.length} categories • {totalSubcategories} subcategories
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORIES & SUBCATEGORIES TREE
         ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 text-xs">Loading taxonomy...</div>
      ) : roots.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Tag className="w-7 h-7" />
          </div>
          <div className="text-base font-bold text-slate-200">No {activeTab.toLowerCase()} categories found</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Get started immediately by clicking "Load General Categories" to automatically populate a complete tree of general categories and subcategories.
          </p>
          <button
            onClick={handleSeedDefaults}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load General Categories</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roots.map((parent) => {
            const children = categories.filter((c) => c.parentId === parent.id);

            return (
              <div
                key={parent.id}
                className="p-5 md:p-6 bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-3xl space-y-4 flex flex-col justify-between hover:bg-slate-900/90 transition-all shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-950 shadow-md shrink-0"
                        style={{ backgroundColor: parent.color || '#10B981' }}
                      >
                        <CategoryIcon name={parent.icon} className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-white flex items-center gap-2">
                          <span>{parent.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700/60 rounded-full font-normal">
                            {children.length} sub
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                          {parent.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openAddSubcategory(parent.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Sub</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(parent.id, parent.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories List */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                    <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                      Subcategories
                    </div>

                    {children.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-1">
                        No subcategories. Transactions will be logged directly to {parent.name}.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {children.map((sub) => (
                          <span
                            key={sub.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 group transition-colors shadow-sm"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: sub.color || parent.color }}
                            />
                            <span>{sub.name}</span>
                            <button
                              onClick={() => handleDeleteCategory(sub.id, sub.name)}
                              className="ml-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 transition-opacity"
                              title="Delete subcategory"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. ADD CATEGORY / SUBCATEGORY MODAL
         ───────────────────────────────────────────────────────────── */}
      {(isAddCatModalOpen || isAddSubModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {isAddSubModalOpen ? 'Add New Subcategory' : 'Add New Category'}
              </h2>
              <button
                onClick={() => {
                  setIsAddCatModalOpen(false);
                  setIsAddSubModalOpen(false);
                  setSelectedParentId(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  placeholder={isAddSubModalOpen ? 'e.g. Fresh Groceries' : 'e.g. Food & Dining'}
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Type toggle (only for top-level) */}
              {!isAddSubModalOpen && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Type</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setCatType('EXPENSE')}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        catType === 'EXPENSE'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatType('INCOME')}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        catType === 'INCOME'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>
              )}

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Choose Icon</label>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1 bg-slate-800/60 rounded-xl border border-slate-700">
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setCatIcon(iconName)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                        catIcon === iconName
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <CategoryIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Color Accent</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setCatColor(hex)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        catColor === hex ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitting || !catName.trim()}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {formSubmitting ? 'Saving...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
