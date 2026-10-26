-- Enable Row Level Security (RLS) on subscription_plan
ALTER TABLE public.subscription_plan ENABLE ROW LEVEL SECURITY;

-- Allow public and authenticated users to read active subscription plans
DROP POLICY IF EXISTS "Allow public read access to active subscription plans" ON public.subscription_plan;
CREATE POLICY "Allow public read access to active subscription plans"
ON public.subscription_plan
FOR SELECT
TO anon, authenticated
USING (is_active = true);
