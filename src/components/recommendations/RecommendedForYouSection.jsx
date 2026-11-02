import React, { useState, useEffect, useMemo } from 'react';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { loadProductsCatalog } from '../../utils/excelParser';
import { getPersonalizedRecommendations } from '../../utils/recommendationEngine';
import ProductCarousel from '../common/ProductCarousel';

export default function RecommendedForYouSection({ className = '' }) {
  const { recentlyViewedIds } = useRecentlyViewed();
  const { wishlist } = useWishlist();
  const { cart } = useCart();
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

  const wishlistIds = useMemo(() => {
    return (wishlist || []).map(p => p.id);
  }, [wishlist]);

  const cartIds = useMemo(() => {
    return (cart || []).map(item => item.product?.id || item.id);
  }, [cart]);

  const recommendedProducts = useMemo(() => {
    if (!catalog || catalog.length === 0) return [];
    return getPersonalizedRecommendations({
      catalog,
      recentlyViewedIds,
      wishlistIds,
      cartIds,
      maxItems: 10
    });
  }, [catalog, recentlyViewedIds, wishlistIds, cartIds]);

  if (loading || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className={`w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 ${className}`}>
      <ProductCarousel
        products={recommendedProducts}
        badge={t('recommendations.recommendedBadge') || 'Personalized For You'}
        title={t('recommendations.recommendedTitle') || 'Recommended For You'}
        subtitle={t('recommendations.recommendedSubtitle') || 'Handpicked provisions aligned with your kitchen needs and tastes.'}
      />
    </div>
  );
}
