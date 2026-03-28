
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add schedule columns to agent_settings
ALTER TABLE public.agent_settings
  ADD COLUMN IF NOT EXISTS reviews_cron text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS posts_cron text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS profile_cron text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ads_cron text DEFAULT NULL;
