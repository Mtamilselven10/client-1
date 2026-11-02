import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  ShoppingCart, 
  Star, 
  Check, 
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { formatCurrency, getProductImageUrl } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFlyToCart } from '../../animations/useFlyToCart';
import { useReviews } from '../../context/ReviewsContext';

export default function ProductCarousel({
  products = [],
  title,
  subtitle,
  badge,
  headerAction,
  emptyMessage,
  className = ''
}) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { addToCart, isInCart, getProductQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t, translateCategory } = useLanguage();
  const { triggerFlyToCart, triggerFlyToWishlist } = useFlyToCart();
  const { getProductReviewStats } = useReviews();

  const [pickedCardId, setPickedCardId] = useState(null);

  // Check scroll boundary to enable/disable navigation arrows
  const checkScrollBounds = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    // Allow 6px margin of error for rounding
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScrollBounds();
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);

    // Initial check after images/content mount
    const timeout = setTimeout(checkScrollBounds, 300);

    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
      clearTimeout(timeout);
    };
  }, [products, checkScrollBounds]);

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollAmount = Math.max(280, el.clientWidth * 0.75);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (!products || products.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div className="py-8 text-center text-ink/60 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <section className={`relative w-full select-none ${className}`}>
      {/* Carousel Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-6 px-1">
        <div>
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-olive/10 text-olive border border-olive/20 mb-1.5">
              <Sparkles className="w-3 h-3 text-olive" />
              <span>{badge}</span>
            </div>
          )}
          {title && (
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-ink leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-ink/70 mt-1 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Header Actions: Custom action (e.g. Clear history) + Arrow controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {headerAction && (
            <div className="text-xs">{headerAction}</div>
          )}

          {/* Flipkart-Style Carousel Arrow Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                canScrollLeft
                  ? 'bg-cream-light text-olive border-olive/30 shadow-olive-sm hover:bg-olive hover:text-cream active:scale-95'
                  : 'bg-cream-deep/60 text-ink/30 border-ink/10 cursor-not-allowed opacity-40'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                canScrollRight
                  ? 'bg-cream-light text-olive border-olive/30 shadow-olive-sm hover:bg-olive hover:text-cream active:scale-95'
                  : 'bg-cream-deep/60 text-ink/30 border-ink/10 cursor-not-allowed opacity-40'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 -mx-1"
        style={{ scrollPaddingLeft: '4px', scrollPaddingRight: '4px' }}
      >
        {products.map((product) => {
          const inCart = isInCart(product.id);
          const cartQty = getProductQuantity(product.id);
          const isWished = isInWishlist(product.id);
          const reviewStats = getProductReviewStats(
            product.id,
            product.name,
            product.rating,
            product.reviewsCount
          );

          const discountPercent = product.mrp > product.price
            ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
            : 0;

          const isPicked = pickedCardId === product.id;

          return (
            <div
              key={product.id}
              className="w-[230px] xs:w-[250px] sm:w-[270px] shrink-0 snap-start flex flex-col"
            >
              <div
                role="article"
                tabIndex={0}
                onClick={() => navigate(`/products/${product.id}`, { state: { product } })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/products/${product.id}`, { state: { product } });
                  }
                }}
                className="group relative flex flex-col justify-between h-full bg-cream-light rounded-card border border-olive/20 hover:border-olive/50 shadow-olive-sm hover:shadow-olive-md transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Picked Ring Pulse Animation */}
                {isPicked && (
                  <motion.div
                    initial={{ opacity: 0.8, scale: 0.98 }}
                    animate={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-card ring-2 ring-olive pointer-events-none z-20"
                  />
                )}

                {/* Top Image Container */}
                <div className="relative w-full aspect-square bg-cream-deep p-3 flex items-center justify-center overflow-hidden">
                  <img
                    src={getProductImageUrl(product.image)}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      if (product.fallbackImage && e.currentTarget.src !== product.fallbackImage) {
                        e.currentTarget.src = product.fallbackImage;
                      }
                    }}
                    className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isWished) {
                        triggerFlyToWishlist(e.currentTarget, product);
                      }
                      toggleWishlist(product);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cream/90 backdrop-blur-xs flex items-center justify-center text-olive border border-olive/20 shadow-olive-sm transition-transform active:scale-90 z-10 cursor-pointer"
                    aria-label={isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                        isWished ? 'fill-olive text-olive' : 'text-olive'
                      }`}
                    />
                  </button>

                  {/* Discount Badge */}
                  {discountPercent > 0 && (
                    <div className="absolute top-2 left-2 bg-olive text-cream text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                      {discountPercent}% OFF
                    </div>
                  )}

                  {/* Unit Badge */}
                  {product.unit && (
                    <div className="absolute bottom-2 left-2 bg-ink/75 backdrop-blur-xs text-cream text-[10px] font-semibold px-2 py-0.5 rounded">
                      {product.unit}
                    </div>
                  )}
                </div>

                {/* Card Content Details */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    {/* Category & Star Rating */}
                    <div className="flex items-center justify-between text-[11px] text-ink/70">
                      <span className="font-semibold truncate max-w-[120px] text-olive">
                        {translateCategory(product.category)}
                      </span>
                      <div className="flex items-center gap-1 font-bold text-ink shrink-0">
                        <Star className="w-3 h-3 fill-olive text-olive" />
                        <span>{reviewStats.rating.toFixed(1)}</span>
                        <span className="text-ink/40 text-[10px]">({reviewStats.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Purchase Intelligence Badge (Buy Again) */}
                    {product.purchaseBadge && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-olive/15 text-olive border border-olive/25">
                        <RotateCcw className="w-2.5 h-2.5 text-olive shrink-0" />
                        <span>{product.purchaseBadge}</span>
                      </div>
                    )}

                    {/* Product Name */}
                    <h3 className="font-serif font-bold text-sm sm:text-base text-ink line-clamp-2 leading-snug group-hover:text-olive transition-colors">
                      {product.name}
                    </h3>

                    {/* Stock Status */}
                    <div className="flex items-center gap-1 text-[10px] font-bold text-olive">
                      <span className="w-1.5 h-1.5 rounded-full bg-olive animate-pulse" />
                      <span>{t('recentlyViewed.inStock') || 'In Stock'}</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart Action Row */}
                  <div className="pt-2 border-t border-olive/10 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-serif text-sm sm:text-base font-extrabold text-olive">
                          {formatCurrency(product.price)}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-[11px] text-ink/50 line-through">
                            {formatCurrency(product.mrp)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPickedCardId(product.id);
                        setTimeout(() => setPickedCardId(null), 350);
                        triggerFlyToCart(e.currentTarget, product, 'card');
                        addToCart(product, 1);
                      }}
                      className="px-2.5 sm:px-3 py-1.5 rounded-btn font-bold text-[11px] sm:text-xs tracking-wide shadow-olive-sm transition-all duration-200 flex items-center gap-1 bg-olive text-cream hover:bg-olive-dark active:scale-95 shrink-0 cursor-pointer"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3 h-3 text-cream" />
                          <span>{t('recentlyViewed.inCart') || 'In Cart'} ({cartQty})</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3 h-3 text-cream" />
                          <span>{t('recentlyViewed.addBtn') || 'Add'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
