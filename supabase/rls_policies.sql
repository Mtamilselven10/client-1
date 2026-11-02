-- ==============================================================================
-- GANDHI SHOP — ROW LEVEL SECURITY (RLS) POLICIES (PHASE 3)
-- Project: Gandhi Shop E-Commerce
-- PostgreSQL / Supabase Compatible
-- ==============================================================================

-- 1. HELPER FUNCTION: is_admin()
-- Checks if currently authenticated user exists in admin_profiles with active role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.admin_profiles 
        WHERE user_id = auth.uid() 
          AND role IN ('super_admin', 'store_manager', 'staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. ENABLE ROW LEVEL SECURITY ON ALL 9 TABLES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. CATEGORIES POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
ON public.categories FOR SELECT
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 4. PRODUCTS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 5. CUSTOMERS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Customers and guests can insert profile" ON public.customers;
CREATE POLICY "Customers and guests can insert profile"
ON public.customers FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own customer profile or admin" ON public.customers;
CREATE POLICY "Users can view their own customer profile or admin"
ON public.customers FOR SELECT
USING (
    (auth.uid() IS NOT NULL AND auth_user_id = auth.uid())
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can update their own customer profile" ON public.customers;
CREATE POLICY "Users can update their own customer profile"
ON public.customers FOR UPDATE
USING (
    (auth.uid() IS NOT NULL AND auth_user_id = auth.uid())
    OR public.is_admin()
)
WITH CHECK (
    (auth.uid() IS NOT NULL AND auth_user_id = auth.uid())
    OR public.is_admin()
);

-- ==============================================================================
-- 6. ORDERS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
CREATE POLICY "Anyone can create an order"
ON public.orders FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Customers can view their orders and admins view all" ON public.orders;
CREATE POLICY "Customers can view their orders and admins view all"
ON public.orders FOR SELECT
USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND customer_id IN (
        SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
    ))
    -- Allow guest lookup during checkout confirmation
    OR auth.role() = 'anon'
);

DROP POLICY IF EXISTS "Only admins can update orders" ON public.orders;
CREATE POLICY "Only admins can update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete orders" ON public.orders;
CREATE POLICY "Only admins can delete orders"
ON public.orders FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==============================================================================
-- 7. ORDER ITEMS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Read order items" ON public.order_items;
CREATE POLICY "Read order items"
ON public.order_items FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Only admins can modify order items" ON public.order_items;
CREATE POLICY "Only admins can modify order items"
ON public.order_items FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete order items" ON public.order_items;
CREATE POLICY "Only admins can delete order items"
ON public.order_items FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==============================================================================
-- 8. INVENTORY TRANSACTIONS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Only admins can view inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Only admins can view inventory transactions"
ON public.inventory_transactions FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can create inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Only admins can create inventory transactions"
ON public.inventory_transactions FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 9. REVIEWS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews"
ON public.reviews FOR SELECT
USING (is_approved = true OR public.is_admin());

DROP POLICY IF EXISTS "Public can submit product reviews" ON public.reviews;
CREATE POLICY "Public can submit product reviews"
ON public.reviews FOR INSERT
WITH CHECK (rating >= 1 AND rating <= 5);

DROP POLICY IF EXISTS "Admins can moderate reviews" ON public.reviews;
CREATE POLICY "Admins can moderate reviews"
ON public.reviews FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 10. COUPONS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
CREATE POLICY "Public can view active coupons"
ON public.coupons FOR SELECT
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
ON public.coupons FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 11. ADMIN PROFILES POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view admin profiles"
ON public.admin_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Super admins can manage admin profiles" ON public.admin_profiles;
CREATE POLICY "Super admins can manage admin profiles"
ON public.admin_profiles FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_profiles 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_profiles 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    )
);
