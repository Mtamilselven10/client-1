import { WHATSAPP_NUMBER, SHOP_NAME, CURRENCY_SYMBOL } from '../config';

export function formatCurrency(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `${CURRENCY_SYMBOL}${num.toLocaleString('en-IN')}`;
}

/**
 * Builds neatly formatted WhatsApp order URL for an individual item
 */
export function buildSingleProductWhatsAppUrl(product, quantity = 1) {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const total = product.price * qty;

  const lines = [
    `🌿 *ORDER INQUIRY - ${SHOP_NAME.toUpperCase()}* 🌿`,
    ``,
    `Hello! I would like to place an order for the following item:`,
    ``,
    `*Product:* ${product.name}`,
    `*Item Code:* ${product.id}`,
    `*Unit/Pack:* ${product.unit || '1 unit'}`,
    `*Unit Price:* ${formatCurrency(product.price)}`,
    `*Quantity:* ${qty}`,
    `*Total Amount:* ${formatCurrency(total)}`,
  ];

  if (product.image && product.image.startsWith('http')) {
    lines.push(`*Image Reference:* ${product.image}`);
  }

  lines.push(``);
  lines.push(`Kindly confirm availability, delivery timeline, and payment details.`);
  lines.push(`Thank you!`);

  const message = lines.join('\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds neatly formatted WhatsApp order URL for the entire Cart
 */
export function buildCartWhatsAppUrl(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    return `https://wa.me/${WHATSAPP_NUMBER}`;
  }

  const grandTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const lines = [
    `🌿 *NEW ORDER - ${SHOP_NAME.toUpperCase()}* 🌿`,
    ``,
    `Hello! I would like to place an order for the following cart items:`,
    ``
  ];

  cartItems.forEach((item, index) => {
    lines.push(`${index + 1}. *${item.name}* (${item.id})`);
    lines.push(`   • Qty: ${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)} [${item.unit || 'Unit'}]`);
  });

  lines.push(``);
  lines.push(`------------------------------`);
  lines.push(`*Total Items:* ${cartItems.reduce((sum, i) => sum + i.quantity, 0)}`);
  lines.push(`*Grand Total:* ${formatCurrency(grandTotal)}`);
  lines.push(`------------------------------`);
  lines.push(``);
  lines.push(`Please let me know payment methods and estimated delivery.`);
  lines.push(`Thank you!`);

  const message = lines.join('\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * General shop query WhatsApp URL
 */
export function buildGeneralInquiryWhatsAppUrl(query = "") {
  const text = query || `Hello ${SHOP_NAME}, I would like to inquire about your products and delivery!`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
