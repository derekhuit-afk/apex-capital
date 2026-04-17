-- HyCRE.ai v2.0 Supabase Migration
-- Creates the full CRE schema that was spec'd but never deployed
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT DO NOTHING)

-- ═══════════════════════════════════════════════════════════════
-- cre_lenders — 52 verified lender registry
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cre_lenders (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,
  logo          TEXT,
  min_loan      BIGINT,
  max_loan      BIGINT,
  max_ltv       NUMERIC(5,2),
  min_dscr      NUMERIC(4,2),
  prop_types    TEXT[],
  markets       TEXT,
  rate_range    TEXT,
  term          TEXT,
  amort         TEXT,
  contact       TEXT,
  phone         TEXT,
  website       TEXT,
  specialty     TEXT,
  notes         TEXT,
  last_verified TEXT,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cre_lenders_type     ON cre_lenders(type);
CREATE INDEX IF NOT EXISTS idx_cre_lenders_active   ON cre_lenders(active);
CREATE INDEX IF NOT EXISTS idx_cre_lenders_min_loan ON cre_lenders(min_loan);

-- RLS: Public read (lenders are a public registry), service-role only write
ALTER TABLE cre_lenders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cre_lenders_public_read ON cre_lenders;
CREATE POLICY cre_lenders_public_read ON cre_lenders
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS cre_lenders_service_write ON cre_lenders;
CREATE POLICY cre_lenders_service_write ON cre_lenders
  FOR ALL USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════
-- cre_deals — saved deals per user
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cre_deals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_name       TEXT,
  property_type   TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  zip             TEXT,
  units           INTEGER,
  sqft            INTEGER,
  year_built      INTEGER,
  purchase_price  BIGINT,
  noi             BIGINT,
  ltv             NUMERIC(5,2),
  dscr            NUMERIC(4,2),
  cap_rate        NUMERIC(5,2),
  loan_purpose    TEXT,
  loan_amount     BIGINT,
  rate            NUMERIC(5,3),
  term_years      INTEGER,
  amort_years     INTEGER,
  sponsor_name    TEXT,
  sponsor_experience TEXT,
  status          TEXT DEFAULT 'draft',
  apex_score      INTEGER,
  ai_analysis     JSONB,
  matched_lenders JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cre_deals_user_id ON cre_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_cre_deals_status  ON cre_deals(status);
CREATE INDEX IF NOT EXISTS idx_cre_deals_state   ON cre_deals(state);

ALTER TABLE cre_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cre_deals_owner_all ON cre_deals;
CREATE POLICY cre_deals_owner_all ON cre_deals
  FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════
-- cre_market_snapshots — daily market snapshots for historical charting
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cre_market_snapshots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),
  t10y        NUMERIC(5,2),
  t5y         NUMERIC(5,2),
  t2y         NUMERIC(5,2),
  sofr        NUMERIC(5,2),
  effr        NUMERIC(5,2),
  prime       NUMERIC(5,2),
  source      TEXT,
  raw_json    JSONB
);

CREATE INDEX IF NOT EXISTS idx_cre_market_snapshot_at ON cre_market_snapshots(snapshot_at DESC);

ALTER TABLE cre_market_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cre_market_public_read ON cre_market_snapshots;
CREATE POLICY cre_market_public_read ON cre_market_snapshots
  FOR SELECT USING (true);
DROP POLICY IF EXISTS cre_market_service_write ON cre_market_snapshots;
CREATE POLICY cre_market_service_write ON cre_market_snapshots
  FOR INSERT WITH CHECK (auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════
-- cre_prospects — saved HMDA prospects in user's pipeline
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cre_prospects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company       TEXT,
  prop_type     TEXT,
  state         TEXT,
  city          TEXT,
  loan_amount   BIGINT,
  orig_lender   TEXT,
  orig_year     INTEGER,
  orig_rate     NUMERIC(5,2),
  rate_gap      NUMERIC(5,2),
  opp_type      TEXT,
  refi_score    INTEGER,
  priority      TEXT,
  source        TEXT DEFAULT 'hmda_simulator',
  hmda_lei      TEXT,
  stage         TEXT DEFAULT 'new',
  notes         TEXT,
  last_contacted TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cre_prospects_user_id ON cre_prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_cre_prospects_stage   ON cre_prospects(stage);

ALTER TABLE cre_prospects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cre_prospects_owner_all ON cre_prospects;
CREATE POLICY cre_prospects_owner_all ON cre_prospects
  FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════
-- updated_at auto-trigger
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION cre_set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cre_lenders_updated ON cre_lenders;
CREATE TRIGGER cre_lenders_updated BEFORE UPDATE ON cre_lenders
  FOR EACH ROW EXECUTE FUNCTION cre_set_updated_at();

DROP TRIGGER IF EXISTS cre_deals_updated ON cre_deals;
CREATE TRIGGER cre_deals_updated BEFORE UPDATE ON cre_deals
  FOR EACH ROW EXECUTE FUNCTION cre_set_updated_at();

DROP TRIGGER IF EXISTS cre_prospects_updated ON cre_prospects;
CREATE TRIGGER cre_prospects_updated BEFORE UPDATE ON cre_prospects
  FOR EACH ROW EXECUTE FUNCTION cre_set_updated_at();
