-- 1. Enums
DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('active','past_due','canceled','unpaid','trialing');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.plan_type AS ENUM ('starter','pro','agency_10');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status subscription_status NOT NULL DEFAULT 'trialing',
  plan_type plan_type NOT NULL DEFAULT 'starter',
  current_period_end timestamptz,
  grace_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- 3. Auto-calculate grace_period_end trigger
CREATE OR REPLACE FUNCTION public.calculate_grace_period()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.current_period_end IS NOT NULL THEN
    NEW.grace_period_end := NEW.current_period_end + INTERVAL '5 days';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_calculate_grace_period ON public.subscriptions;
CREATE TRIGGER trg_calculate_grace_period
  BEFORE INSERT OR UPDATE OF current_period_end ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.calculate_grace_period();

-- 4. RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access subscriptions"
  ON public.subscriptions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5. Access check function
CREATE OR REPLACE FUNCTION public.check_access_status(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
      AND (
        status = 'active'
        OR status = 'trialing'
        OR (status = 'past_due' AND grace_period_end >= now())
      )
  )
  OR EXISTS (
    -- Also allow users still in trial via profiles
    SELECT 1 FROM public.profiles
    WHERE user_id = p_user_id
      AND plano = 'trial'
      AND trial_ends_at >= now()
  );
$$;
