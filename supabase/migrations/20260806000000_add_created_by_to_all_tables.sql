-- Migration: Add `created_by` column to all tables
-- Date: 2026-08-06
-- Description: Adds a `created_by` column to all existing application tables and all tables in the public schema.

-- =========================================================
-- 1. Explicit ALTER TABLE statements for existing tables
-- =========================================================

-- Organization table
ALTER TABLE IF EXISTS public.organization
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Categories table
ALTER TABLE IF EXISTS public.categories
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Items table
ALTER TABLE IF EXISTS public.items
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Dining Tables table
ALTER TABLE IF EXISTS public.dining_tables
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Orders table
ALTER TABLE IF EXISTS public.orders
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- =========================================================
-- 2. Dynamic PL/pgSQL block to ensure ALL tables in 'public' schema have `created_by`
-- =========================================================
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;', tbl);
    END LOOP;
END $$;
