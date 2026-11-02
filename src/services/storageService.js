import { supabase, isSupabaseConfigured } from './supabaseClient';

export const PRODUCT_STORAGE_BUCKET = 'product-images';
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validates product image file constraints (MIME type and size)
 * @param {File} file 
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No image file provided.' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file format (${file.type}). Allowed formats: JPEG, PNG, WebP, GIF.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 5 MB.`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Upload a product image to Supabase Storage and obtain public CDN URL
 * @param {File | Blob} fileOrBlob 
 * @param {string} [customPath] - Optional custom filename or SKU (e.g. "GS-1001.jpg")
 * @returns {Promise<{ success: boolean, publicUrl: string, storagePath: string, error: string | null }>}
 */
export async function uploadProductImage(fileOrBlob, customPath = '') {
  if (!fileOrBlob) {
    return { success: false, publicUrl: '', storagePath: '', error: 'File is required' };
  }

  // Validate if it is a File object
  if (fileOrBlob.name) {
    const validation = validateImageFile(fileOrBlob);
    if (!validation.valid) {
      return { success: false, publicUrl: '', storagePath: '', error: validation.error };
    }
  }

  // Clean filename
  const extension = fileOrBlob.name ? fileOrBlob.name.split('.').pop().toLowerCase() : 'jpg';
  const cleanBase = customPath
    ? customPath.replace(/[^a-zA-Z0-9_-]/g, '_')
    : `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const filePath = cleanBase.endsWith(`.${extension}`) ? cleanBase : `${cleanBase}.${extension}`;

  if (!isSupabaseConfigured) {
    // Local development fallback: create blob URL for preview
    const localUrl = URL.createObjectURL(fileOrBlob);
    return {
      success: true,
      publicUrl: localUrl,
      storagePath: filePath,
      error: null,
      source: 'local_object_url',
    };
  }

  try {
    const { data, error } = await supabase.storage
      .from(PRODUCT_STORAGE_BUCKET)
      .upload(filePath, fileOrBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: fileOrBlob.type || 'image/jpeg',
      });

    if (error) {
      return { success: false, publicUrl: '', storagePath: '', error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from(PRODUCT_STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
      storagePath: data.path,
      error: null,
      source: 'supabase_storage',
    };
  } catch (err) {
    return { success: false, publicUrl: '', storagePath: '', error: err.message };
  }
}

/**
 * Delete a product image from Supabase Storage
 * @param {string} storagePath 
 * @returns {Promise<{ success: boolean, error: string | null }>}
 */
export async function deleteProductImage(storagePath) {
  if (!storagePath) return { success: true, error: null };
  if (!isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.storage
      .from(PRODUCT_STORAGE_BUCKET)
      .remove([storagePath]);

    return { success: !error, error: error ? error.message : null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Retrieve public CDN URL for a file stored in product-images bucket
 * @param {string} storagePath 
 * @returns {string}
 */
export function getProductStorageUrl(storagePath) {
  if (!storagePath) return '';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  if (!isSupabaseConfigured) {
    return storagePath;
  }
  const { data } = supabase.storage
    .from(PRODUCT_STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl || storagePath;
}
