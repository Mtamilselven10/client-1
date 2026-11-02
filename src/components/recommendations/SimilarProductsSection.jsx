import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { loadProductsCatalog } from '../../utils/excelParser';
import { getSimilarProducts } from '../../utils/recommendationEngine';
import ProductCarousel from '../common/ProductCarousel';

export default function SimilarProductsSection({ currentProduct, className = '' }) {
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

  const similarProducts = useMemo(() => {
    if (!currentProduct || !catalog || catalog.length === 0) return [];
    return getSimilarProducts(currentProduct, catalog, 10);
  }, [currentProduct, catalog]);

  if (loading || !currentProduct || similarProducts.length === 0) {
    return null;
  }

  return (
    <div className={`w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 ${className}`}>
      <ProductCarousel
        products={similarProducts}
        badge={t('recommendations.similarBadge') || 'Similar Varieties'}
        title={t('recommendations.similarTitle') || 'Similar Products'}
        subtitle={t('recommendations.similarSubtitle') || 'Explore comparable provisions in purity, grade, and traditional culinary use.'}
      />
    </div>
  );
}
