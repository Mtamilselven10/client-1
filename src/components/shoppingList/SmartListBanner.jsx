import React from 'react';
import { NavLink } from 'react-router-dom';
import { ClipboardList, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useShoppingList } from '../../context/ShoppingListContext';

export default function SmartListBanner() {
  const { t } = useLanguage();
  const { lists, activeList } = useShoppingList();

  const totalItems = lists.reduce((acc, l) => acc + (l.items?.length || 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 select-none">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-olive-dark via-olive to-olive-dark p-5 sm:p-7 text-cream shadow-olive-md border border-cream/20">
        
        {/* Subtle decorative background watermark pattern */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <ClipboardList className="w-48 h-48 text-cream" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider bg-cream/15 text-cream border border-cream/25 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cream" />
              <span>{t('shoppingList.bannerBadge') || 'Smart Grocery Planner'}</span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-cream leading-snug">
              {t('shoppingList.bannerTitle') || 'Plan Your Monthly & Festival Provisions'}
            </h3>

            <p className="text-xs sm:text-sm text-cream/85 leading-relaxed">
              {t('shoppingList.bannerSubtitle') || 'Organize multiple grocery lists, estimate your budget with live prices, check off completed items, and add everything to your cart in 1 click.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-cream/90 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{t('shoppingList.featureBudget') || 'Live Budget Estimator'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{t('shoppingList.featureOneClick') || '1-Click Cart Transfer'}</span>
              </span>
              {totalItems > 0 && (
                <span className="flex items-center gap-1.5 font-bold text-amber-200">
                  <span>★ {totalItems} {t('shoppingList.itemsSaved') || 'provisions in your lists'}</span>
                </span>
              )}
            </div>
          </div>

          <NavLink
            to="/lists"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-btn bg-cream text-olive hover:bg-cream-light font-extrabold text-xs sm:text-sm shadow-olive-lg hover:scale-102 transition-all shrink-0 cursor-pointer self-start md:self-auto"
          >
            <ClipboardList className="w-4 h-4" />
            <span>{t('shoppingList.openListsBtn') || 'Open My Shopping Lists'}</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>

      </div>
    </div>
  );
}
