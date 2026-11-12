-- Migration: Create payments table
-- Records Razorpay payment attempts linked to org_subscriptions

CREATE TABLE IF NOT EXISTS public.payments (
    id                   UUID          NOT NULL DEFAULT gen_random_uuid(),
    subscription_id      UUID          NOT NULL,
    organization_id      UUID          NOT NULL,
    razorpay_order_id    VARCHAR(100)  NOT NULL,
    razorpay_payment_id  VARCHAR(100),
    razorpay_signature   TEXT,
    amount               NUMERIC(10,2) NOT NULL,
    currency             VARCHAR(3)    NOT NULL DEFAULT 'INR',
    status               VARCHAR(20)   NOT NULL DEFAULT 'created',
    paid_at              TIMESTAMPTZ,
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT payments_pkey
        PRIMARY KEY (id),
    CONSTRAINT payments_razorpay_order_id_key
        UNIQUE (razorpay_order_id),
    CONSTRAINT payments_razorpay_payment_id_key
        UNIQUE (razorpay_payment_id),
    CONSTRAINT payments_status_check
        CHECK (status IN ('created','authorised','captured','failed','refunded')),
    CONSTRAINT payments_subscription_id_fkey
        FOREIGN KEY (subscription_id)
        REFERENCES public.org_subscriptions (id),
    CONSTRAINT payments_organization_id_fkey
        FOREIGN KEY (organization_id)
        REFERENCES public.organization (id)
        ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id
    ON public.payments (subscription_id);

CREATE INDEX IF NOT EXISTS idx_payments_org_id
    ON public.payments (organization_id);

CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id
    ON public.payments (razorpay_order_id);

CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id
    ON public.payments (razorpay_payment_id);

CREATE INDEX IF NOT EXISTS idx_payments_status
    ON public.payments (status);

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Authenticated users may SELECT payments that belong to their own organization.
CREATE POLICY "org_members_select_own_payments"
    ON public.payments
    FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            -- Owner access
            SELECT id FROM public.organization WHERE created_by = auth.uid()
            UNION
            -- Admin member access
            SELECT org_id FROM public.admin WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );
