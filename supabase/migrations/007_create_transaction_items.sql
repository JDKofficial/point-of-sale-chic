-- Migration: Create transaction_items table
-- Description: Transaction items/line items for each transaction

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON public.transaction_items(product_id);

-- Enable RLS
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view transaction items from their stores" ON public.transaction_items
    FOR SELECT USING (
        transaction_id IN (
            SELECT t.id FROM public.transactions t
            JOIN public.stores s ON t.store_id = s.id
            WHERE s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert transaction items to their transactions" ON public.transaction_items
    FOR INSERT WITH CHECK (
        transaction_id IN (
            SELECT t.id FROM public.transactions t
            JOIN public.stores s ON t.store_id = s.id
            WHERE s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update transaction items in their transactions" ON public.transaction_items
    FOR UPDATE USING (
        transaction_id IN (
            SELECT t.id FROM public.transactions t
            JOIN public.stores s ON t.store_id = s.id
            WHERE s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete transaction items from their transactions" ON public.transaction_items
    FOR DELETE USING (
        transaction_id IN (
            SELECT t.id FROM public.transactions t
            JOIN public.stores s ON t.store_id = s.id
            WHERE s.owner_id = auth.uid()
        )
    );

-- Create function to calculate total price
CREATE OR REPLACE FUNCTION public.calculate_item_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total price
    NEW.total_price := NEW.quantity * NEW.unit_price;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate total price
CREATE TRIGGER calculate_transaction_item_total
    BEFORE INSERT OR UPDATE ON public.transaction_items
    FOR EACH ROW EXECUTE FUNCTION public.calculate_item_total();

-- Create function to update product stock
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Decrease stock when item is added
        UPDATE public.products 
        SET stock = stock - NEW.quantity
        WHERE id = NEW.product_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Adjust stock based on quantity change
        UPDATE public.products 
        SET stock = stock + OLD.quantity - NEW.quantity
        WHERE id = NEW.product_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Increase stock when item is removed
        UPDATE public.products 
        SET stock = stock + OLD.quantity
        WHERE id = OLD.product_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update product stock
CREATE TRIGGER update_product_stock_on_transaction_item
    AFTER INSERT OR UPDATE OR DELETE ON public.transaction_items
    FOR EACH ROW EXECUTE FUNCTION public.update_product_stock();