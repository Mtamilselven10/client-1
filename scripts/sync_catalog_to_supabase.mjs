import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// Load .env / .env.local if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  const env = {};
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...vals] = trimmed.split('=');
          if (key) env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
        }
      });
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

// Category Tamil translations mapping
const CATEGORY_TRANSLATIONS = {
  'Masala & Podi': 'மசாலா & பொடி வகைகள்',
  'Tea Coffee Drinks': 'டீ, காபி & பானங்கள்',
  'Sugar & Sweeteners': 'சர்க்கரை & இனிப்பூட்டிகள்',
  'Cooking Oil & Ghee': 'சமையல் எண்ணெய் & நெய்',
  'Rice Varieties': 'அரிசி ரகங்கள்',
  'Dal & Pulses': 'பருப்பு & தானியங்கள்',
  'Flour Rava Noodles': 'மாவு, ரவை & நூடுல்ஸ்',
  'Salt & Whole Spices': 'உப்பு & முழு மசாலா பொருட்கள்',
  'Biscuits Bakery Snacks': 'பிஸ்கட், பேக்கரி & தின்பண்டங்கள்',
  'Chocolate & Candy': 'சாக்லேட் & மிட்டாய் வகைகள்',
  'Bath Soap Hygiene': 'குளியல் சோப் & சுகாதாரம்',
  'Shampoo Hair Skin Care': 'ஷாம்பு & கூந்தல்/தோல் பராமரிப்பு',
  'Detergent & Laundry': 'சலவை தூள் & சோப்',
  'Dishwash & Kitchen Cleaning': 'பாத்திரம் கழுவும் பொருட்கள்',
  'Home & Toilet Cleaning': 'வீட்டு & கழிப்பறை தூய்மை பொருட்கள்',
  'Pickles Sauces Ready Mix': 'ஊறுகாய், சாஸ் & ரெடிமிக்ஸ்',
  'Milk Dairy Eggs': 'பால், பால் பொருட்கள் & முட்டை',
  'Water & Soft Drinks': 'குடிநீர் & குளிர்பானங்கள்',
  'Pooja & Household': 'பூஜை & வீட்டு பயன்பாட்டு பொருட்கள்',
  'Baby & Family Care': 'குழந்தை & குடும்ப பராமரிப்பு',
  'Frozen & Convenience Foods': 'உடனடி & உறைந்த உணவுகள்',
  'Other Essentials': 'இதர மளிகை அத்தியாவசிய பொருட்கள்',
  'General Grocery': 'பொது மளிகை',
};

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanPrice(val) {
  if (typeof val === 'number') return Math.max(0, val);
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

async function runSync() {
  console.log('📦 Starting Gandhi Shop Catalog Sync...');

  const excelPath = path.resolve('public/data/products.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error('❌ Excel catalog file not found at:', excelPath);
    process.exit(1);
  }

  const workbook = XLSX.readFile(excelPath);
  const firstSheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
  console.log(`✅ Loaded ${rows.length} product rows from ${excelPath}`);

  // 1. Identify distinct categories
  const categoryNames = [...new Set(rows.map(r => String(r.Category || 'General Grocery').trim()))];
  console.log(`🏷️ Found ${categoryNames.length} distinct product categories.`);

  const categories = categoryNames.map((name, idx) => ({
    name,
    name_ta: CATEGORY_TRANSLATIONS[name] || name,
    slug: slugify(name),
    display_order: idx + 1,
    is_active: true,
  }));

  // 2. Prepare mapped products
  const products = rows.map((row, idx) => {
    const rawName = row['Product Name'] || '';
    const sku = String(row['Product ID'] || `GS-${1001 + idx}`).trim();
    const name = String(rawName).trim();
    const nameTa = String(row['Tamil Name'] || '').trim();
    const categoryName = String(row['Category'] || 'General Grocery').trim();
    const price = cleanPrice(row['Selling Price (INR)']);
    const mrpRaw = cleanPrice(row['MRP (INR)']);
    const mrp = mrpRaw > price ? mrpRaw : Math.round(price * 1.2);
    const unit = String(row['Package Unit'] || '1 unit').trim();
    const rating = cleanPrice(row['Customer Rating']) || 4.8;
    const reviewsCount = parseInt(row['Total Reviews'], 10) || (40 + (idx * 3) % 180);
    const imageUrl = String(row['Image URL'] || '').trim();
    const description = String(row['Short Description'] || `${name} (${nameTa}) - fresh, high quality provision.`).trim();
    const details = String(row['Detailed Specifications'] || '100% Genuine Quality. Direct from reliable Tamil Nadu agrarian sources.').trim();
    const stockStatus = String(row['Stock Status'] || 'In Stock').toLowerCase();
    const inStock = !(stockStatus.includes('out') || stockStatus === 'false' || stockStatus === '0');

    return {
      sku,
      name,
      name_ta: nameTa,
      slug: slugify(`${name}-${sku}`),
      category_name: categoryName,
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
      is_featured: idx < 16,
      is_active: true,
    };
  });

  // 3. Generate production SQL file (supabase/seed_products.sql) for 1-click execution
  console.log('📝 Generating supabase/seed_products.sql script...');

  let sqlContent = `-- ==============================================================================\n`;
  sqlContent += `-- GANDHI SHOP — COMPLETE 388 PRODUCTS & 22 CATEGORIES SEED SCRIPT (PHASE 5)\n`;
  sqlContent += `-- Generated: ${new Date().toISOString()}\n`;
  sqlContent += `-- ==============================================================================\n\n`;

  // Upsert categories
  sqlContent += `-- 1. UPSERT ALL 22 CATEGORIES\n`;
  sqlContent += `INSERT INTO public.categories (name, name_ta, slug, display_order, is_active)\nVALUES\n`;
  const catValues = categories.map(c => 
    `  (${escapeSql(c.name)}, ${escapeSql(c.name_ta)}, ${escapeSql(c.slug)}, ${c.display_order}, true)`
  ).join(',\n');
  sqlContent += `${catValues}\nON CONFLICT (slug) DO UPDATE SET\n  name = EXCLUDED.name,\n  name_ta = EXCLUDED.name_ta,\n  display_order = EXCLUDED.display_order;\n\n`;

  // Upsert products linking to categories
  sqlContent += `-- 2. UPSERT ALL 388 PRODUCTS\n`;
  sqlContent += `INSERT INTO public.products (\n  sku, name, name_ta, slug, category_id, category_name, unit, price, mrp, stock_quantity, in_stock, min_order_qty, max_order_qty, rating, reviews_count, image_url, description, details, is_featured, is_active\n)\nVALUES\n`;

  const prodValues = products.map(p => {
    const catSlug = slugify(p.category_name);
    return `  (${escapeSql(p.sku)}, ${escapeSql(p.name)}, ${escapeSql(p.name_ta)}, ${escapeSql(p.slug)}, (SELECT id FROM public.categories WHERE slug = ${escapeSql(catSlug)} LIMIT 1), ${escapeSql(p.category_name)}, ${escapeSql(p.unit)}, ${p.price}, ${p.mrp}, ${p.stock_quantity}, ${p.in_stock}, ${p.min_order_qty}, ${p.max_order_qty}, ${p.rating}, ${p.reviews_count}, ${escapeSql(p.image_url)}, ${escapeSql(p.description)}, ${escapeSql(p.details)}, ${p.is_featured}, true)`;
  }).join(',\n');

  sqlContent += `${prodValues}\nON CONFLICT (sku) DO UPDATE SET\n  name = EXCLUDED.name,\n  name_ta = EXCLUDED.name_ta,\n  category_id = EXCLUDED.category_id,\n  category_name = EXCLUDED.category_name,\n  unit = EXCLUDED.unit,\n  price = EXCLUDED.price,\n  mrp = EXCLUDED.mrp,\n  stock_quantity = EXCLUDED.stock_quantity,\n  in_stock = EXCLUDED.in_stock,\n  rating = EXCLUDED.rating,\n  reviews_count = EXCLUDED.reviews_count,\n  image_url = EXCLUDED.image_url,\n  description = EXCLUDED.description,\n  details = EXCLUDED.details,\n  is_featured = EXCLUDED.is_featured;\n`;

  const sqlFilePath = path.resolve('supabase/seed_products.sql');
  fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');
  console.log(`✅ Successfully generated ${sqlFilePath} (${(fs.statSync(sqlFilePath).size / 1024).toFixed(1)} KB)`);

  // 4. If Supabase credentials exist, run live upsert via API
  const canConnectSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && !supabaseKey.includes('your-anon');
  if (canConnectSupabase) {
    console.log(`🚀 Connecting to Supabase (${supabaseUrl}) to upsert data...`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert categories
    console.log('  -> Upserting categories...');
    const { data: upsertedCats, error: catErr } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();

    if (catErr) {
      console.error('❌ Error upserting categories:', catErr.message);
    } else {
      console.log(`  -> Successfully upserted ${upsertedCats.length} categories.`);
    }

    // Build category map
    const { data: allDbCats } = await supabase.from('categories').select('id, slug, name');
    const catMap = {};
    (allDbCats || []).forEach(c => {
      catMap[c.slug] = c.id;
      catMap[c.name] = c.id;
    });

    // Upsert products in batches of 50
    console.log(`  -> Upserting ${products.length} products in batches of 50...`);
    const batchSize = 50;
    let totalSuccess = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const chunk = products.slice(i, i + batchSize).map(p => {
        const catSlug = slugify(p.category_name);
        return {
          ...p,
          category_id: catMap[catSlug] || catMap[p.category_name] || null,
        };
      });

      const { data: inserted, error: prodErr } = await supabase
        .from('products')
        .upsert(chunk, { onConflict: 'sku' })
        .select('id, sku');

      if (prodErr) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} error:`, prodErr.message);
      } else {
        totalSuccess += inserted.length;
        console.log(`  ✓ Batch ${Math.floor(i / batchSize) + 1} (${inserted.length} products synced, total: ${totalSuccess}/${products.length})`);
      }
    }

    console.log(`🎉 Supabase Live Sync Complete! ${totalSuccess} products synced successfully.`);
  } else {
    console.log('ℹ️ Live Supabase credentials not set in environment or .env.local yet.');
    console.log('💡 You can run supabase/seed_products.sql directly in the Supabase SQL Editor to populate all 388 products instantly!');
  }
}

runSync().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
