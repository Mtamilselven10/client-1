import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  ShoppingBag, 
  PackageCheck, 
  Calendar, 
  ArrowRight, 
  Trash2, 
  Plus, 
  Check, 
  ShoppingCart,
  MessageCircle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useOrderHistory } from '../../context/OrderHistoryContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { loadProductsCatalog } from '../../utils/excelParser';
import { formatCurrency, getProductImageUrl } from '../../utils/formatters';
import { formatOrderDate } from '../../utils/orderUtils';
import { WHATSAPP_NUMBER } from '../../config';

export default function OrdersHistoryDashboard() {
  const { 
    orders, 
    hasOrders, 
    clearOrderHistory, 
    seedSampleOrders, 
    getBuyAgainProducts, 
    reorderEntireBasket 
  } = useOrderHistory();

  const { addToCart, isInCart, getProductQuantity } = useCart();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState('buy_again'); // 'buy_again' | 'history'
  const [catalog, setCatalog] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [justReorderedId, setJustReorderedId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    loadProductsCatalog()
      .then(data => {
        if (isMounted) setCatalog(data || []);
      })
      .catch(console.error);
    return () => {
      isMounted = false;
    };
  }, []);

  const buyAgainProducts = useMemo(() => {
    return getBuyAgainProducts(catalog);
  }, [catalog, getBuyAgainProducts]);

  const handleReorderItem = (product) => {
    addToCart(product, 1, true);
    setJustReorderedId(product.id);
    setTimeout(() => setJustReorderedId(null), 1200);
  };

  const handleReorderOrder = (order) => {
    reorderEntireBasket(order, addToCart);
    setJustReorderedId(order.id);
    setTimeout(() => setJustReorderedId(null), 1200);
  };

  const toggleOrderExpand = (id) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-olive/15">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-cream-light rounded-xl border border-olive/20 shadow-olive-xs self-start">
          <button
            type="button"
            data-testid="tab-buy-again"
            onClick={() => setActiveTab('buy_again')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'buy_again'
                ? 'bg-olive text-cream shadow-olive-xs'
                : 'text-ink/70 hover:text-ink'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('buyAgain.tabBuyAgain') || 'Buy Again'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'buy_again' ? 'bg-cream/20 text-cream' : 'bg-olive/10 text-olive'
            }`}>
              {buyAgainProducts.length}
            </span>
          </button>

          <button
            type="button"
            data-testid="tab-order-history"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-olive text-cream shadow-olive-xs'
                : 'text-ink/70 hover:text-ink'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>{t('buyAgain.tabOrderHistory') || 'Past Orders'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'history' ? 'bg-cream/20 text-cream' : 'bg-olive/10 text-olive'
            }`}>
              {orders.length}
            </span>
          </button>
        </div>

        {/* Global Controls: Clear History & Seed Demo */}
        <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
          {!hasOrders ? (
            <button
              type="button"
              onClick={seedSampleOrders}
              className="px-3 py-1.5 rounded-lg bg-olive/10 hover:bg-olive/20 text-olive font-bold border border-olive/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-olive" />
              <span>{t('buyAgain.seedDemoBtn') || 'Load Demo Orders'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={clearOrderHistory}
              className="text-ink/60 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('buyAgain.clearHistory') || 'Clear History'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!hasOrders && (
        <div className="py-16 text-center max-w-md mx-auto rounded-card bg-cream-light border border-olive/20 p-8 space-y-5 shadow-olive-sm">
          <div className="w-16 h-16 rounded-full bg-olive-soft flex items-center justify-center mx-auto text-olive">
            <RotateCcw className="w-8 h-8 text-olive" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-ink">
              {t('buyAgain.emptyTitle') || 'No Past Orders Recorded'}
            </h3>
            <p className="text-sm text-ink/75 leading-relaxed">
              {t('buyAgain.emptySubtitle') || 'Whenever you place orders via WhatsApp, your selected provisions are logged here for rapid 1-click pantry restocking.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              data-testid="empty-seed-btn"
              onClick={seedSampleOrders}
              className="w-full sm:w-auto px-5 py-2.5 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-sm hover:bg-olive-dark transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cream" />
              <span>{t('buyAgain.seedDemoBtn') || 'Load Demo Purchase History'}</span>
            </button>
            <NavLink
              to="/products"
              className="w-full sm:w-auto px-5 py-2.5 rounded-btn bg-cream-light border border-olive/30 text-olive font-bold text-sm hover:bg-olive/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{t('buyAgain.browseCatalog') || 'Browse Catalog'}</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      )}

      {/* TAB 1: BUY AGAIN GRID */}
      {hasOrders && activeTab === 'buy_again' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-ink/70">
              {t('buyAgain.buyAgainDesc') || 'Your regularly purchased groceries with live pricing and instant reorder.'}
            </p>
            <span className="text-xs font-bold text-olive">
              {buyAgainProducts.length} {t('buyAgain.itemsCountSuffix') || 'items'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {buyAgainProducts.map(product => {
              const inCartAlready = isInCart(product.id);
              const qtyInCart = getProductQuantity(product.id);
              const isReordered = justReorderedId === product.id;

              return (
                <div
                  key={product.id}
                  data-testid="buy-again-product-card"
                  className="bg-cream-light rounded-2xl border border-olive/20 p-4 shadow-olive-sm hover:shadow-olive-md hover:border-olive/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-olive/15 text-olive border border-olive/20">
                        <RotateCcw className="w-2.5 h-2.5 text-olive" />
                        <span>{product.purchaseBadge || 'Ordered'}</span>
                      </span>

                      {product.lastOrderedAt && (
                        <span className="text-[10px] text-ink/50 font-medium">
                          {formatOrderDate(product.lastOrderedAt, language).split(',')[0]}
                        </span>
                      )}
                    </div>

                    {/* Image & Title Link */}
                    <NavLink
                      to={`/products/${product.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-16 h-16 rounded-xl bg-cream-deep p-1.5 shrink-0 overflow-hidden border border-olive/15">
                        <img
                          src={getProductImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-sm text-ink group-hover:text-olive transition-colors line-clamp-2 leading-tight">
                          {product.name}
                        </h4>
                        {product.tamilName && (
                          <p className="text-xs text-ink/60 truncate mt-0.5">
                            {product.tamilName}
                          </p>
                        )}
                        <span className="text-[11px] text-ink/65 font-medium">
                          {product.unit}
                        </span>
                      </div>
                    </NavLink>
                  </div>

                  {/* Price & Reorder Action */}
                  <div className="pt-2 border-t border-olive/15 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-serif font-extrabold text-base text-olive">
                        {formatCurrency(product.price)}
                      </div>
                      {product.mrp > product.price && (
                        <div className="text-[10px] text-ink/40 line-through">
                          {formatCurrency(product.mrp)}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      data-testid="reorder-item-btn"
                      onClick={() => handleReorderItem(product)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-olive-xs cursor-pointer active:scale-95 ${
                        isReordered
                          ? 'bg-olive-dark text-cream'
                          : inCartAlready
                          ? 'bg-olive text-cream hover:bg-olive-dark'
                          : 'bg-olive text-cream hover:bg-olive-dark'
                      }`}
                    >
                      {isReordered ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-cream" />
                          <span>{t('buyAgain.reordered') || 'Added!'}</span>
                        </>
                      ) : inCartAlready ? (
                        <>
                          <Plus className="w-3.5 h-3.5 text-cream" />
                          <span>{t('buyAgain.inCartAddMore', { qty: qtyInCart }) || `In Cart (${qtyInCart})`}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5 text-cream" />
                          <span>{t('buyAgain.reorderBtn') || 'Reorder'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ORDER HISTORY TIMELINE */}
      {hasOrders && activeTab === 'history' && (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-ink/70">
            {t('buyAgain.historyDesc') || 'Chronological log of WhatsApp orders. Reorder entire baskets with 1 click.'}
          </p>

          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const formattedDate = formatOrderDate(order.timestamp, language);
              const isReorderedBasket = justReorderedId === order.id;

              return (
                <div
                  key={order.id}
                  data-testid="order-history-card"
                  className="bg-cream-light rounded-2xl border border-olive/20 p-5 sm:p-6 shadow-olive-sm space-y-4 transition-all"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-olive/15">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-olive bg-olive/10 px-2.5 py-0.5 rounded-full border border-olive/20">
                          {order.id}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">
                          <MessageCircle className="w-3 h-3 text-green-700" />
                          <span>{t('buyAgain.whatsappPlaced') || 'WhatsApp Order'}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-ink/65">
                        <Calendar className="w-3.5 h-3.5 text-olive" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Order Metrics & 1-Click Reorder Basket Action */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-ink/60">
                          {order.itemCount} {t('buyAgain.itemsCountSuffix') || 'items'}
                        </div>
                        <div className="font-serif font-extrabold text-base sm:text-lg text-olive">
                          {formatCurrency(order.total)}
                        </div>
                      </div>

                      <button
                        type="button"
                        data-testid="reorder-basket-btn"
                        onClick={() => handleReorderOrder(order)}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-olive-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-97 ${
                          isReorderedBasket
                            ? 'bg-olive-dark text-cream'
                            : 'bg-olive text-cream hover:bg-olive-dark'
                        }`}
                      >
                        {isReorderedBasket ? (
                          <>
                            <Check className="w-4 h-4 text-cream" />
                            <span>{t('buyAgain.basketReordered') || 'Reordered!'}</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 text-cream" />
                            <span>{t('buyAgain.reorderBasketBtn') || 'Reorder Basket'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Order Items Preview / Summary */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {(order.items || []).slice(0, isExpanded ? undefined : 3).map((item, idx) => (
                        <div
                          key={`${item.id}-${idx}`}
                          className="flex items-center gap-3 p-2 rounded-xl bg-cream border border-olive/10"
                        >
                          <div className="w-12 h-12 rounded-lg bg-cream-deep p-1 shrink-0 overflow-hidden border border-olive/10">
                            <img
                              src={getProductImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover rounded"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-serif font-bold text-xs text-ink truncate">
                              {item.name}
                            </h5>
                            <div className="text-[11px] text-ink/70 flex items-center justify-between mt-0.5">
                              <span>Qty: {item.quantity}</span>
                              <span className="font-bold text-olive">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expand / Collapse Button if > 3 items */}
                    {(order.items?.length > 3) && (
                      <button
                        type="button"
                        onClick={() => toggleOrderExpand(order.id)}
                        className="text-xs font-bold text-olive hover:text-olive-dark flex items-center gap-1 pt-1 transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <span>{t('buyAgain.showLess') || 'Show Less'}</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>{t('buyAgain.showAllItems', { count: order.items.length }) || `View all ${order.items.length} items`}</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
