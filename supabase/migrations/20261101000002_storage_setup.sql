-- ==============================================================================
-- GANDHI SHOP — SUPABASE STORAGE SETUP FOR PRODUCT IMAGES (PHASE 7)
-- Project: Gandhi Shop E-Commerce
-- PostgreSQL / Supabase Compatible
-- ==============================================================================

-- 1. CREATE "product-images" PUBLIC BUCKET IF NOT EXISTS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5 MB in bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. STORAGE ROW LEVEL SECURITY POLICIES
-- Policy 1: Anyone can view product images (Public CDN)
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Policy 2: Authenticated admins can upload images
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images' 
    AND (public.is_admin() OR auth.role() = 'authenticated')
);

-- Policy 3: Authenticated admins can update images
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND (public.is_admin() OR auth.role() = 'authenticated')
);

-- Policy 4: Authenticated admins can delete images
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND (public.is_admin() OR auth.role() = 'authenticated')
);
