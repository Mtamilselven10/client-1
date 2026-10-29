import React, { useState, forwardRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useFlyToCart } from '../animations/useFlyToCart';
import { formatCurrency, getProductImageUrl } from '../utils/formatters';

const WishlistCard = forwardRef(function WishlistCard(
  { item, onRemove, onAddToCart, translateCategory, t, navigate },
  ref
) {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorOrigin, setCursorOrigin] = useState('50% 50%');
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const pctX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const pctY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setCursorOrigin(`${pctX.toFixed(1)}% ${pctY.toFixed(1)}%`);
      const normX = (pctX - 50) / 50;
      const normY = (pctY - 50) / 50;
      setCursorOffset({ x: normX * 2, y: normY * 1.5 });
    }
    setIsHovered(true);
  };

  const handleMouseMove = (e) => {
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
    setIsHovered(false);
    setCursorOrigin('50% 50%');
    setCursorOffset({ x: 0, y: 0 });
  };

  const handleFocus = () => {
    setCursorOrigin('50% 50%');
    setCursorOffset({ x: 0, y: 0 });
    setIsHovered(true);
  };

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsHovered(false);
      setCursorOffset({ x: 0, y: 0 });
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      data-testid="wishlist-item"
      tabIndex={0}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={
        isHovered
          ? { 
              scale: 1.025, 
              y: -4 + cursorOffset.y, 
              x: cursorOffset.x,
              opacity: 1,
              transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
            }
          : { 
              scale: 1, 
              y: 0, 
              x: 0,
              opacity: 1,
              transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } 
            }
      }
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25 }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{ 
        transformOrigin: cursorOrigin,
        transformStyle: 'preserve-3d',
        willChange: 'transform, box-shadow'
      }}
      className="relative rounded-card overflow-hidden bg-cream-light border border-olive/20 shadow-olive-sm hover:shadow-ms-store hover:border-olive/50 transition-shadow transition-colors duration-300 flex flex-col justify-between group ms-product-card"
    >
      {/* Microsoft Store Fluent Ambient Light Sheen */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      {/* Image & Remove Action */}
      <div 
        onClick={() => navigate(`/products/${item.id}`, { state: { product: item } })}
        className="relative aspect-square w-full bg-cream-deep p-3 cursor-pointer overflow-hidden"
      >
        <img
          src={getProductImageUrl(item.image)}
          alt={item.name}
          loading="lazy"
          onError={(e) => {
            if (item.fallbackImage && e.currentTarget.src !== item.fallbackImage) {
              e.currentTarget.src = item.fallbackImage;
            }
          }}
          className="w-full h-full object-cover rounded-md group-hover:scale-106 transition-transform duration-400 ease-out"
        />
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cream/90 backdrop-blur-xs flex items-center justify-center text-olive hover:text-olive-dark border border-olive/20 shadow-xs transition-colors"
          aria-label={`Remove ${item.name} from wishlist`}
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
        <div className="absolute bottom-3 left-3 bg-ink/75 backdrop-blur-xs text-cream text-[10px] font-semibold px-2 py-0.5 rounded-md">
          {item.unit}
        </div>
      </div>

      {/* Details & Action */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-olive font-semibold mb-1">
            <span className="truncate max-w-[130px]">{translateCategory(item.category)}</span>
            <div className="flex items-center gap-1 text-ink">
              <Star className="w-3 h-3 fill-olive text-olive" />
              <span>{item.rating}</span>
            </div>
          </div>

          <h3 
            onClick={() => navigate(`/products/${item.id}`, { state: { product: item } })}
            className="font-serif font-bold text-ink text-base line-clamp-2 leading-snug cursor-pointer group-hover:text-olive transition-colors"
          >
            {item.name}
          </h3>

          <p className="mt-1 text-xs text-ink/70 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="pt-2 border-t border-olive/10 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-extrabold text-olive">
              {formatCurrency(item.price)}
            </span>
            {item.mrp > item.price && (
              <span className="text-xs text-ink/50 line-through">
                {formatCurrency(item.mrp)}
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <motion.button
            data-testid="wishlist-add-cart-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => onAddToCart(e, item)}
            className="w-full py-2.5 px-4 rounded-btn bg-olive text-cream font-bold text-xs shadow-olive-sm hover:bg-olive-dark transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('wishlist.addToCart')}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t, translateCategory } = useLanguage();
  const { triggerFlyToCart } = useFlyToCart();
  const navigate = useNavigate();

  const handleAddToCart = (e, item) => {
    const cardEl = e.currentTarget.closest('[data-testid="wishlist-item"]') || e.currentTarget;
    triggerFlyToCart(cardEl, item, 'card');
    addToCart(item, 1);
  };

  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto bg-cream">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-olive/15 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
            {t('wishlist.tag')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink mt-1">
            {t('wishlist.title')} ({wishlist.length})
          </h1>
          <p className="text-sm text-ink/75 mt-1">
            {t('wishlist.subtitle')}
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-bold text-olive hover:text-olive-dark underline underline-offset-4 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('wishlist.clearBtn')}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-20 text-center max-w-md mx-auto rounded-card bg-cream-light border border-olive/20 p-8 space-y-5 shadow-olive-sm"
        >
          <div className="w-16 h-16 rounded-full bg-olive-soft flex items-center justify-center mx-auto text-olive">
            <Heart className="w-8 h-8 text-olive" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-ink">{t('wishlist.emptyTitle')}</h2>
            <p className="text-sm text-ink/75 leading-relaxed">
              {t('wishlist.emptySubtitle')}
            </p>
          </div>
          <NavLink
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-md hover:bg-olive-dark transition-colors"
          >
            <span>{t('wishlist.exploreBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </motion.div>
      ) : (
        /* Wishlist Cards Grid with Fluid Motion */
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {wishlist.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={removeFromWishlist}
                onAddToCart={handleAddToCart}
                translateCategory={translateCategory}
                t={t}
                navigate={navigate}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
