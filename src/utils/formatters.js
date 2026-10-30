import { WHATSAPP_NUMBER, SHOP_NAME, CURRENCY_SYMBOL, getCleanWhatsAppNumber } from '../config';

export function formatCurrency(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `${CURRENCY_SYMBOL}${num.toLocaleString('en-IN')}`;
}

/**
 * Builds the standardized WhatsApp plain-text order message for cart checkout
 */
export function buildCartWhatsAppOrderMessage(cartItems, deliveryFee = 0) {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return '';
  }

  // Filter valid items
  const validItems = cartItems.filter(item => item && item.name && item.quantity > 0);
  if (validItems.length === 0) return '';

  const itemsCount = validItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
  const itemsSubtotal = validItems.reduce((acc, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const qty = parseInt(item.quantity, 10) || 1;
    return acc + (price * qty);
  }, 0);

  const lines = [
    'Hello! I would like to place a grocery order.',
    '',
    '*MY ORDER*',
    ''
  ];

  validItems.forEach((item, index) => {
    const qty = parseInt(item.quantity, 10) || 1;
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const lineSubtotal = price * qty;
    const unitText = item.unit ? ` (${item.unit})` : '';

    lines.push(`${index + 1}. ${item.name}${unitText}`);
    lines.push(`   Quantity: ${qty}`);
    lines.push(`   Unit Price: ${CURRENCY_SYMBOL}${price}`);
    lines.push(`   Subtotal: ${CURRENCY_SYMBOL}${lineSubtotal}`);
    lines.push('');
  });

  lines.push('--------------------------------');
  lines.push('');

  const numDeliveryFee = typeof deliveryFee === 'number' ? deliveryFee : parseFloat(deliveryFee) || 0;
  if (numDeliveryFee > 0) {
    lines.push(`Subtotal: ${CURRENCY_SYMBOL}${itemsSubtotal}`);
    lines.push(`Delivery: ${CURRENCY_SYMBOL}${numDeliveryFee}`);
  }

  const finalTotal = itemsSubtotal + numDeliveryFee;
  lines.push(`Total Items: ${itemsCount} unit${itemsCount === 1 ? '' : 's'}`);
  lines.push(`Total Amount: ${CURRENCY_SYMBOL}${finalTotal}`);
  lines.push('');
  lines.push('Please confirm my order. Thank you!');

  return lines.join('\n');
}

/**
 * Builds neatly formatted WhatsApp order URL for an individual item
 */
export function buildSingleProductWhatsAppUrl(product, quantity = 1) {
  const cleanNumber = getCleanWhatsAppNumber(WHATSAPP_NUMBER);
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const total = price * qty;
  const unitText = product.unit ? ` (${product.unit})` : '';

  const lines = [
    'Hello! I would like to place a grocery order.',
    '',
    '*MY ORDER*',
    '',
    `1. ${product.name}${unitText}`,
    `   Quantity: ${qty}`,
    `   Unit Price: ${CURRENCY_SYMBOL}${price}`,
    `   Subtotal: ${CURRENCY_SYMBOL}${total}`,
    '',
    '--------------------------------',
    '',
    `Total Items: ${qty} unit${qty === 1 ? '' : 's'}`,
    `Total Amount: ${CURRENCY_SYMBOL}${total}`,
    '',
    'Please confirm my order. Thank you!'
  ];

  const message = lines.join('\n');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds neatly formatted WhatsApp order URL for the entire Cart
 */
export function buildCartWhatsAppUrl(cartItems, deliveryFee = 0) {
  const cleanNumber = getCleanWhatsAppNumber(WHATSAPP_NUMBER);
  if (!cleanNumber) {
    console.error('WhatsApp phone number is not configured');
    return '#';
  }

  const message = buildCartWhatsAppOrderMessage(cartItems, deliveryFee);
  if (!message) {
    return `https://wa.me/${cleanNumber}`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * General shop query WhatsApp URL
 */
export function buildGeneralInquiryWhatsAppUrl(query = "") {
  const cleanNumber = getCleanWhatsAppNumber(WHATSAPP_NUMBER);
  const text = query || `Hello ${SHOP_NAME}, I would like to inquire about your products and delivery!`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Resolves local and remote product image URLs with Vite BASE_URL support
 */
export function getProductImageUrl(img) {
  if (!img) return '';
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
    return img;
  }
  const clean = img.startsWith('/') ? img.slice(1) : img;
  const base = import.meta.env.BASE_URL || './';
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
}
