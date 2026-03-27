ALTER TABLE oauth_tokens
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS data_review TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE gmb_snapshots
  ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_provider
  ON oauth_tokens(user_id, provider);

CREATE INDEX IF NOT EXISTS idx_reviews_business_google_id
  ON reviews(business_id, review_id_google);