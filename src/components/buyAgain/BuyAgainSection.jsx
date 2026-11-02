import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { RotateCcw, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { useOrderHistory } from '../../context/OrderHistoryContext';
import { useLanguage } from '../../context/LanguageContext';
import { loadProductsCatalog } from '../../utils/excelParser';
import ProductCarousel from '../common/ProductCarousel';

export default function BuyAgainSection({ className = '' }) {
  const { orders, hasOrders, getBuyAgainProducts, seedSampleOrders } = useOrderHistory();
  const { t } = useLanguage();

  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    loadProductsCatalog()
      .then(data => {
        if (isMounted) {
          setCatalog(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const buyAgainProducts = useMemo(() => {
    if (!catalog || catalog.length === 0) return [];
    return getBuyAgainProducts(catalog);
  }, [catalog, getBuyAgainProducts]);

  // If user has orders and products to buy again
  if (hasOrders && buyAgainProducts.length > 0) {
    return (
      <div data-testid="buy-again-section" className={`px-4 sm:px-8 max-w-7xl mx-auto ${className}`}>
        <ProductCarousel
          products={buyAgainProducts}
          title={t('buyAgain.sectionTitle') || 'Buy Again'}
          subtitle={t('buyAgain.sectionSubtitle') || 'Regularly ordered pantry essentials and fresh staples ready for instant restock.'}
          badge={t('buyAgain.sectionBadge') || 'Pantry Restock'}
          headerAction={
            <NavLink
              to="/orders"
              className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-olive hover:text-olive-dark underline underline-offset-4 transition-colors"
            >
              <span>{t('buyAgain.viewAllOrders') || `View All Orders (${orders.length})`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          }
        />
      </div>
    );
  }

  // If no past purchase history, display an inviting guest demo / restock banner
  return (
    <div data-testid="buy-again-banner" className={`px-4 sm:px-8 max-w-7xl mx-auto ${className}`}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-olive/10 via-cream-light to-olive/5 border border-olive/20 p-5 sm:p-7 shadow-olive-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-olive/15 text-olive border border-olive/25">
            <RotateCcw className="w-3 h-3 text-olive" />
            <span>{t('buyAgain.bannerBadge') || '1-Click Pantry Restock'}</span>
          </div>
          <h3 className="font-serif text-lg sm:text-2xl font-extrabold text-ink">
            {t('buyAgain.bannerTitle') || 'Fast Reordering for Your Household Provisions'}
          </h3>
          <p className="text-xs sm:text-sm text-ink/75 leading-relaxed">
            {t('buyAgain.bannerSubtitle') || 'Every provision you order via WhatsApp is saved to your local purchase history for instant 1-click reordering whenever your kitchen pantry runs low.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            data-testid="seed-demo-orders-btn"
            onClick={seedSampleOrders}
            className="px-4 py-2.5 rounded-xl bg-olive text-cream text-xs sm:text-sm font-bold shadow-olive-sm hover:bg-olive-dark transition-all flex items-center gap-2 cursor-pointer active:scale-97"
          >
            <Sparkles className="w-4 h-4 text-cream" />
            <span>{t('buyAgain.seedDemoBtn') || 'Load Demo Purchase History'}</span>
          </button>
          <NavLink
            to="/products"
            className="px-4 py-2.5 rounded-xl bg-cream-light border border-olive/30 text-olive text-xs sm:text-sm font-bold hover:bg-olive/10 transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-olive" />
            <span>{t('buyAgain.browseCatalog') || 'Browse Catalog'}</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
