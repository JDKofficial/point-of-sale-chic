-- Migration: Create categories table
-- Description: Product categories table

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure category names are unique per store
    UNIQUE(store_id, name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON public.categories(store_id);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view categories from their stores" ON public.categories
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert categories to their stores" ON public.categories
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update categories in their stores" ON public.categories
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete categories from their stores" ON public.categories
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create default categories for new stores
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default categories
    INSERT INTO public.categories (store_id, name, description) VALUES
    (NEW.id, 'Makanan', 'Produk makanan dan minuman'),
    (NEW.id, 'Elektronik', 'Perangkat elektronik'),
    (NEW.id, 'Pakaian', 'Pakaian dan aksesoris'),
    (NEW.id, 'Lainnya', 'Kategori lainnya');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create default categories when store is created
CREATE TRIGGER on_store_created
    AFTER INSERT ON public.stores
    FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();