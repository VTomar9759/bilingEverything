-- Migration: Create public.admin table
-- Date: 2026-08-06
-- Description: Creates admin table with name, email, org_id, created_by, and permissions columns.

CREATE TABLE IF NOT EXISTS public.admin (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  name text NOT NULL,
  email text NOT NULL,
  org_id uuid NOT NULL,
  created_by uuid NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_pkey PRIMARY KEY (id),
  CONSTRAINT admin_email_key UNIQUE (email),
  CONSTRAINT admin_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT admin_org_id_fkey FOREIGN KEY (org_id) REFERENCES organization (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_admin_org_id ON public.admin USING btree (org_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_admin_created_by ON public.admin USING btree (created_by) TABLESPACE pg_default;
