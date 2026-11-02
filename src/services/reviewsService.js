import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Fetch all approved customer reviews for a given product
 * @param {string} productId 
 * @returns {Promise<{ reviews: Array, error: string | null }>}
 */
export async function getProductReviews(productId) {
  if (!productId) return { reviews: [], error: 'Product ID required' };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return { reviews: data, error: null };
      }
    } catch (err) {
      console.warn('[reviewsService] Supabase getProductReviews warning:', err.message);
    }
  }

  return { reviews: [], error: null };
}

/**
 * Submit a customer review for a product
 * @param {Object} params
 * @param {string} params.productId
 * @param {string} params.customerName
 * @param {number} params.rating (1-5)
 * @param {string} params.comment
 * @returns {Promise<{ success: boolean, review: Object | null, error: string | null }>}
 */
export async function submitReview({ productId, customerName = 'Verified Shopper', rating = 5, comment = '' }) {
  const sanitizedRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
  const reviewPayload = {
    product_id: productId,
    customer_name: customerName.trim() || 'Verified Shopper',
    rating: sanitizedRating,
    comment: comment.trim(),
    is_approved: true, // auto-approve verified customer feedback
  };

  if (!isSupabaseConfigured) {
    return {
      success: true,
      review: {
        id: `rev-${Date.now()}`,
        ...reviewPayload,
        created_at: new Date().toISOString(),
      },
      error: null,
      source: 'local',
    };
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewPayload)
      .select()
      .single();

    if (error) {
      return { success: false, review: null, error: error.message };
    }

    return { success: true, review: data, error: null, source: 'supabase' };
  } catch (err) {
    return { success: false, review: null, error: err.message };
  }
}
