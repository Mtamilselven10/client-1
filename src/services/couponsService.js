import { supabase, isSupabaseConfigured } from './supabaseClient';

const FALLBACK_COUPONS = {
  WELCOME50: {
    code: 'WELCOME50',
    discount_type: 'fixed',
    discount_value: 50.0,
    min_order_amount: 499.0,
    max_discount: 50.0,
    is_active: true,
  },
  GANDHI10: {
    code: 'GANDHI10',
    discount_type: 'percent',
    discount_value: 10.0,
    min_order_amount: 999.0,
    max_discount: 150.0,
    is_active: true,
  },
};

/**
 * Validate a promotional coupon code and calculate applicable savings
 * @param {string} code 
 * @param {number} orderAmount 
 * @returns {Promise<{ valid: boolean, discountAmount: number, coupon: Object | null, message: string }>}
 */
export async function validateCoupon(code, orderAmount = 0) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (!normalizedCode) {
    return { valid: false, discountAmount: 0, coupon: null, message: 'Please enter a coupon code.' };
  }

  let coupon = null;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', normalizedCode)
        .eq('is_active', true)
        .maybeSingle();

      if (!error && data) {
        coupon = data;
      }
    } catch (err) {
      console.warn('[couponsService] Supabase query notice:', err.message);
    }
  }

  // Fallback to static coupon dictionary
  if (!coupon) {
    coupon = FALLBACK_COUPONS[normalizedCode] || null;
  }

  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      coupon: null,
      message: 'Invalid coupon code. Try WELCOME50 or GANDHI10.',
    };
  }

  // Check validity dates
  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return { valid: false, discountAmount: 0, coupon, message: 'This coupon is not active yet.' };
  }
  if (coupon.valid_to && new Date(coupon.valid_to) < now) {
    return { valid: false, discountAmount: 0, coupon, message: 'This coupon has expired.' };
  }

  // Check usage limit
  if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, discountAmount: 0, coupon, message: 'Coupon usage limit has been reached.' };
  }

  // Check minimum order value
  const minAmount = Number(coupon.min_order_amount) || 0;
  if (orderAmount < minAmount) {
    return {
      valid: false,
      discountAmount: 0,
      coupon,
      message: `Minimum order value of ₹${minAmount} required for this coupon.`,
    };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discount_type === 'percent') {
    discount = (orderAmount * Number(coupon.discount_value)) / 100;
    if (coupon.max_discount && discount > Number(coupon.max_discount)) {
      discount = Number(coupon.max_discount);
    }
  } else {
    // Fixed discount
    discount = Math.min(orderAmount, Number(coupon.discount_value));
  }

  discount = Math.round(discount * 100) / 100;

  return {
    valid: true,
    discountAmount: discount,
    coupon,
    message: `Coupon ${coupon.code} applied! You save ₹${discount}.`,
  };
}
