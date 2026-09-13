-- Migration: Remove invoice_footer and print_type from organization table
-- These fields are now managed in the print_settings table
-- Date: 2026-09-13

ALTER TABLE public.organization
  DROP COLUMN IF EXISTS invoice_footer,
  DROP COLUMN IF EXISTS print_type;
