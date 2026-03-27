CREATE TABLE IF NOT EXISTS websites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  theme TEXT DEFAULT 'dark',
  primary_color TEXT DEFAULT '#6366F1',
  config JSONB DEFAULT '{}',
  seo_titulo TEXT,
  seo_descricao TEXT,
  seo_og_image TEXT,
  total_visitas INTEGER DEFAULT 0,
  visitas_semana INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS website_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT now(),
  referrer TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS websites_slug_idx ON websites(slug);
CREATE INDEX IF NOT EXISTS websites_domain_idx ON websites(custom_domain);
CREATE INDEX IF NOT EXISTS websites_business_idx ON websites(business_id);

ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_access" ON websites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public_read" ON websites FOR SELECT USING (published = true);
CREATE POLICY "anyone_can_insert_visits" ON website_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "owner_reads_visits" ON website_visits FOR SELECT USING (EXISTS (SELECT 1 FROM websites WHERE websites.id = website_visits.website_id AND websites.user_id = auth.uid()));