import React, { forwardRef, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import { formatCurrency, getProductImageUrl } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFlyToCart } from '../../animations/useFlyToCart';
import { useReviews } from '../../context/ReviewsContext';
import { useProductPreview } from '../../context/ProductPreviewContext';

const ProductCard = forwardRef(function ProductCard({ product, index = 0 }, ref) {
  const navigate = useNavigate();
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t, translateCategory } = useLanguage();
  const { triggerFlyToCart, triggerFlyToWishlist } = useFlyToCart();
  const { getProductReviewStats } = useReviews();
  const { showPreview, hidePreview } = useProductPreview();
  const reviewStats = getProductReviewStats(product.id, product.name, product.rating, product.reviewsCount);

  const [isPicked, setIsPicked] = useState(false);
  const cardContainerRef = useRef(null);
  const heartBtnRef = useRef(null);

  const setMergedRef = (el) => {
    cardContainerRef.current = el;
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
    triggerFlyToCart(cardContainerRef.current, product, 'card');
    addToCart(product, 1);
  };

  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  return (
    <motion.div
      ref={setMergedRef}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={isPicked ? { scale: [1, 0.98, 1], y: 0 } : { opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ 
        y: -6, 
        scale: 1.02, 
        transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } 
      }}
      transition={{ delay: Math.min(index * 0.04, 0.32), duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      data-testid="product-card"
      onClick={handleCardClick}
      onMouseEnter={() => showPreview(product, cardContainerRef.current)}
      onMouseLeave={hidePreview}
      onFocus={() => showPreview(product, cardContainerRef.current)}
      onBlur={hidePreview}
      className="relative group cursor-pointer rounded-card overflow-hidden bg-cream-light border border-olive/20 shadow-olive-sm hover:shadow-ms-store hover:border-olive/50 hover:z-10 transition-shadow transition-colors duration-300 flex flex-col justify-between ms-product-card"
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

      {/* Product Image Box */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream-deep p-3 flex items-center justify-center">
        <img
          src={getProductImageUrl(product.image)}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            if (product.fallbackImage && e.currentTarget.src !== product.fallbackImage) {
              e.currentTarget.src = product.fallbackImage;
            }
          }}
          className="w-full h-full object-cover rounded-md transition-transform duration-400 ease-out group-hover:scale-106"
        />

        {/* Wishlist Heart Toggle Button */}
        <motion.button
          ref={heartBtnRef}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.8 }}
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream/90 backdrop-blur-xs flex items-center justify-center text-olive border border-olive/20 shadow-olive-sm transition-colors z-10 focus-visible:ring-2 focus-visible:ring-olive"
          aria-label={isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <motion.div
            animate={isWished ? { scale: [1, 1.35, 1] } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isWished ? 'fill-olive text-olive' : 'text-olive'
              }`}
            />
          </motion.div>
        </motion.button>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-olive text-cream text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {t('products.offBadge', { pct: discountPercent })}
          </div>
        )}

        {/* Unit badge */}
        <div className="absolute bottom-3 left-3 bg-ink/75 backdrop-blur-xs text-cream text-[10px] font-semibold px-2 py-0.5 rounded-md">
          {product.unit}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-ink/70 mb-1">
            <span className="font-medium truncate max-w-[140px] text-olive">
              {translateCategory(product.category)}
            </span>
            <div className="flex items-center gap-1 font-semibold text-ink">
              <Star className="w-3.5 h-3.5 fill-olive text-olive" />
              <span>{reviewStats.rating.toFixed(1)}</span>
              <span className="text-ink/50 text-[11px]">({reviewStats.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-serif font-bold text-ink text-base line-clamp-2 leading-snug group-hover:text-olive transition-colors duration-250">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="mt-1 text-xs text-ink/75 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-2 border-t border-olive/10 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-lg font-extrabold text-olive">
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
            className={`px-3.5 py-2 rounded-btn font-semibold text-xs tracking-wide shadow-olive-sm transition-colors duration-200 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-olive ${
              inCart
                ? 'bg-olive text-cream hover:bg-olive-dark'
                : 'bg-olive text-cream hover:bg-olive-dark'
            }`}
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
      </div>
    </motion.div>
  );
});

export default ProductCard;
