import { supabase, isSupabaseConfigured } from './supabaseClient';
import { loadProductsCatalog } from '../utils/excelParser';

/**
 * Standardize product object structure to ensure 100% compatibility
 * with existing Gandhi Shop frontend components and Supabase columns.
 */
export function formatProductRecord(row) {
  if (!row) return null;

  const id = row.sku || row.id ? String(row.sku || row.id) : '';
  const price = Number(row.price) || 0;
  const mrp = Number(row.mrp) || Math.round(price * 1.2);
  const discountPercent = row.discount_percent !== undefined 
    ? row.discount_percent 
    : (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

  return {
    id,
    dbId: row.id, // Supabase UUID
    sku: row.sku || id,
    name: row.name || '',
    nameTa: row.name_ta || row.tamilName || '',
    slug: row.slug || '',
    category: row.category_name || row.category || 'General Grocery',
    categoryId: row.category_id || null,
    price,
    mrp,
    discountPercent,
    unit: row.unit || '1 unit',
    stockQuantity: row.stock_quantity !== undefined ? row.stock_quantity : 100,
    inStock: row.in_stock !== undefined ? row.in_stock : (row.stock_quantity > 0),
    minOrderQty: row.min_order_qty || 1,
    maxOrderQty: row.max_order_qty || 50,
    rating: Number(row.rating) || 4.8,
    reviewsCount: Number(row.reviews_count || row.reviewsCount) || 0,
    image: row.image_url || row.image || '',
    imageUrl: row.image_url || row.image || '',
    imageStoragePath: row.image_storage_path || null,
    description: row.description || '',
    details: row.details || '',
    isFeatured: Boolean(row.is_featured),
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at || null,
  };
}

/**
 * Fetch products with pagination, search, category filtering, and sorting
 * @param {Object} options
 * @param {string} [options.category] - Category name or slug
 * @param {string} [options.search] - Search keyword
 * @param {string} [options.sort] - 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'name'
 * @param {number} [options.page=1]
 * @param {number} [options.limit=50]
 * @param {boolean} [options.inStockOnly=false]
 * @returns {Promise<{ products: Array, totalCount: number, page: number, totalPages: number, error: string | null }>}
 */
export async function getProducts({
  category = null,
  search = '',
  sort = 'newest',
  page = 1,
  limit = 50,
  inStockOnly = false,
} = {}) {
  // If Supabase is unconfigured, fall back to local Excel/Seed catalog
  if (!isSupabaseConfigured) {
    return getLocalProductsCatalog({ category, search, sort, page, limit, inStockOnly });
  }

  try {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (inStockOnly) {
      query = query.eq('in_stock', true);
    }

    if (category && category !== 'All' && category !== 'all') {
      query = query.eq('category_name', category);
    }

    if (search && search.trim()) {
      const term = search.trim();
      query = query.or(`name.ilike.%${term}%,name_ta.ilike.%${term}%,description.ilike.%${term}%`);
    }

    // Sort order
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const from = Math.max(0, (page - 1) * limit);
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.warn('[productsService] Supabase products query error, falling back to local:', error.message);
      return getLocalProductsCatalog({ category, search, sort, page, limit, inStockOnly });
    }

    // If database is empty (prior to Phase 5 import), fall back gracefully
    if (!data || data.length === 0) {
      const fallbackResult = await getLocalProductsCatalog({ category, search, sort, page, limit, inStockOnly });
      if (fallbackResult.products.length > 0) {
        return fallbackResult;
      }
    }

    const totalCount = count || data.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const formatted = (data || []).map(formatProductRecord);

    return {
      products: formatted,
      totalCount,
      page,
      totalPages,
      error: null,
    };
  } catch (err) {
    console.warn('[productsService] Network error fetching from Supabase, using local catalog:', err.message);
    return getLocalProductsCatalog({ category, search, sort, page, limit, inStockOnly });
  }
}

/**
 * Fetch a single product by SKU or Supabase UUID
 * @param {string} idOrSku 
 * @returns {Promise<{ product: Object | null, error: string | null }>}
 */
export async function getProductById(idOrSku) {
  if (!idOrSku) return { product: null, error: 'Product ID is required' };

  if (isSupabaseConfigured) {
    try {
      // Check if ID is UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSku);
      let query = supabase.from('products').select('*');
      
      if (isUuid) {
        query = query.eq('id', idOrSku);
      } else {
        query = query.eq('sku', idOrSku);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return { product: formatProductRecord(data), error: null };
      }
    } catch (err) {
      console.warn('[productsService] Supabase single product query error:', err.message);
    }
  }

  // Fallback to local catalog
  try {
    const catalog = await loadProductsCatalog();
    const matched = catalog.find(p => String(p.id) === String(idOrSku) || String(p.sku) === String(idOrSku));
    return {
      product: matched ? formatProductRecord(matched) : null,
      error: matched ? null : 'Product not found',
    };
  } catch (fallbackErr) {
    return { product: null, error: fallbackErr.message };
  }
}

/**
 * Fetch featured products for home page carousels
 * @param {number} [limit=10]
 * @returns {Promise<{ products: Array, error: string | null }>}
 */
export async function getFeaturedProducts(limit = 10) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(limit);

      if (!error && data && data.length > 0) {
        return { products: data.map(formatProductRecord), error: null };
      }
    } catch (err) {
      console.warn('[productsService] Failed fetching featured products from Supabase:', err.message);
    }
  }

  const local = await getLocalProductsCatalog({ limit });
  return { products: local.products.slice(0, limit), error: null };
}

/**
 * Fetch related products in the same category
 * @param {string} productId 
 * @param {string} category 
 * @param {number} [limit=8] 
 * @returns {Promise<{ products: Array, error: string | null }>}
 */
export async function getRelatedProducts(productId, category, limit = 8) {
  if (!category) return { products: [], error: null };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category_name', category)
        .neq('sku', productId)
        .limit(limit);

      if (!error && data && data.length > 0) {
        return { products: data.map(formatProductRecord), error: null };
      }
    } catch (err) {
      console.warn('[productsService] Failed fetching related products from Supabase:', err.message);
    }
  }

  const local = await getLocalProductsCatalog({ category, limit });
  const filtered = local.products.filter(p => String(p.id) !== String(productId)).slice(0, limit);
  return { products: filtered, error: null };
}

/**
 * Local fallback parser implementation
 */
async function getLocalProductsCatalog({
  category = null,
  search = '',
  sort = 'newest',
  page = 1,
  limit = 50,
  inStockOnly = false,
} = {}) {
  try {
    const rawCatalog = await loadProductsCatalog();
    let filtered = rawCatalog.map(formatProductRecord);

    if (inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }

    if (category && category !== 'All' && category !== 'all') {
      filtered = filtered.filter(p => 
        String(p.category).toLowerCase().trim() === String(category).toLowerCase().trim()
      );
    }

    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.nameTa && p.nameTa.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = Math.max(0, (page - 1) * limit);
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      totalCount,
      page,
      totalPages,
      error: null,
    };
  } catch (err) {
    return {
      products: [],
      totalCount: 0,
      page: 1,
      totalPages: 1,
      error: err.message,
    };
  }
}
