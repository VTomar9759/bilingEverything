-- Migration: Add half_price column to public.items table
ALTER TABLE IF EXISTS public.items 
ADD COLUMN IF NOT EXISTS half_price text NULL;
