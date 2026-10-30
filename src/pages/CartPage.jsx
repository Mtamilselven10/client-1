import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  MessageCircle, 
  ShieldCheck, 
  Truck,
  Plus,
  Minus
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  formatCurrency, 
  buildSingleProductWhatsAppUrl, 
  buildCartWhatsAppUrl,
  getProductImageUrl
} from '../utils/formatters';
import { SHOP_NAME, WHATSAPP_NUMBER, getCleanWhatsAppNumber } from '../config';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, getItemCount } = useCart();
  const { t, translateCategory } = useLanguage();
  const navigate = useNavigate();

  const [isOrdering, setIsOrdering] = React.useState(false);
  const [orderError, setOrderError] = React.useState('');

  const totalAmount = getCartTotal();
  const totalItems = getItemCount();
  const deliveryFee = totalAmount >= 499 || totalAmount === 0 ? 0 : 40;
  const payableAmount = totalAmount + deliveryFee;

  const handleOrderNow = (e) => {
    if (e) e.preventDefault();
    setOrderError('');

    // Validation 1: Cart is not empty
    if (!cart || cart.length === 0) {
      setOrderError('Your cart is empty. Please add products before checking out.');
      return;
    }

    // Validation 2: Cart items validity
    const hasInvalidItem = cart.some(
      item => !item || !item.name || typeof item.price !== 'number' || item.quantity <= 0
    );
    if (hasInvalidItem) {
      setOrderError('Some items in your cart have invalid details. Please refresh or adjust quantities.');
      return;
    }

    // Validation 3: WhatsApp phone number configured
    const cleanNumber = getCleanWhatsAppNumber(WHATSAPP_NUMBER);
    if (!cleanNumber) {
      setOrderError('Store WhatsApp phone number is not properly configured.');
      return;
    }

    setIsOrdering(true);

    try {
      const url = buildCartWhatsAppUrl(cart, deliveryFee);
      // Safe popup / tab opener
      const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!openedWindow || openedWindow.closed || typeof openedWindow.closed === 'undefined') {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Error opening WhatsApp URL:', err);
      setOrderError('Could not open WhatsApp. Please check your browser popup settings.');
    } finally {
      setTimeout(() => {
        setIsOrdering(false);
      }, 1500);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto bg-cream">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-olive/15 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
            {t('cart.tag')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink mt-1">
            {t('cart.title')} ({totalItems} {t('cart.itemsSuffix')})
          </h1>
          <p className="text-sm text-ink/75 mt-1">
            {t('cart.subtitle')}
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-bold text-olive hover:text-olive-dark underline underline-offset-4 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('cart.emptyBtn')}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {cart.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="py-20 text-center max-w-md mx-auto rounded-card bg-cream-light border border-olive/20 p-8 space-y-5 shadow-olive-sm"
        >
          <div className="w-16 h-16 rounded-full bg-olive-soft flex items-center justify-center mx-auto text-olive">
            <ShoppingCart className="w-8 h-8 text-olive" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-ink">{t('cart.emptyTitle')}</h2>
            <p className="text-sm text-ink/75 leading-relaxed">
              {t('cart.emptySubtitle')}
            </p>
          </div>
          <NavLink
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-md hover:bg-olive-dark transition-colors"
          >
            <span>{t('cart.exploreBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </motion.div>
      ) : (
        /* Cart Content Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item, index) => {
                const itemTotal = item.price * item.quantity;
                const singleItemOrderUrl = buildSingleProductWhatsAppUrl(item, item.quantity);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.95,
                      height: 0,
                      marginBottom: 0,
                      paddingTop: 0,
                      paddingBottom: 0,
                      overflow: 'hidden',
                      transition: { duration: 0.28 }
                    }}
                    transition={{ delay: index * 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="p-4 sm:p-5 rounded-card bg-cream-light border border-olive/20 shadow-olive-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-colors hover:border-olive"
                  >
                    {/* Thumbnail and Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={getProductImageUrl(item.image)}
                        alt={item.name}
                        onError={(e) => {
                          if (item.fallbackImage && e.currentTarget.src !== item.fallbackImage) {
                            e.currentTarget.src = item.fallbackImage;
                          }
                        }}
                        onClick={() => navigate(`/products/${item.id}`, { state: { product: item } })}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-btn object-cover bg-cream-deep border border-olive/15 shrink-0 cursor-pointer"
                      />

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-olive uppercase tracking-wider">
                          {translateCategory(item.category)} • {item.id}
                        </span>
                        <h3 
                          onClick={() => navigate(`/products/${item.id}`, { state: { product: item } })}
                          className="font-serif font-bold text-ink text-base line-clamp-1 cursor-pointer hover:text-olive transition-colors"
                        >
                          {item.name}
                        </h3>
                        <div className="text-xs text-ink/70">
                          {t('cart.packUnit')} <span className="font-semibold text-ink">{item.unit || '1 unit'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-serif font-extrabold text-olive text-sm">
                            {formatCurrency(item.price)}
                          </span>
                          <span className="text-ink/50 text-[11px]">{t('cart.perUnit')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper & Individual WhatsApp Order */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-olive/10">
                      {/* Stepper with roll/pop */}
                      <div className="flex items-center rounded-btn bg-cream border border-olive/25 overflow-hidden">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 px-2.5 text-olive hover:bg-olive-soft transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.span 
                          key={item.quantity}
                          initial={{ scale: 0.8, y: -4 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="px-3 py-1 text-xs font-bold text-ink min-w-[32px] text-center inline-block"
                        >
                          {item.quantity}
                        </motion.span>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 px-2.5 text-olive hover:bg-olive-soft transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[80px]">
                        <motion.div 
                          key={itemTotal}
                          initial={{ opacity: 0.7, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="font-serif font-extrabold text-olive text-base"
                        >
                          {formatCurrency(itemTotal)}
                        </motion.div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] text-ink/50 hover:text-olive underline transition-colors"
                        >
                          {t('cart.remove')}
                        </button>
                      </div>

                      {/* Individual WhatsApp Order Button */}
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={singleItemOrderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-btn bg-olive text-cream font-bold text-xs shadow-olive-sm hover:bg-olive-dark transition-colors flex items-center gap-1.5 shrink-0 focus-visible:ring-2 focus-visible:ring-olive"
                        title="Order this specific item on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-cream" />
                        <span>{t('cart.orderItem')}</span>
                      </motion.a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Cart Summary Sidebar (4 cols) */}
          <div className="lg:col-span-4 sticky top-6 space-y-6">
            <div className="p-6 rounded-card bg-cream-deep border border-olive/20 shadow-olive-sm space-y-5">
              <h2 className="font-serif text-xl font-bold text-ink border-b border-olive/15 pb-3">
                {t('cart.orderSummary')}
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-ink/80">
                  <span>{t('cart.subtotal')} ({totalItems} {t('cart.itemsSuffix')})</span>
                  <span className="font-bold text-ink">{formatCurrency(totalAmount)}</span>
                </div>

                <div className="flex justify-between text-ink/80">
                  <span>{t('cart.estDelivery')}</span>
                  <span className="font-bold text-olive">
                    {totalAmount >= 499 ? t('cart.freeOffer') : '₹40'}
                  </span>
                </div>

                <div className="flex justify-between text-ink/80">
                  <span>{t('cart.purityCert')}</span>
                  <span className="font-bold text-olive">{t('cart.includedFree')}</span>
                </div>

                <div className="pt-3 border-t border-olive/20 flex justify-between items-baseline">
                  <span className="font-serif text-lg font-bold text-ink">{t('cart.totalPayable')}</span>
                  <motion.span 
                    key={totalAmount}
                    initial={{ opacity: 0.6, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="font-serif text-2xl font-extrabold text-olive inline-block"
                  >
                    {formatCurrency(payableAmount)}
                  </motion.span>
                </div>
              </div>

              {orderError && (
                <div className="p-3 text-xs rounded-btn bg-red-100 text-red-800 border border-red-200 text-center font-medium">
                  {orderError}
                </div>
              )}

              {/* Order Full Cart via WhatsApp Button */}
              <button
                type="button"
                onClick={handleOrderNow}
                disabled={isOrdering || cart.length === 0}
                className={`w-full py-4 px-6 rounded-btn font-bold text-sm shadow-olive-md transition-all flex items-center justify-center gap-2 border text-center focus-visible:ring-2 focus-visible:ring-olive ${
                  isOrdering || cart.length === 0
                    ? 'bg-olive/60 text-cream cursor-not-allowed border-olive/50'
                    : 'bg-olive text-cream hover:bg-olive-dark active:scale-98 border-olive-dark cursor-pointer'
                }`}
              >
                <MessageCircle className="w-5 h-5 text-cream" />
                <span>{isOrdering ? 'Opening WhatsApp...' : 'Order Now'}</span>
              </button>

              <p className="text-[11px] text-ink/65 text-center leading-relaxed">
                {t('cart.orderHint')}
              </p>
            </div>

            {/* Assurance Box */}
            <div className="p-4 rounded-card bg-cream-light border border-olive/15 space-y-3 text-xs text-ink/80">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-olive shrink-0" />
                <span>{t('cart.freshBox')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-olive shrink-0" />
                <span>{t('cart.guarantee')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
