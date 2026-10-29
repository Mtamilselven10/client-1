import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Star, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useProductPreview } from '../../context/ProductPreviewContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useReviews } from '../../context/ReviewsContext';
import { useFlyToCart } from '../../animations/useFlyToCart';
import { formatCurrency, getProductImageUrl } from '../../utils/formatters';

export default function ProductPreviewPopover() {
  const { activeProduct, triggerRect, isOpen, keepPreview, hidePreview, closeImmediately } = useProductPreview();
  const navigate = useNavigate();
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t, translateCategory, language } = useLanguage();
  const { getProductReviewStats } = useReviews();
  const { triggerFlyToCart, triggerFlyToWishlist } = useFlyToCart();

  const popoverRef = useRef(null);
  const heartBtnRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, transformOrigin: 'top left' });

  // Compute smart viewport positioning whenever triggerRect changes
  useEffect(() => {
    if (!triggerRect || !isOpen) return;

    const popoverWidth = 340;
    const estimatedHeight = 460;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 12;

    let left = 0;
    let top = triggerRect.top;
    let originX = 'left';
    let originY = 'top';

    // Priority 1: Right side of card
    if (triggerRect.right + popoverWidth + margin <= viewportWidth) {
      left = triggerRect.right + margin;
      originX = 'left';
    } 
    // Priority 2: Left side of card
    else if (triggerRect.left - popoverWidth - margin >= 0) {
      left = triggerRect.left - popoverWidth - margin;
      originX = 'right';
    } 
    // Priority 3: Align to center/clamp horizontally
    else {
      left = Math.max(margin, Math.min(viewportWidth - popoverWidth - margin, triggerRect.left + (triggerRect.width - popoverWidth) / 2));
      originX = 'center';
    }

    // Vertical alignment and viewport boundary clamping
    if (top + estimatedHeight > viewportHeight - margin) {
      top = Math.max(margin, viewportHeight - estimatedHeight - margin);
      originY = 'bottom';
    } else {
      top = Math.max(margin, top);
      originY = 'top';
    }

    setCoords({
      top,
      left,
      transformOrigin: `${originX} ${originY}`
    });
  }, [triggerRect, isOpen]);

  if (typeof document === 'undefined') return null;

  const inCart = activeProduct ? isInCart(activeProduct.id) : false;
  const cartQty = activeProduct ? getProductQuantity(activeProduct.id) : 0;
  const isWished = activeProduct ? isInWishlist(activeProduct.id) : false;
  const reviewStats = activeProduct 
    ? getProductReviewStats(activeProduct.id, activeProduct.name, activeProduct.rating, activeProduct.reviewsCount)
    : { rating: 5, reviewsCount: 1 };

  const discountPercent = activeProduct && activeProduct.mrp > activeProduct.price
    ? Math.round(((activeProduct.mrp - activeProduct.price) / activeProduct.mrp) * 100)
    : 0;

  const handleCardNavigate = () => {
    closeImmediately();
    if (activeProduct) {
      navigate(`/products/${activeProduct.id}`, { state: { product: activeProduct } });
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!activeProduct) return;
    triggerFlyToCart(popoverRef.current || e.currentTarget, activeProduct, 'card');
    addToCart(activeProduct, 1);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!activeProduct) return;
    if (!isWished) {
      triggerFlyToWishlist(heartBtnRef.current || e.currentTarget, activeProduct);
    }
    toggleWishlist(activeProduct);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && activeProduct && (
        <motion.div
          ref={popoverRef}
          role="dialog"
          aria-label={`Preview of ${activeProduct.name}`}
          data-testid="product-preview-popover"
          onMouseEnter={keepPreview}
          onMouseLeave={hidePreview}
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 4 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            width: 340,
            transformOrigin: coords.transformOrigin,
            zIndex: 9999
          }}
          className="rounded-card overflow-hidden bg-cream-light/95 backdrop-blur-md border-2 border-olive/35 shadow-2xl shadow-olive/25 text-ink flex flex-col pointer-events-auto"
        >
          {/* Subtle Ambient Sheen */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none z-10" />

          {/* Top Bar: Category Pill & Stock Status & Wishlist Action */}
          <div className="p-3 bg-cream-deep/60 border-b border-olive/15 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-olive uppercase tracking-wider truncate max-w-[170px]">
              {translateCategory(activeProduct.category)}
            </span>

            <div className="flex items-center gap-2">
              {/* Availability Status */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-olive-soft border border-olive/20 text-[10px] font-bold text-olive">
                <span className="w-1.5 h-1.5 rounded-full bg-olive animate-pulse" />
                <span>{language === 'ta' ? 'கையிருப்பில் உள்ளது' : 'In Stock'}</span>
              </div>

              {/* Wishlist Button */}
              <button
                ref={heartBtnRef}
                onClick={handleWishlistToggle}
                className="w-7 h-7 rounded-full bg-cream-light border border-olive/20 flex items-center justify-center text-olive hover:text-olive-dark shadow-xs transition-colors"
                aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-olive text-olive' : 'text-olive'}`} />
              </button>
            </div>
          </div>

          {/* Product Image Area */}
          <div 
            onClick={handleCardNavigate}
            className="relative h-44 w-full bg-cream-deep p-3 cursor-pointer overflow-hidden flex items-center justify-center group"
          >
            <img
              src={getProductImageUrl(activeProduct.image)}
              alt={activeProduct.name}
              onError={(e) => {
                if (activeProduct.fallbackImage && e.currentTarget.src !== activeProduct.fallbackImage) {
                  e.currentTarget.src = activeProduct.fallbackImage;
                }
              }}
              className="w-full h-full object-cover rounded-md transition-transform duration-400 group-hover:scale-105"
            />

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute top-3 left-3 bg-olive text-cream text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                {t('products.offBadge', { pct: discountPercent })}
              </div>
            )}

            {/* Unit Badge */}
            <div className="absolute bottom-3 left-3 bg-ink/75 backdrop-blur-xs text-cream text-[10px] font-semibold px-2 py-0.5 rounded-md">
              {activeProduct.unit}
            </div>

            {/* Fast dispatch badge */}
            <div className="absolute bottom-3 right-3 bg-cream/90 backdrop-blur-xs text-olive text-[10px] font-bold px-2 py-0.5 rounded-md border border-olive/20 flex items-center gap-1 shadow-xs">
              <Zap className="w-3 h-3 text-olive" />
              <span>{language === 'ta' ? 'விரைவு டெலிவரி' : '24h Dispatch'}</span>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-4 space-y-3">
            <div>
              {/* Product Title */}
              <h3 
                onClick={handleCardNavigate}
                className="font-serif font-bold text-ink text-base line-clamp-2 leading-snug cursor-pointer hover:text-olive transition-colors"
              >
                {activeProduct.name}
              </h3>

              {/* Star Rating Breakdown */}
              <div className="flex items-center gap-1.5 mt-1 text-xs text-ink/75">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(reviewStats.rating)
                          ? 'fill-olive text-olive'
                          : 'fill-cream-deep text-ink/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-ink text-xs">{reviewStats.rating.toFixed(1)}</span>
                <span className="text-[11px] text-ink/50">({reviewStats.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="pt-2 border-t border-olive/15 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl font-extrabold text-olive">
                  {formatCurrency(activeProduct.price)}
                </span>
                {activeProduct.mrp > activeProduct.price && (
                  <span className="text-xs text-ink/50 line-through">
                    {formatCurrency(activeProduct.mrp)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-ink/60 font-medium">
                {t('products.inclusiveTax')}
              </span>
            </div>

            {/* Description & Detailed Specs */}
            <div className="text-xs text-ink/75 space-y-1 bg-cream-deep/40 rounded-lg p-2.5 border border-olive/10">
              <p className="line-clamp-2 leading-relaxed">
                {activeProduct.description}
              </p>
              {activeProduct.details && (
                <p className="text-[11px] text-olive font-medium line-clamp-1">
                  ✓ {activeProduct.details}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                data-testid="preview-popover-add-cart-btn"
                className="flex-1 py-2 px-3 rounded-btn bg-olive text-cream font-bold text-xs shadow-olive-sm hover:bg-olive-dark transition-colors duration-200 flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-olive cursor-pointer"
              >
                {inCart ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-cream" />
                    <span>{t('products.inCartBtn')} ({cartQty})</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 text-cream" />
                    <span>{t('products.addBtn')}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCardNavigate}
                data-testid="preview-popover-view-details-btn"
                className="py-2 px-3 rounded-btn bg-cream-deep text-olive hover:bg-cream border border-olive/25 font-bold text-xs shadow-xs transition-colors duration-200 flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'ta' ? 'விவரங்கள்' : 'Details'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
