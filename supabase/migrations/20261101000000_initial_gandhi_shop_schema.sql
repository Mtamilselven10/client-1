-- ==============================================================================
-- GANDHI SHOP — COMPLETE PRODUCTION DATABASE SCHEMA (PHASE 2)
-- Project: Gandhi Shop E-Commerce
-- PostgreSQL / Supabase Compatible
-- ==============================================================================

-- 0. EXTENSIONS & PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to handle updated_at timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ta TEXT,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 2. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ta TEXT,
    slug TEXT UNIQUE,
    description TEXT,
    details TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT,
    unit TEXT NOT NULL DEFAULT '1 unit',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    mrp NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (mrp >= 0),
    discount_percent INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN mrp > price AND mrp > 0 THEN ROUND(((mrp - price) / mrp) * 100)
            ELSE 0 
        END
    ) STORED,
    stock_quantity INTEGER NOT NULL DEFAULT 100 CHECK (stock_quantity >= 0),
    in_stock BOOLEAN DEFAULT true,
    min_order_qty INTEGER DEFAULT 1 CHECK (min_order_qty >= 1),
    max_order_qty INTEGER DEFAULT 50 CHECK (max_order_qty >= min_order_qty),
    rating NUMERIC(3, 2) DEFAULT 4.8 CHECK (rating >= 1.0 AND rating <= 5.0),
    reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
    image_url TEXT,
    image_storage_path TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 3. CUSTOMERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT DEFAULT 'Pudukkottai',
    state TEXT DEFAULT 'Tamil Nadu',
    postal_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled', 'placed_via_whatsapp')
    ),
    payment_status TEXT NOT NULL DEFAULT 'cod' CHECK (
        payment_status IN ('unpaid', 'paid', 'cod', 'refunded')
    ),
    payment_method TEXT NOT NULL DEFAULT 'whatsapp_cod',
    whatsapp_message_sent BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 5. ORDER_ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_sku TEXT,
    product_name TEXT NOT NULL,
    product_name_ta TEXT,
    unit TEXT NOT NULL DEFAULT '1 unit',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    mrp NUMERIC(10, 2) DEFAULT 0.00 CHECK (mrp >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_price >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. INVENTORY_TRANSACTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (
        change_type IN ('order_deduction', 'manual_restock', 'return_addition', 'loss_adjustment', 'initial_import')
    ),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. REVIEWS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. COUPONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
    max_discount NUMERIC(10, 2),
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_to TIMESTAMPTZ,
    usage_limit INTEGER,
    times_used INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. ADMIN_PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'store_manager', 'staff')),
    permissions JSONB DEFAULT '{"can_manage_products": true, "can_manage_orders": true, "can_view_reports": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_admin_profiles_updated_at
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 10. INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products(is_active, is_featured);
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING gin (to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(display_order);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_auth_user ON public.customers(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- ==============================================================================
-- 11. INITIAL SEED CATEGORIES (GANDHI SHOP CATALOG DEPARTMENTS)
-- ==============================================================================
INSERT INTO public.categories (name, name_ta, slug, display_order, is_active)
VALUES
    ('Aachi Masala & Podi', 'ஆச்சி மசாலா & பொடி', 'aachi-masala-podi', 1, true),
    ('Sakthi & Other Cooking Masalas', 'சக்தி & சமையல் மசாலாக்கள்', 'sakthi-cooking-masalas', 2, true),
    ('Tea & Coffee', 'டீ & காபி', 'tea-coffee', 3, true),
    ('Sugar & Sweeteners', 'சர்க்கரை & இனிப்பூட்டிகள்', 'sugar-sweeteners', 4, true),
    ('Cooking Oil', 'சமையல் எண்ணெய்', 'cooking-oil', 5, true),
    ('Rice', 'அரிசி ரகங்கள்', 'rice', 6, true),
    ('Other Grocery Essentials', 'மளிகை அத்தியாவசிய பொருட்கள்', 'other-grocery-essentials', 7, true),
    ('Dishwash', 'பாத்திரம் கழுவும் பொருட்கள்', 'dishwash', 8, true),
    ('Laundry Detergent', 'சலவை தூள்', 'laundry-detergent', 9, true),
    ('Laundry Soap Bar', 'சலவை சோப்', 'laundry-soap-bar', 10, true),
    ('Bath Soap', 'குளியல் சோப்', 'bath-soap', 11, true),
    ('Cleaning Products', 'வீட்டு தூய்மை பொருட்கள்', 'cleaning-products', 12, true),
    ('Personal Care & Shampoo', 'ஷாம்பு & தனிநபர் பராமரிப்பு', 'personal-care-shampoo', 13, true),
    ('General Grocery', 'பொது மளிகை', 'general-grocery', 14, true)
ON CONFLICT (slug) DO NOTHING;

-- Initial Active Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, is_active)
VALUES
    ('WELCOME50', 'fixed', 50.00, 499.00, true),
    ('GANDHI10', 'percent', 10.00, 999.00, true)
ON CONFLICT (code) DO NOTHING;
