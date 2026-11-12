-- Migration: Create org_subscriptions table
-- Tracks subscriptions assigned to organizations

CREATE TABLE IF NOT EXISTS public.org_subscriptions (
    id              UUID            NOT NULL DEFAULT gen_random_uuid(),
    organization_id UUID            NOT NULL,
    plan_id         BIGINT          NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending',
    amount          NUMERIC(10,2)   NOT NULL,
    currency        VARCHAR(3)      NOT NULL DEFAULT 'INR',
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    activated_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT org_subscriptions_pkey
        PRIMARY KEY (id),
    CONSTRAINT org_subscriptions_status_check
        CHECK (status IN ('pending','active','replaced','expired','cancelled','failed')),
    CONSTRAINT org_subscriptions_organization_id_fkey
        FOREIGN KEY (organization_id)
        REFERENCES public.organization (id)
        ON DELETE CASCADE,
    CONSTRAINT org_subscriptions_plan_id_fkey
        FOREIGN KEY (plan_id)
        REFERENCES public.subscription_plan (id)
);

-- Standard indexes
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org_id
    ON public.org_subscriptions (organization_id);

CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status
    ON public.org_subscriptions (status);

CREATE INDEX IF NOT EXISTS idx_org_subscriptions_end_date
    ON public.org_subscriptions (end_date);

-- Partial unique indexes: enforce at most one active / one pending per org
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_subscriptions_one_active
    ON public.org_subscriptions (organization_id)
    WHERE (status = 'active');

CREATE UNIQUE INDEX IF NOT EXISTS idx_org_subscriptions_one_pending
    ON public.org_subscriptions (organization_id)
    WHERE (status = 'pending');

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.org_subscriptions ENABLE ROW LEVEL SECURITY;

-- Authenticated users may SELECT rows that belong to their own organization.
-- Membership is confirmed by the existence of a row in public.organization
-- where the authenticated user is the owner (adjust the column name below if
-- your organization table stores membership differently).
CREATE POLICY "org_members_select_own_subscriptions"
    ON public.org_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            -- Owner access
            SELECT id FROM public.organization WHERE created_by = auth.uid()
            UNION
            -- Admin member access
            SELECT org_id FROM public.admin WHERE id IN (
                SELECT id FROM public.admin WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            )
        )
    );
