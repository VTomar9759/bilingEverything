-- Migration: Create public.expenses table
-- Copy and run this script in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  created_by uuid,
  expense_date timestamp with time zone NOT NULL DEFAULT now(),
  category text NOT NULL DEFAULT 'Other'::text,
  description text,
  amount numeric(12, 2) NOT NULL DEFAULT 0.00,
  payment_method text NOT NULL DEFAULT 'Cash'::text,
  notes text,
  receipt_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_org_id ON public.expenses USING btree (org_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses USING btree (expense_date) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses USING btree (category) TABLESPACE pg_default;

-- Enable Row Level Security (RLS)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for expenses" ON public.expenses
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for expenses" ON public.expenses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for expenses" ON public.expenses
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete access for expenses" ON public.expenses
  FOR DELETE
  USING (true);
