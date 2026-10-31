import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import { formatCurrency, getProductImageUrl } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFlyToCart } from '../../animations/useFlyToCart';
import { useReviews } from '../../context/ReviewsContext';

// Configurable delay before 16:9 hover morph animation triggers (1.8s)
const HOVER_DELAY_MS = 1800;

const ProductCard = forwardRef(function ProductCard({ product, index = 0 }, ref) {
  const navigate = useNavigate();
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t, translateCategory } = useLanguage();
  const { triggerFlyToCart, triggerFlyToWishlist } = useFlyToCart();
  const { getProductReviewStats } = useReviews();
  const reviewStats = getProductReviewStats(product.id, product.name, product.rating, product.reviewsCount);

  const [isPicked, setIsPicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isRightEdge, setIsRightEdge] = useState(false);
  const [cursorOrigin, setCursorOrigin] = useState('50% 50%');
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });
  const cardCellRef = useRef(null);
  const heartBtnRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const isInsideCardRef = useRef(false);

  // Clean up any pending hover timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = (e) => {
    // Touch / mobile: Touch events or mobile viewports should NOT trigger the hover animation
    if (e.nativeEvent && e.nativeEvent.pointerType && e.nativeEvent.pointerType !== 'mouse') {
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return;
    }

    isInsideCardRef.current = true;

    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const pctX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const pctY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setCursorOrigin(`${pctX.toFixed(1)}% ${pctY.toFixed(1)}%`);
      const normX = (pctX - 50) / 50; // -1 to 1
      const normY = (pctY - 50) / 50; // -1 to 1
      setCursorOffset({ x: normX * 2, y: normY * 1.5 });

      // Determine if the card is near the right edge of viewport so overlay expands leftward
      const spaceOnRight = window.innerWidth - rect.right;
      setIsRightEdge(spaceOnRight < 220);
    }

    // Cancel any previous pending timer
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    // Start 1.8s delay timer; only trigger if cursor stays continuously on card
    hoverTimerRef.current = setTimeout(() => {
      if (isInsideCardRef.current && (typeof window === 'undefined' || window.innerWidth >= 1024)) {
        setIsHovered(true);
      }
    }, HOVER_DELAY_MS);
  };

  const handleMouseMove = (e) => {
    if (e.nativeEvent && e.nativeEvent.pointerType && e.nativeEvent.pointerType !== 'mouse') {
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const pctX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const pctY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setCursorOrigin(`${pctX.toFixed(1)}% ${pctY.toFixed(1)}%`);
      const normX = (pctX - 50) / 50;
      const normY = (pctY - 50) / 50;
      setCursorOffset({ x: normX * 2, y: normY * 1.5 });
    }
  };

  const handleMouseLeave = () => {
    isInsideCardRef.current = false;
    // Immediately cancel pending timer if cursor leaves before 1.8s
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Closes / reverses back to normal immediately (no exit delay)
    setIsHovered(false);
    setCursorOrigin('50% 50%');
    setCursorOffset({ x: 0, y: 0 });
  };

  const handleFocus = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    setCursorOrigin('50% 50%');
    setCursorOffset({ x: 0, y: 0 });
    setIsHovered(true);
  };

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      isInsideCardRef.current = false;
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      setIsHovered(false);
      setCursorOffset({ x: 0, y: 0 });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        handleCardClick();
      }
    }
  };

  const setMergedRef = (el) => {
    cardCellRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  const isWished = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const cartQty = getProductQuantity(product.id);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`, { state: { product } });
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!isWished) {
      triggerFlyToWishlist(heartBtnRef.current || e.currentTarget, product);
    }
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsPicked(true);
    setTimeout(() => setIsPicked(false), 350);
    triggerFlyToCart(cardCellRef.current, product, 'card');
    addToCart(product, 1);
  };

  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  return (
    <div
      ref={setMergedRef}
      data-testid="product-card"
      tabIndex={0}
      role="article"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        zIndex: isHovered ? 40 : 1,
      }}
      className={`relative w-full min-h-[414px] cursor-pointer ${
        isHovered ? 'z-40' : 'z-1'
      }`}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={
          isPicked 
            ? { scale: [1, 0.98, 1], y: 0, x: 0, opacity: 1 } 
            : isHovered
            ? { 
                width: 420,
                height: 236.25,
                scale: 1.015, 
                y: -4 + cursorOffset.y, 
                x: cursorOffset.x,
                opacity: 1,
                transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] }
              }
            : { 
                width: '100%',
                height: '100%',
                scale: 1, 
                y: 0, 
                x: 0,
                opacity: 1,
                transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } 
              }
        }
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ 
          delay: Math.min(index * 0.04, 0.32), 
          duration: 0.28, 
          ease: [0.16, 1, 0.3, 1] 
        }}
        style={{ 
          width: isHovered ? 420 : '100%',
          height: isHovered ? 236.25 : '100%',
          aspectRatio: isHovered ? '16 / 9' : undefined,
          transformOrigin: cursorOrigin,
          transformStyle: 'preserve-3d',
          willChange: 'transform, box-shadow, width, height'
        }}
        className={`group rounded-card overflow-hidden bg-cream-light border border-olive/20 transition-all duration-300 ms-product-card ${
          isHovered 
            ? `absolute top-0 ${isRightEdge ? 'right-0' : 'left-0'} aspect-video flex flex-row items-stretch justify-between shadow-2xl border-olive/60 z-40` 
            : 'relative w-full h-full min-h-[414px] flex flex-col justify-between shadow-olive-sm hover:shadow-ms-store hover:border-olive/50 z-1'
        }`}
      >
        {/* Microsoft Store Fluent Ambient Light Sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

        {/* Picked Ring Pulse Animation */}
        {isPicked && (
          <motion.div
            initial={{ opacity: 0.8, scale: 0.98 }}
            animate={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 rounded-card ring-2 ring-olive pointer-events-none z-20"
          />
        )}

        {/* Product Image Container (Transitions between Square on top and Landscape Frame on the left) */}
        <motion.div 
          layout
          className={`relative overflow-hidden bg-cream-deep p-3 flex items-center justify-center transition-all duration-300 ${
            isHovered 
              ? 'w-5/12 h-full shrink-0 border-r border-olive/15' 
              : 'w-full aspect-square border-b-0'
          }`}
        >
          <img
            src={getProductImageUrl(product.image)}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              if (product.fallbackImage && e.currentTarget.src !== product.fallbackImage) {
                e.currentTarget.src = product.fallbackImage;
              }
            }}
            style={{ transformOrigin: cursorOrigin }}
            className="w-full h-full object-cover rounded-md transition-transform duration-400 ease-out group-hover:scale-106"
          />

          {/* Wishlist Heart Toggle Button */}
          <motion.button
            ref={heartBtnRef}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.8 }}
            onClick={handleWishlistToggle}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-cream/90 backdrop-blur-xs flex items-center justify-center text-olive border border-olive/20 shadow-olive-sm transition-colors z-10 focus-visible:ring-2 focus-visible:ring-olive"
            aria-label={isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          >
            <motion.div
              animate={isWished ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isWished ? 'fill-olive text-olive' : 'text-olive'
                }`}
              />
            </motion.div>
          </motion.button>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2.5 left-2.5 bg-olive text-cream text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {t('products.offBadge', { pct: discountPercent })}
            </div>
          )}

          {/* Unit badge */}
          <div className="absolute bottom-2.5 left-2.5 bg-ink/75 backdrop-blur-xs text-cream text-[10px] font-semibold px-2 py-0.5 rounded-md">
            {product.unit}
          </div>
        </motion.div>

        {/* Product Content Details (Transitions smoothly with parallel content reveal) */}
        <motion.div 
          layout
          className={`flex-1 flex flex-col justify-between overflow-hidden transition-all duration-300 ${
            isHovered 
              ? 'w-7/12 p-3 space-y-1.5' 
              : 'w-full p-4 space-y-3'
          }`}
        >
          <div className="space-y-1">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs text-ink/70">
              <span className="font-medium truncate max-w-[130px] text-olive">
                {translateCategory(product.category)}
              </span>
              <div className="flex items-center gap-1 font-semibold text-ink shrink-0">
                <Star className="w-3.5 h-3.5 fill-olive text-olive" />
                <span>{reviewStats.rating.toFixed(1)}</span>
                <span className="text-ink/50 text-[11px]">({reviewStats.reviewsCount})</span>
              </div>
            </div>

            {/* Product Name */}
            <h3 className={`font-serif font-bold text-ink leading-snug group-hover:text-olive transition-colors duration-250 ${
              isHovered ? 'text-sm line-clamp-1' : 'text-base line-clamp-2'
            }`}>
              {product.name}
            </h3>

            {/* In-Stock Live Availability Indicator */}
            <div className="flex items-center gap-1.5 text-olive text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-olive animate-pulse" />
              <span>In Stock</span>
            </div>

            {/* Short Description */}
            <p className={`text-xs text-ink/75 leading-relaxed ${
              isHovered ? 'line-clamp-1 text-[11px]' : 'line-clamp-2'
            }`}>
              {product.description}
            </p>

            {/* Expanded product detail bullet (if available) */}
            {product.details && isHovered && (
              <div className="text-[10px] font-medium text-olive flex items-center gap-1 truncate pt-0.5">
                <span className="font-bold">✓</span>
                <span className="truncate">{product.details}</span>
              </div>
            )}
          </div>

          {/* Price & Add to Cart Action Row */}
          <div className="pt-1.5 border-t border-olive/10 flex items-center justify-between gap-2 shrink-0">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-base sm:text-lg font-extrabold text-olive">
                  {formatCurrency(product.price)}
                </span>
                {product.mrp > product.price && (
                  <span className="text-xs text-ink/50 line-through">
                    {formatCurrency(product.mrp)}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-ink/60 font-medium">{t('products.inclusiveTax')}</div>
            </div>

            {/* Add to Cart Olive Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              className="px-3.5 py-2 rounded-btn font-semibold text-xs tracking-wide shadow-olive-sm transition-colors duration-200 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-olive bg-olive text-cream hover:bg-olive-dark shrink-0"
              aria-label={`Add ${product.name} to cart`}
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
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});

export default ProductCard;
