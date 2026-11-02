import { supabase, isSupabaseConfigured } from './supabaseClient';
import { generateOrderId, saveStoredOrders, getStoredOrders } from '../utils/orderUtils';

/**
 * Persist an order to Supabase orders & order_items tables
 * with automatic fallback to local order storage.
 * @param {Object} params
 * @param {Object} params.orderData - Top-level order metadata
 * @param {Array} params.items - Cart items to associate with order
 * @returns {Promise<{ order: Object, items: Array, success: boolean, error: string | null }>}
 */
export async function createOrder({ orderData = {}, items = [] } = {}) {
  const orderNumber = orderData.orderNumber || orderData.order_number || generateOrderId();
  const subtotal = Number(orderData.subtotal) || 0;
  const deliveryFee = Number(orderData.deliveryFee || orderData.delivery_fee) || 0;
  const discountAmount = Number(orderData.discountAmount || orderData.discount_amount) || 0;
  const totalAmount = Number(orderData.totalAmount || orderData.total_amount) || (subtotal + deliveryFee - discountAmount);

  const localRecord = {
    id: orderNumber,
    orderNumber,
    timestamp: new Date().toISOString(),
    customerName: orderData.customerName || orderData.customer_name || 'Guest Shopper',
    customerPhone: orderData.customerPhone || orderData.customer_phone || '',
    deliveryAddress: orderData.deliveryAddress || orderData.delivery_address || '',
    subtotal,
    deliveryFee,
    discountAmount,
    total: totalAmount,
    status: orderData.status || 'placed_via_whatsapp',
    paymentMethod: orderData.paymentMethod || 'whatsapp_cod',
    items: items.map(it => ({
      id: it.id || it.sku || it.product_sku,
      name: it.name || it.product_name,
      tamilName: it.tamilName || it.name_ta || '',
      price: Number(it.price) || 0,
      mrp: Number(it.mrp) || Number(it.price) || 0,
      unit: it.unit || '1 unit',
      quantity: Number(it.quantity) || 1,
      image: it.image || it.image_url || '',
    })),
  };

  // Always update local cache for Buy Again & Order History instant responsiveness
  try {
    const existing = getStoredOrders();
    saveStoredOrders([localRecord, ...existing.filter(o => o.id !== orderNumber)]);
  } catch (cacheErr) {
    console.warn('[ordersService] Local cache update notice:', cacheErr);
  }

  // If Supabase is unconfigured, return successfully with local record
  if (!isSupabaseConfigured) {
    return {
      order: localRecord,
      items: localRecord.items,
      success: true,
      error: null,
      source: 'local',
    };
  }

  try {
    // 1. Insert into public.orders
    const { data: dbOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: localRecord.customerName,
        customer_phone: localRecord.customerPhone,
        delivery_address: localRecord.deliveryAddress,
        subtotal,
        discount_amount: discountAmount,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        status: localRecord.status,
        payment_method: localRecord.paymentMethod,
        payment_status: 'cod',
        whatsapp_message_sent: true,
        notes: orderData.notes || '',
      })
      .select()
      .single();

    if (orderError) {
      console.warn('[ordersService] Supabase order insert error, kept in local history:', orderError.message);
      return {
        order: localRecord,
        items: localRecord.items,
        success: true,
        error: orderError.message,
        source: 'local_fallback',
      };
    }

    // 2. Prepare and insert order items
    const orderItemsRows = items.map(it => ({
      order_id: dbOrder.id,
      product_sku: it.sku || it.id || it.product_sku || null,
      product_name: it.name || it.product_name || 'Provision Item',
      product_name_ta: it.name_ta || it.tamilName || null,
      unit: it.unit || '1 unit',
      price: Number(it.price) || 0,
      mrp: Number(it.mrp) || Number(it.price) || 0,
      quantity: Math.max(1, Number(it.quantity) || 1),
      total_price: (Number(it.price) || 0) * (Math.max(1, Number(it.quantity) || 1)),
      image_url: it.image || it.image_url || '',
    }));

    const { data: dbItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsRows)
      .select();

    if (itemsError) {
      console.warn('[ordersService] Order created but items insert logged warning:', itemsError.message);
    }

    return {
      order: dbOrder,
      items: dbItems || orderItemsRows,
      success: true,
      error: null,
      source: 'supabase',
    };
  } catch (err) {
    console.warn('[ordersService] Network exception during Supabase order creation:', err.message);
    return {
      order: localRecord,
      items: localRecord.items,
      success: true,
      error: err.message,
      source: 'local_fallback',
    };
  }
}

/**
 * Fetch an order by order_number (e.g., GS-ORD-...)
 * @param {string} orderNumber 
 * @returns {Promise<{ order: Object | null, items: Array, error: string | null }>}
 */
export async function getOrderByNumber(orderNumber) {
  if (!orderNumber) return { order: null, items: [], error: 'Order number is required' };

  if (isSupabaseConfigured) {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (!error && order) {
        return {
          order,
          items: order.order_items || [],
          error: null,
        };
      }
    } catch (err) {
      console.warn('[ordersService] Supabase getOrderByNumber failed:', err.message);
    }
  }

  // Local lookup fallback
  const local = getStoredOrders().find(o => o.orderNumber === orderNumber || o.id === orderNumber);
  return {
    order: local || null,
    items: local?.items || [],
    error: local ? null : 'Order not found',
  };
}

/**
 * Fetch order by internal UUID
 * @param {string} orderId 
 * @returns {Promise<{ order: Object | null, items: Array, error: string | null }>}
 */
export async function getOrderById(orderId) {
  if (!orderId) return { order: null, items: [], error: 'Order ID is required' };

  if (isSupabaseConfigured) {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (!error && order) {
        return {
          order,
          items: order.order_items || [],
          error: null,
        };
      }
    } catch (err) {
      console.warn('[ordersService] Supabase getOrderById error:', err.message);
    }
  }

  return getOrderByNumber(orderId);
}

/**
 * Update order status (Admin / System)
 * @param {string} orderId 
 * @param {string} status 
 * @returns {Promise<{ success: boolean, error: string | null }>}
 */
export async function updateOrderStatus(orderId, status) {
  if (!isSupabaseConfigured) {
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    return { success: !error, error: error ? error.message : null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
