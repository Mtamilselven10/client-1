import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ShoppingListDashboard from '../components/shoppingList/ShoppingListDashboard';
import RecommendedForYouSection from '../components/recommendations/RecommendedForYouSection';

export default function ShoppingListPage() {
  const { t } = useLanguage();

  return (
    <div className="bg-cream min-h-screen py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 w-full max-w-full overflow-x-hidden">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-olive/20">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-olive/10 text-olive border border-olive/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('shoppingList.headerBadge') || 'Smart Grocery Planner'}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-ink leading-tight">
            {t('shoppingList.headerTitle') || 'My Grocery Shopping Lists'}
          </h1>
          <p className="text-xs sm:text-sm text-ink/70 mt-1 max-w-2xl leading-relaxed">
            {t('shoppingList.headerSubtitle') || 'Organize monthly family provisions, track kitchen essentials, and transfer all items directly to your cart in one click.'}
          </p>
        </div>

        <NavLink
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-cream-light border border-olive/30 text-olive text-xs font-bold hover:bg-olive hover:text-cream transition-all shadow-olive-xs shrink-0 self-start sm:self-auto"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{t('shoppingList.exploreProvisions') || 'Explore Provisions'}</span>
        </NavLink>
      </div>

      {/* Main Interactive Dashboard */}
      <ShoppingListDashboard />

      {/* Suggested Provisions to Add */}
      <div className="pt-8 border-t border-olive/15">
        <RecommendedForYouSection />
      </div>

    </div>
  );
}
