import * as XLSX from 'xlsx';
import { SEED_PRODUCTS } from '../data/seedProducts';

const CATEGORY_FALLBACK_IMAGES = {
  'Aachi Masala & Podi': 'products/001_Aachi_Chilli_Powder.jpg',
  'Sakthi & Other Cooking Masalas': 'products/064_Sakthi_Sambar_Powder.jpg',
  'Tea & Coffee': 'products/012_3_Roses_Tea.jpg',
  'Sugar & Sweeteners': 'products/020_Sugar.jpg',
  'Cooking Oil': 'products/023_Gold_Winner_Sunflower_Oil.jpg',
  'Rice': 'products/072_Basmati_Rice.jpg',
  'Other Grocery Essentials': 'products/102_Toor_Dal.jpg',
  'Dishwash': 'products/031_Vim_Dishwash_Bar.jpg',
  'Laundry Detergent': 'products/040_Surf_Excel_Washing_Powder.jpg',
  'Laundry Soap Bar': 'products/057_Rin_Washing_Soap.jpg',
  'Bath Soap': 'products/050_Dettol_Soap.jpg',
  'Cleaning Products': 'products/084_Harpic_Toilet_Cleaner.jpg',
  'Personal Care & Shampoo': 'products/092_Clinic_Plus_Shampoo.jpg',
  default: 'products/001_Aachi_Chilli_Powder.jpg',
};

// Aliases for flexible header matching
const ALIASES = {
  id: ['id', 'product id', 'product_id', 'code', 'sku', 'item id', 'item_id'],
  name: ['name', 'product name', 'product_name', 'item', 'title', 'item name'],
  category: ['category', 'dept', 'department', 'type', 'group', 'section'],
  price: ['price', 'selling price', 'selling_price', 'rate', 'cost', 'final price', 'sale price'],
  mrp: ['mrp', 'original price', 'original_price', 'list price', 'market price', 'regular price'],
  unit: ['unit', 'pack', 'package', 'pack unit', 'quantity', 'weight', 'size', 'net weight'],
  rating: ['rating', 'customer rating', 'stars', 'score', 'review rating'],
  reviewsCount: ['reviews', 'total reviews', 'review count', 'ratings count'],
  image: ['image', 'image url', 'image_url', 'img', 'photo', 'picture', 'pic', 'thumbnail'],
  description: ['description', 'short description', 'short_description', 'desc', 'summary', 'about'],
  details: ['details', 'specifications', 'detailed specifications', 'specs', 'info', 'nutrition', 'origin'],
  inStock: ['stock', 'stock status', 'in stock', 'status', 'available', 'availability']
};

function normalizeKey(str) {
  return String(str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ');
}

function findValue(row, normalizedKeys, aliasList) {
  for (const alias of aliasList) {
    const normAlias = normalizeKey(alias);
    if (normalizedKeys[normAlias] !== undefined) {
      return row[normalizedKeys[normAlias]];
    }
  }
  // Also check if any key includes the alias
  for (const [normKey, originalKey] of Object.entries(normalizedKeys)) {
    if (aliasList.some(a => normKey.includes(normalizeKey(a)))) {
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

/**
 * Parses products from an ArrayBuffer or binary string using SheetJS
 */
export function parseProductsFromSheet(data) {
  try {
    const workbook = XLSX.read(data, { type: data instanceof ArrayBuffer ? 'array' : 'binary' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error("Spreadsheet contains no sheets.");
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      throw new Error("Spreadsheet is empty.");
    }

    // Build key lookup map from the first row's keys
    const firstRowKeys = Object.keys(rawRows[0]);
    const normalizedKeys = {};
    firstRowKeys.forEach(k => {
      normalizedKeys[normalizeKey(k)] = k;
    });

    const products = rawRows.map((row, idx) => {
      const rawName = findValue(row, normalizedKeys, ALIASES.name);
      if (!rawName || String(rawName).trim() === '') return null; // skip invalid empty rows

      const id = String(findValue(row, normalizedKeys, ALIASES.id) || `GS-${1000 + idx}`);
      const name = String(rawName).trim();
      const category = String(findValue(row, normalizedKeys, ALIASES.category) || 'General Grocery').trim();
      const price = cleanPrice(findValue(row, normalizedKeys, ALIASES.price));
      const mrpRaw = cleanPrice(findValue(row, normalizedKeys, ALIASES.mrp));
      const mrp = mrpRaw > price ? mrpRaw : Math.round(price * 1.2);
      const unit = String(findValue(row, normalizedKeys, ALIASES.unit) || '1 unit').trim();

      const ratingVal = parseFloat(findValue(row, normalizedKeys, ALIASES.rating));
      const rating = (!isNaN(ratingVal) && ratingVal > 0) ? Math.min(5, Math.max(1, ratingVal)) : 4.8;

      const reviewsVal = parseInt(findValue(row, normalizedKeys, ALIASES.reviewsCount), 10);
      const reviewsCount = !isNaN(reviewsVal) ? reviewsVal : Math.floor(50 + (idx * 7) % 250);

      const rawImage = findValue(row, normalizedKeys, ALIASES.image);
      let image = (rawImage && String(rawImage).trim().length > 0) ? String(rawImage).trim() : null;
      if (!image) {
        image = CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.default;
      }

      const description = String(findValue(row, normalizedKeys, ALIASES.description) || 
        `${name} - authentic, unadulterated grocery staple directly sourced for Gandhi Shop.`).trim();

      const details = String(findValue(row, normalizedKeys, ALIASES.details) || 
        `Purity guaranteed. Hygienically packed. Store in a cool dry place.`).trim();

      const stockVal = String(findValue(row, normalizedKeys, ALIASES.inStock) || 'true').toLowerCase();
      const inStock = !(stockVal.includes('out') || stockVal === 'false' || stockVal === '0');

      return {
        id,
        name,
        category,
        price,
        mrp,
        unit,
        rating,
        reviewsCount,
        image,
        description,
        details,
        inStock,
      };
    }).filter(Boolean);

    if (products.length === 0) {
      throw new Error("No valid products found in spreadsheet. Ensure columns like Name and Price are present.");
    }

    return products;
  } catch (err) {
    console.error("SheetJS Parsing Error:", err);
    throw err;
  }
}

/**
 * Fetches and parses products.xlsx using relative base URL, with automatic fallback
 */
export async function loadProductsCatalog(url = `${import.meta.env.BASE_URL}data/products.xlsx`) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Could not load spreadsheet from ${url} (${response.status}). Falling back to embedded products.`);
      return SEED_PRODUCTS;
    }
    const arrayBuffer = await response.arrayBuffer();
    return parseProductsFromSheet(arrayBuffer);
  } catch (error) {
    console.warn("Spreadsheet parsing/fetch fallback triggered:", error);
    return SEED_PRODUCTS;
  }
}
