import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Static fallback categories matching the Gandhi Shop 14 catalog departments
 */
export const FALLBACK_CATEGORIES = [
  { id: 'cat-1', name: 'Aachi Masala & Podi', name_ta: 'ஆச்சி மசாலா & பொடி', slug: 'aachi-masala-podi', display_order: 1, is_active: true },
  { id: 'cat-2', name: 'Sakthi & Other Cooking Masalas', name_ta: 'சக்தி & சமையல் மசாலாக்கள்', slug: 'sakthi-cooking-masalas', display_order: 2, is_active: true },
  { id: 'cat-3', name: 'Tea & Coffee', name_ta: 'டீ & காபி', slug: 'tea-coffee', display_order: 3, is_active: true },
  { id: 'cat-4', name: 'Sugar & Sweeteners', name_ta: 'சர்க்கரை & இனிப்பூட்டிகள்', slug: 'sugar-sweeteners', display_order: 4, is_active: true },
  { id: 'cat-5', name: 'Cooking Oil', name_ta: 'சமையல் எண்ணெய்', slug: 'cooking-oil', display_order: 5, is_active: true },
  { id: 'cat-6', name: 'Rice', name_ta: 'அரிசி ரகங்கள்', slug: 'rice', display_order: 6, is_active: true },
  { id: 'cat-7', name: 'Other Grocery Essentials', name_ta: 'மளிகை அத்தியாவசிய பொருட்கள்', slug: 'other-grocery-essentials', display_order: 7, is_active: true },
  { id: 'cat-8', name: 'Dishwash', name_ta: 'பாத்திரம் கழுவும் பொருட்கள்', slug: 'dishwash', display_order: 8, is_active: true },
  { id: 'cat-9', name: 'Laundry Detergent', name_ta: 'சலவை தூள்', slug: 'laundry-detergent', display_order: 9, is_active: true },
  { id: 'cat-10', name: 'Laundry Soap Bar', name_ta: 'சலவை சோப்', slug: 'laundry-soap-bar', display_order: 10, is_active: true },
  { id: 'cat-11', name: 'Bath Soap', name_ta: 'குளியல் சோப்', slug: 'bath-soap', display_order: 11, is_active: true },
  { id: 'cat-12', name: 'Cleaning Products', name_ta: 'வீட்டு தூய்மை பொருட்கள்', slug: 'cleaning-products', display_order: 12, is_active: true },
  { id: 'cat-13', name: 'Personal Care & Shampoo', name_ta: 'ஷாம்பு & தனிநபர் பராமரிப்பு', slug: 'personal-care-shampoo', display_order: 13, is_active: true },
  { id: 'cat-14', name: 'General Grocery', name_ta: 'பொது மளிகை', slug: 'general-grocery', display_order: 14, is_active: true },
];

/**
 * Fetch all active categories from Supabase with graceful local fallback
 * @returns {Promise<{ categories: Array, error: string | null }>}
 */
export async function getCategories() {
  if (!isSupabaseConfigured) {
    return { categories: FALLBACK_CATEGORIES, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('[categoriesService] Supabase query failed, using fallback categories:', error.message);
      return { categories: FALLBACK_CATEGORIES, error: error.message };
    }

    if (!data || data.length === 0) {
      return { categories: FALLBACK_CATEGORIES, error: null };
    }

    return { categories: data, error: null };
  } catch (err) {
    console.warn('[categoriesService] Network error, using fallback categories:', err.message);
    return { categories: FALLBACK_CATEGORIES, error: err.message };
  }
}

/**
 * Fetch a single category by slug
 * @param {string} slug 
 * @returns {Promise<{ category: Object | null, error: string | null }>}
 */
export async function getCategoryBySlug(slug) {
  if (!slug) return { category: null, error: 'Slug is required' };

  if (!isSupabaseConfigured) {
    const matched = FALLBACK_CATEGORIES.find(c => c.slug === slug);
    return { category: matched || null, error: matched ? null : 'Category not found' };
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      const fallback = FALLBACK_CATEGORIES.find(c => c.slug === slug);
      return { category: fallback || null, error: error.message };
    }

    return { category: data, error: null };
  } catch (err) {
    const fallback = FALLBACK_CATEGORIES.find(c => c.slug === slug);
    return { category: fallback || null, error: err.message };
  }
}
