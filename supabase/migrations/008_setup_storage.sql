-- Migration: Setup Storage for product images and store logos
-- Description: Create storage buckets and policies for file uploads

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for store logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-logos', 'store-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Users can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Users can upload product images to their store" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN (
            SELECT s.id::text FROM public.stores s WHERE s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update product images in their store" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN (
            SELECT s.id::text FROM public.stores s WHERE s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete product images from their store" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN (
            SELECT s.id::text FROM public.stores s WHERE s.owner_id = auth.uid()
        )
    );

-- Storage policies for store logos
CREATE POLICY "Users can view store logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'store-logos');

CREATE POLICY "Users can upload logo to their store" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'store-logos' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN (
            SELECT s.id::text FROM public.stores s WHERE s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update logo in their store" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'store-logos' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN (
            SELECT s.id::text FROM public.stores s WHERE s.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete logo from their store" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'store-logos' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN (
            SELECT s.id::text FROM public.stores s WHERE s.owner_id = auth.uid()
        )
    );

-- Storage policies for user avatars
CREATE POLICY "Users can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );