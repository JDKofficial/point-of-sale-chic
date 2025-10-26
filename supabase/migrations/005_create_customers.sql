-- Migration: Create customers table
-- Description: Customers table for each store

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure email is unique per store (if provided)
    UNIQUE(store_id, email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_store_id ON public.customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(store_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(store_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(store_id, name);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view customers from their stores" ON public.customers
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert customers to their stores" ON public.customers
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update customers in their stores" ON public.customers
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete customers from their stores" ON public.customers
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();