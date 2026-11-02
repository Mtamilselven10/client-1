import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { loadProductsCatalog } from '../../utils/excelParser';
import { getTrendingProducts } from '../../utils/recommendationEngine';
import ProductCarousel from '../common/ProductCarousel';

export default function TrendingProductsSection({ className = '' }) {
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

  const trendingProducts = useMemo(() => {
    if (!catalog || catalog.length === 0) return [];
    return getTrendingProducts(catalog, 10);
  }, [catalog]);

  if (loading || trendingProducts.length === 0) {
    return null;
  }

  return (
    <div className={`w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 ${className}`}>
      <ProductCarousel
        products={trendingProducts}
        badge={t('recommendations.trendingBadge') || 'Popular & Trending'}
        title={t('recommendations.trendingTitle') || 'Trending Grocery Staples'}
        subtitle={t('recommendations.trendingSubtitle') || 'The most treasured everyday provisions chosen by households this season.'}
      />
    </div>
  );
}
