-- Migration: Create transactions table
-- Description: Main transactions table for POS sales

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    transaction_number TEXT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount DECIMAL(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    tax_amount DECIMAL(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'ewallet')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure transaction number is unique per store
    UNIQUE(store_id, transaction_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON public.transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_number ON public.transactions(store_id, transaction_number);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(store_id, created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON public.transactions(store_id, payment_method);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view transactions from their stores" ON public.transactions
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert transactions to their stores" ON public.transactions
    FOR INSERT WITH CHECK (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update transactions in their stores" ON public.transactions
    FOR UPDATE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete transactions from their stores" ON public.transactions
    FOR DELETE USING (
        store_id IN (
            SELECT id FROM public.stores WHERE owner_id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate transaction number
CREATE OR REPLACE FUNCTION public.generate_transaction_number(store_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    current_date TEXT;
    sequence_num INTEGER;
    transaction_num TEXT;
BEGIN
    -- Get current date in YYYYMMDD format
    current_date := TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Get the next sequence number for today
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(transaction_number FROM LENGTH(current_date) + 2) AS INTEGER
        )
    ), 0) + 1
    INTO sequence_num
    FROM public.transactions
    WHERE store_id = store_uuid
    AND transaction_number LIKE current_date || '%';
    
    -- Format: YYYYMMDD-NNNN (e.g., 20241026-0001)
    transaction_num := current_date || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN transaction_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to auto-generate transaction number
CREATE OR REPLACE FUNCTION public.auto_generate_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate transaction number if not provided
    IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
        NEW.transaction_number := public.generate_transaction_number(NEW.store_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate transaction number
CREATE TRIGGER auto_generate_transaction_number
    BEFORE INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.auto_generate_transaction_number();