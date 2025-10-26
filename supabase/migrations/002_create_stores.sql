-- Migration: Create stores table
-- Description: Stores table for multi-tenant POS system

-- Create stores table
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own stores" ON public.stores
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own stores" ON public.stores
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own stores" ON public.stores
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own stores" ON public.stores
    FOR DELETE USING (owner_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON public.stores
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create a default store for new users
CREATE OR REPLACE FUNCTION public.create_default_store()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.stores (owner_id, name)
    VALUES (NEW.id, COALESCE(NEW.full_name || '''s Store', 'My Store'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create default store when profile is created
CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_default_store();