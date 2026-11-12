-- Migration: Schedule hourly subscription expiry via pg_cron

-- Enable pg_cron extension (requires superuser; run once per project)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant pg_cron usage to postgres role (Supabase default)
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule expire_subscriptions() to run at the top of every hour.
-- cron.schedule is idempotent by job name: re-running this migration will
-- update the schedule rather than create a duplicate.
SELECT cron.schedule(
    'expire-subscriptions',   -- unique job name
    '0 * * * *',              -- every hour at :00
    'SELECT public.expire_subscriptions();'
);
