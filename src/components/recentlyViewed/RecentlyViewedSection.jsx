import React, { useState, useEffect } from 'react';
import { Trash2, History } from 'lucide-react';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { loadProductsCatalog } from '../../utils/excelParser';
import ProductCarousel from '../common/ProductCarousel';

export default function RecentlyViewedSection({ currentProductId = null, className = '' }) {
  const { viewedItems, clearRecentlyViewed, getHydratedProducts } = useRecentlyViewed();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load catalog data to hydrate viewed product IDs with latest price, stock & details
  useEffect(() => {
    let isMounted = true;
    loadProductsCatalog()
      .then((data) => {
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

  const handleClearHistory = (e) => {
    e.preventDefault();
    clearRecentlyViewed();
    addToast(t('recentlyViewed.clearedToast') || 'Browsing history cleared', 'info');
  };

  // If there are no viewed items or catalog hasn't loaded, return null
  if (!viewedItems || viewedItems.length === 0) {
    return null;
  }

  const hydratedProducts = getHydratedProducts(catalog, currentProductId);

  // If no matching valid products (e.g. current product was the only one viewed), hide section
  if (hydratedProducts.length === 0) {
    return null;
  }

  const clearHistoryButton = (
    <button
      type="button"
      onClick={handleClearHistory}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-ink/70 hover:text-red-700 bg-cream-deep/60 hover:bg-red-50 border border-olive/15 hover:border-red-200 transition-colors cursor-pointer"
      title={t('recentlyViewed.clearHistory') || 'Clear History'}
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>{t('recentlyViewed.clearHistory') || 'Clear History'}</span>
    </button>
  );

  return (
    <div className={`w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 ${className}`}>
      <ProductCarousel
        products={hydratedProducts}
        badge={t('recentlyViewed.badge') || 'Your Browsing Activity'}
        title={t('recentlyViewed.title') || 'Recently Viewed Products'}
        subtitle={t('recentlyViewed.subtitle') || 'Pick up right where you left off from your recent browsing.'}
        headerAction={clearHistoryButton}
      />
    </div>
  );
}
