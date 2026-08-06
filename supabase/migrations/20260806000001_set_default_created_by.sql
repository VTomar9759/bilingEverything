-- Migration: Set default value for created_by to '159068bf-e1fa-4596-a335-3d9fe7d71520' and populate existing records
-- Date: 2026-08-06
-- Target ID: 159068bf-e1fa-4596-a335-3d9fe7d71520

-- =========================================================
-- 1. Explicit ALTER & UPDATE statements for existing tables
-- =========================================================

-- Organization table
ALTER TABLE IF EXISTS public.organization DROP CONSTRAINT IF EXISTS organization_created_by_fkey;
ALTER TABLE IF EXISTS public.organization ALTER COLUMN created_by SET DEFAULT '159068bf-e1fa-4596-a335-3d9fe7d71520'::uuid;
UPDATE public.organization SET created_by = '159068bf-e1fa-4596-a335-3d9fe7d71520'::uuid;

-- Categories table
ALTER TABLE IF EXISTS public.categories DROP CONSTRAINT IF EXISTS categories_created_by_fkey;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN created_by SET DEFAULT '159068bf-e1fa-4596-a335-3d9fe7d71520'::uuid;
UPDATE public.categories SET created_by = '159068bf-e1fa-4596-a335-3d9fe7d71520'::uuid;

-- Items table
ALTER TABLE IF EXISTS public.items DROP CONSTRAINT IF EXISTS items_created_by_fkey;
ALTER TABLE IF EXISTS public.items ALTER COLUMN created_by SET DEFAULT '159068bf-e1fa-4596-a335-3d9fe7d71520'::uuid;
UPDATE public.items SET created_by = '159068bf-e1fa-4596-a335-3d9fe7d71520'::uuid;

-- Dining Tables table
ALTER TABLE IF EXISTS public.dining_tables DROP CONSTRAINT IF EXISTS dining_tables_created_by_fkey;
ALTER TABLE IF EXISTS public.dining_tables ALTER COLUMN created_by SET DEFAULT '159068bf-e1fa-4596-a335-3d9fe7d71520'::uuid;
UPDATE public.dining_tables SET created_by = '159068bf-e1fa-4596-a335-3d9fe7d71520'::uuid;

-- Orders table
ALTER TABLE IF EXISTS public.orders DROP CONSTRAINT IF EXISTS orders_created_by_fkey;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN created_by SET DEFAULT '159068bf-e1fa-4596-a335-3d9fe7d71520'::uuid;
UPDATE public.orders SET created_by = '159068bf-e1fa-4596-a335-3d9fe7d71520'::uuid;

-- =========================================================
-- 2. Dynamic PL/pgSQL block to update ALL public tables
-- =========================================================
DO $$
DECLARE
    tbl text;
    fk_record RECORD;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
    LOOP
        -- Drop FK constraints if any on created_by
        FOR fk_record IN 
            SELECT constraint_name 
            FROM information_schema.constraint_column_usage 
            WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'created_by'
        LOOP
            EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I;', tbl, fk_record.constraint_name);
        END LOOP;

        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN created_by SET DEFAULT ''159068bf-e1fa-4596-a335-3d9fe7d71520''::uuid;', tbl);
        EXECUTE format('UPDATE public.%I SET created_by = ''159068bf-e1fa-4596-a335-3d9fe7d71520''::uuid;', tbl);
    END LOOP;
END $$;
