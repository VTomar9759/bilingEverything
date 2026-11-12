-- Migration: Subscription activation + expiry helper functions

-- ────────────────────────────────────────────────────────────────────────────
-- activate_subscription
--   Atomically moves a pending subscription to active, marks the previously
--   active subscription as replaced, and marks the payment as captured.
--   Must be called by an edge function / backend (SECURITY DEFINER).
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.activate_subscription(
    p_subscription_id UUID,
    p_payment_id      UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sub           public.org_subscriptions%ROWTYPE;
    v_duration      INTEGER;
    v_end_date      TIMESTAMPTZ;
    v_result        JSONB;
BEGIN
    -- a) Lock the subscription row to prevent concurrent activations
    SELECT *
      INTO v_sub
      FROM public.org_subscriptions
     WHERE id = p_subscription_id
       FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription % not found', p_subscription_id;
    END IF;

    -- b) Validate status is 'pending'
    IF v_sub.status <> 'pending' THEN
        RAISE EXCEPTION
            'Subscription % is in status %; expected pending',
            p_subscription_id, v_sub.status;
    END IF;

    -- c) Fetch plan duration
    SELECT duration_months
      INTO v_duration
      FROM public.subscription_plan
     WHERE id = v_sub.plan_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'subscription_plan % not found', v_sub.plan_id;
    END IF;

    v_end_date := now() + (INTERVAL '1 month' * v_duration);

    -- d) Mark previous active subscription as 'replaced'
    UPDATE public.org_subscriptions
       SET status     = 'replaced',
           updated_at = now()
     WHERE organization_id = v_sub.organization_id
       AND status           = 'active';

    -- e) Activate the new subscription
    UPDATE public.org_subscriptions
       SET status       = 'active',
           activated_at = now(),
           start_date   = now(),
           end_date     = v_end_date,
           updated_at   = now()
     WHERE id = p_subscription_id;

    -- f) Mark payment as captured if payment_id is provided
    IF p_payment_id IS NOT NULL THEN
        UPDATE public.payments
           SET status  = 'captured',
               paid_at = now()
         WHERE id = p_payment_id;
    END IF;

    -- g) Return subscription details
    v_result := jsonb_build_object(
        'subscription_id',  p_subscription_id,
        'organization_id',  v_sub.organization_id,
        'plan_id',          v_sub.plan_id,
        'status',           'active',
        'start_date',       now(),
        'end_date',         v_end_date,
        'activated_at',     now()
    );

    RETURN v_result;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- expire_subscriptions
--   Sets status to 'expired' for every active subscription whose end_date
--   has passed.  Called by the pg_cron job defined in the next migration.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.org_subscriptions
       SET status     = 'expired',
           updated_at = now()
     WHERE status   = 'active'
       AND end_date < now();
END;
$$;

-- ── Grants ───────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.activate_subscription(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.expire_subscriptions()            TO authenticated, service_role;
