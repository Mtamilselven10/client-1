import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

function normalizeHeader(str) {
  return String(str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ');
}

function findRowValue(row, normalizedKeys, aliasList) {
  for (const alias of aliasList) {
    const norm = normalizeHeader(alias);
    if (normalizedKeys[norm] !== undefined) {
      return row[normalizedKeys[norm]];
    }
  }
  for (const [normKey, originalKey] of Object.entries(normalizedKeys)) {
    if (aliasList.some(a => normKey.includes(normalizeHeader(a)))) {
      return row[originalKey];
    }
  }
  return undefined;
}

function cleanPrice(val) {
  if (typeof val === 'number') return Math.max(0, val);
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse and validate an uploaded Excel file (.xlsx or .xls)
 * @param {File | ArrayBuffer} fileInput 
 * @returns {Promise<{ validRows: Array, invalidRows: Array, totalRows: number, categories: Array }>}
 */
export async function parseExcelFileForImport(fileInput) {
  let arrayBuffer;
  if (fileInput instanceof ArrayBuffer) {
    arrayBuffer = fileInput;
  } else if (fileInput && typeof fileInput.arrayBuffer === 'function') {
    arrayBuffer = await fileInput.arrayBuffer();
  } else {
    throw new Error('Invalid file format. Please upload a valid Excel (.xlsx) file.');
  }

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Spreadsheet has no readable sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Spreadsheet is empty. Ensure your file contains product rows.');
  }

  const firstRowKeys = Object.keys(rawRows[0]);
  const normalizedKeys = {};
  firstRowKeys.forEach(k => {
    normalizedKeys[normalizeHeader(k)] = k;
  });

  const validRows = [];
  const invalidRows = [];
  const categorySet = new Set();

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2; // header is row 1
    const rawName = findRowValue(row, normalizedKeys, ['product name', 'name', 'item', 'title']);
    const rawPrice = findRowValue(row, normalizedKeys, ['selling price', 'price', 'rate', 'cost']);

    // Required validation
    if (!rawName || String(rawName).trim() === '') {
      invalidRows.push({ rowNum, error: 'Missing product name', data: row });
      return;
    }

    const price = cleanPrice(rawPrice);
    if (price <= 0) {
      invalidRows.push({ rowNum, error: `Invalid price: "${rawPrice}"`, data: row });
      return;
    }

    const name = String(rawName).trim();
    const sku = String(findRowValue(row, normalizedKeys, ['product id', 'id', 'sku', 'code']) || `GS-IMP-${1000 + idx}`).trim();
    const nameTa = String(findRowValue(row, normalizedKeys, ['tamil name', 'tamil', 'name ta']) || '').trim();
    const category = String(findRowValue(row, normalizedKeys, ['category', 'dept', 'department']) || 'General Grocery').trim();
    const mrpRaw = cleanPrice(findRowValue(row, normalizedKeys, ['mrp', 'original price']));
    const mrp = mrpRaw > price ? mrpRaw : Math.round(price * 1.2);
    const unit = String(findRowValue(row, normalizedKeys, ['package unit', 'unit', 'pack', 'size']) || '1 unit').trim();
    const rating = Math.min(5, Math.max(1, cleanPrice(findRowValue(row, normalizedKeys, ['rating', 'customer rating'])) || 4.8));
    const reviewsCount = parseInt(findRowValue(row, normalizedKeys, ['reviews', 'total reviews', 'review count']), 10) || 50;
    const imageUrl = String(findRowValue(row, normalizedKeys, ['image url', 'image', 'img', 'photo']) || '').trim();
    const description = String(findRowValue(row, normalizedKeys, ['short description', 'description', 'desc']) || `${name} - authentic grocery staple.`).trim();
    const details = String(findRowValue(row, normalizedKeys, ['detailed specifications', 'details', 'specs']) || '100% Genuine Quality. Hygienically packed.').trim();
    const stockStatus = String(findRowValue(row, normalizedKeys, ['stock status', 'stock', 'status']) || 'In Stock').toLowerCase();
    const inStock = !(stockStatus.includes('out') || stockStatus === 'false' || stockStatus === '0');

    categorySet.add(category);

    validRows.push({
      sku,
      name,
      name_ta: nameTa,
      slug: slugify(`${name}-${sku}`),
      category_name: category,
      unit,
      price,
      mrp,
      stock_quantity: inStock ? 100 : 0,
      in_stock: inStock,
      min_order_qty: 1,
      max_order_qty: 50,
      rating,
      reviews_count: reviewsCount,
      image_url: imageUrl,
      description,
      details,
      is_active: true,
      is_featured: false,
    });
  });

  return {
    validRows,
    invalidRows,
    totalRows: rawRows.length,
    categories: Array.from(categorySet),
  };
}

/**
 * Commit parsed rows to Supabase database with batching and progress reporting
 * @param {Array} validRows 
 * @param {Object} [options]
 * @param {Function} [options.onProgress] - Callback (progress: { current, total, percent })
 * @returns {Promise<{ success: boolean, totalProcessed: number, errors: Array }>}
 */
export async function commitImportedProducts(validRows = [], { onProgress = () => {} } = {}) {
  if (!validRows || validRows.length === 0) {
    return { success: false, totalProcessed: 0, errors: ['No valid products to import.'] };
  }

  const errors = [];
  let totalProcessed = 0;

  if (!isSupabaseConfigured) {
    // Simulated import for unconfigured development mode
    for (let i = 0; i < validRows.length; i++) {
      await new Promise(r => setTimeout(r, 10));
      onProgress({
        current: i + 1,
        total: validRows.length,
        percent: Math.round(((i + 1) / validRows.length) * 100),
      });
    }
    return {
      success: true,
      totalProcessed: validRows.length,
      errors: [],
      mode: 'local_simulation',
    };
  }

  try {
    // 1. Ensure categories exist in Supabase
    const distinctCategories = [...new Set(validRows.map(r => r.category_name))];
    const categoryPayload = distinctCategories.map((name, i) => ({
      name,
      slug: slugify(name),
      display_order: i + 1,
      is_active: true,
    }));

    await supabase.from('categories').upsert(categoryPayload, { onConflict: 'slug' });

    // Fetch category map
    const { data: dbCategories } = await supabase.from('categories').select('id, slug, name');
    const catMap = {};
    (dbCategories || []).forEach(c => {
      catMap[c.slug] = c.id;
      catMap[c.name] = c.id;
    });

    // 2. Batch upsert products in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize).map(p => {
        const catSlug = slugify(p.category_name);
        return {
          ...p,
          category_id: catMap[catSlug] || catMap[p.category_name] || null,
        };
      });

      const { data, error } = await supabase
        .from('products')
        .upsert(chunk, { onConflict: 'sku' })
        .select('id, sku');

      if (error) {
        errors.push(`Batch ${Math.floor(i / chunkSize) + 1} error: ${error.message}`);
      } else {
        totalProcessed += (data?.length || chunk.length);
      }

      onProgress({
        current: Math.min(i + chunkSize, validRows.length),
        total: validRows.length,
        percent: Math.round((Math.min(i + chunkSize, validRows.length) / validRows.length) * 100),
      });
    }

    return {
      success: errors.length === 0,
      totalProcessed,
      errors,
      mode: 'supabase_upsert',
    };
  } catch (err) {
    return {
      success: false,
      totalProcessed,
      errors: [err.message],
    };
  }
}
