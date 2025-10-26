-- Migration: Create useful views and functions
-- Description: Create views and functions for dashboard and reporting

-- Create view for transaction summary
CREATE OR REPLACE VIEW public.transaction_summary AS
SELECT 
    t.id,
    t.store_id,
    t.transaction_number,
    t.subtotal,
    t.discount_amount,
    t.discount_percentage,
    t.tax_amount,
    t.total_amount,
    t.payment_method,
    t.notes,
    t.created_at,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    COUNT(ti.id) as total_items,
    SUM(ti.quantity) as total_quantity
FROM public.transactions t
LEFT JOIN public.customers c ON t.customer_id = c.id
LEFT JOIN public.transaction_items ti ON t.id = ti.transaction_id
GROUP BY t.id, c.name, c.email, c.phone;

-- Create view for product with category
CREATE OR REPLACE VIEW public.products_with_category AS
SELECT 
    p.id,
    p.store_id,
    p.name,
    p.description,
    p.price,
    p.stock,
    p.image_url,
    p.sku,
    p.is_active,
    p.created_at,
    p.updated_at,
    cat.name as category_name,
    cat.id as category_id
FROM public.products p
LEFT JOIN public.categories cat ON p.category_id = cat.id;

-- Create view for dashboard statistics
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
    s.id as store_id,
    s.name as store_name,
    -- Today's stats
    COALESCE(today_stats.total_sales, 0) as today_sales,
    COALESCE(today_stats.total_transactions, 0) as today_transactions,
    -- This month's stats
    COALESCE(month_stats.total_sales, 0) as month_sales,
    COALESCE(month_stats.total_transactions, 0) as month_transactions,
    -- Product stats
    COALESCE(product_stats.total_products, 0) as total_products,
    COALESCE(product_stats.low_stock_products, 0) as low_stock_products,
    -- Customer stats
    COALESCE(customer_stats.total_customers, 0) as total_customers
FROM public.stores s
LEFT JOIN (
    -- Today's sales
    SELECT 
        store_id,
        SUM(total_amount) as total_sales,
        COUNT(*) as total_transactions
    FROM public.transactions
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY store_id
) today_stats ON s.id = today_stats.store_id
LEFT JOIN (
    -- This month's sales
    SELECT 
        store_id,
        SUM(total_amount) as total_sales,
        COUNT(*) as total_transactions
    FROM public.transactions
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY store_id
) month_stats ON s.id = month_stats.store_id
LEFT JOIN (
    -- Product stats
    SELECT 
        store_id,
        COUNT(*) as total_products,
        COUNT(CASE WHEN stock <= 10 THEN 1 END) as low_stock_products
    FROM public.products
    WHERE is_active = true
    GROUP BY store_id
) product_stats ON s.id = product_stats.store_id
LEFT JOIN (
    -- Customer stats
    SELECT 
        store_id,
        COUNT(*) as total_customers
    FROM public.customers
    GROUP BY store_id
) customer_stats ON s.id = customer_stats.store_id;

-- Create function to get sales report by date range
CREATE OR REPLACE FUNCTION public.get_sales_report(
    store_uuid UUID,
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    transaction_date DATE,
    total_sales DECIMAL(12,2),
    total_transactions BIGINT,
    total_items BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(t.created_at) as transaction_date,
        SUM(t.total_amount) as total_sales,
        COUNT(t.id) as total_transactions,
        SUM(ti.quantity) as total_items
    FROM public.transactions t
    LEFT JOIN public.transaction_items ti ON t.id = ti.transaction_id
    WHERE t.store_id = store_uuid
    AND DATE(t.created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(t.created_at)
    ORDER BY transaction_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get top selling products
CREATE OR REPLACE FUNCTION public.get_top_products(
    store_uuid UUID,
    limit_count INTEGER DEFAULT 10,
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    category_name TEXT,
    total_quantity BIGINT,
    total_revenue DECIMAL(12,2),
    current_stock INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        cat.name as category_name,
        SUM(ti.quantity) as total_quantity,
        SUM(ti.total_price) as total_revenue,
        p.stock as current_stock
    FROM public.products p
    LEFT JOIN public.categories cat ON p.category_id = cat.id
    LEFT JOIN public.transaction_items ti ON p.id = ti.product_id
    LEFT JOIN public.transactions t ON ti.transaction_id = t.id
    WHERE p.store_id = store_uuid
    AND (t.created_at IS NULL OR DATE(t.created_at) BETWEEN start_date AND end_date)
    GROUP BY p.id, p.name, cat.name, p.stock
    ORDER BY total_quantity DESC NULLS LAST
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get low stock products
CREATE OR REPLACE FUNCTION public.get_low_stock_products(
    store_uuid UUID,
    stock_threshold INTEGER DEFAULT 10
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    category_name TEXT,
    current_stock INTEGER,
    sku TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        cat.name as category_name,
        p.stock as current_stock,
        p.sku
    FROM public.products p
    LEFT JOIN public.categories cat ON p.category_id = cat.id
    WHERE p.store_id = store_uuid
    AND p.is_active = true
    AND p.stock <= stock_threshold
    ORDER BY p.stock ASC, p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;