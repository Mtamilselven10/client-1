import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getStoredOrders, 
  saveStoredOrders, 
  createOrderRecord, 
  extractBuyAgainProducts, 
  getSampleOrders 
} from '../utils/orderUtils';
import { useToast } from './ToastContext';

const OrderHistoryContext = createContext(null);

export function OrderHistoryProvider({ children }) {
  const [orders, setOrders] = useState(() => getStoredOrders());
  const { addToast } = useToast();

  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  /**
   * Record a new completed WhatsApp checkout order
   */
  const recordOrder = useCallback(({ items, subtotal, deliveryFee, total }) => {
    if (!items || items.length === 0) return null;

    const newOrder = createOrderRecord({ items, subtotal, deliveryFee, total });
    setOrders(prev => [newOrder, ...prev]);

    return newOrder;
  }, []);

  /**
   * Clear all order history
   */
  const clearOrderHistory = useCallback(() => {
    setOrders([]);
    addToast('Order history cleared', 'info');
  }, [addToast]);

  /**
   * Populate sample orders for testing/demoing
   */
  const seedSampleOrders = useCallback(() => {
    const samples = getSampleOrders();
    setOrders(samples);
    addToast('Loaded sample purchase history for demonstration', 'success');
  }, [addToast]);

  /**
   * Get unique hydrated Buy Again products from all orders
   */
  const getBuyAgainProducts = useCallback((catalog = []) => {
    return extractBuyAgainProducts(orders, catalog);
  }, [orders]);

  /**
   * Reorder all items from a past order into current cart
   */
  const reorderEntireBasket = useCallback((order, addToCart) => {
    if (!order || !order.items || order.items.length === 0 || typeof addToCart !== 'function') {
      return 0;
    }

    order.items.forEach(item => {
      addToCart(item, item.quantity || 1, false);
    });

    addToast(`Reordered ${order.items.length} provisions into your cart!`, 'success');
    return order.items.length;
  }, [addToast]);

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  return (
    <OrderHistoryContext.Provider value={{
      orders,
      hasOrders,
      recordOrder,
      clearOrderHistory,
      seedSampleOrders,
      getBuyAgainProducts,
      reorderEntireBasket
    }}>
      {children}
    </OrderHistoryContext.Provider>
  );
}

export function useOrderHistory() {
  const context = useContext(OrderHistoryContext);
  if (!context) {
    throw new Error('useOrderHistory must be used within an OrderHistoryProvider');
  }
  return context;
}
