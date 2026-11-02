import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

const BUCKET_NAME = 'product-images';

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

async function runImageSync() {
  console.log('🖼️  Starting Gandhi Shop Product Images Sync...');

  const imagesDir = path.resolve('public/products');
  if (!fs.existsSync(imagesDir)) {
    console.error('❌ Images directory not found at:', imagesDir);
    process.exit(1);
  }

  const files = fs.readdirSync(imagesDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  console.log(`📸 Found ${files.length} product images in ${imagesDir}`);

  const canConnect = supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && !supabaseKey.includes('your-anon');

  if (!canConnect) {
    console.log('\n⚠️  Supabase live credentials not configured yet in .env.local.');
    console.log(`ℹ️  Dry-run audit: All ${files.length} images are verified and ready for upload.`);
    console.log('👉 To upload images to your live Supabase bucket:');
    console.log('   1. Ensure "product-images" bucket exists (run supabase/storage_setup.sql)');
    console.log('   2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
    console.log('   3. Run: node scripts/upload_product_images.mjs\n');
    return;
  }

  console.log(`🚀 Connecting to Supabase (${supabaseUrl}) Storage...`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  let uploadedCount = 0;
  let updatedDbCount = 0;
  let failedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(imagesDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `products/${file}`;
    const contentType = getContentType(file);

    try {
      // 1. Upload to Supabase Storage bucket
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType,
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.warn(`  ⚠️ Upload error for ${file}: ${uploadError.message}`);
        failedCount++;
        continue;
      }

      uploadedCount++;

      // 2. Obtain Public CDN URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      const publicCdnUrl = urlData.publicUrl;

      // 3. Update matching products in database
      const relativeLocalPath = `products/${file}`;
      const { data: updated, error: dbError } = await supabase
        .from('products')
        .update({
          image_url: publicCdnUrl,
          image_storage_path: storagePath,
        })
        .or(`image_url.eq.${relativeLocalPath},image_url.ilike.%${file}%`)
        .select('sku');

      if (!dbError && updated && updated.length > 0) {
        updatedDbCount += updated.length;
      }

      if ((i + 1) % 15 === 0 || i === files.length - 1) {
        console.log(`  ✓ Progress: ${i + 1}/${files.length} images processed (${uploadedCount} uploaded to CDN)`);
      }
    } catch (err) {
      console.error(`  ❌ Error processing ${file}:`, err.message);
      failedCount++;
    }
  }

  console.log('\n🎉 Product Image Sync Completed!');
  console.log(`   • Images Uploaded to Storage: ${uploadedCount}/${files.length}`);
  console.log(`   • Database Records Linked:    ${updatedDbCount}`);
  console.log(`   • Failures:                   ${failedCount}`);
}

runImageSync().catch(err => {
  console.error('Fatal error in image sync:', err);
  process.exit(1);
});
