-- Campaign Operations Platform — Supabase Tables
-- Run this in the OurNews Supabase SQL editor (cencmfojarnapwinhdil)
-- All tables prefixed with campaign_ to avoid collisions

-- Volunteers (username auth via Supabase Auth with synthetic emails)
CREATE TABLE IF NOT EXISTS campaign_volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE,
  nickname text,
  created_at timestamptz DEFAULT now()
);

-- Activity feed (all volunteer actions)
CREATE TABLE IF NOT EXISTS campaign_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES campaign_volunteers(id),
  type text NOT NULL,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaign_activity_volunteer ON campaign_activity(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_activity_created ON campaign_activity(created_at DESC);

-- Ideas with voting
CREATE TABLE IF NOT EXISTS campaign_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES campaign_volunteers(id),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'suggestion',
  body text,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_idea_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES campaign_ideas(id) ON DELETE CASCADE,
  volunteer_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(idea_id, volunteer_id)
);

-- Video journal entries
CREATE TABLE IF NOT EXISTS campaign_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES campaign_volunteers(id),
  title text NOT NULL,
  description text,
  storage_path text NOT NULL,
  duration text,
  created_at timestamptz DEFAULT now()
);

-- Login attempt tracking (rate limiting)
CREATE TABLE IF NOT EXISTS campaign_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_username_time
  ON campaign_login_attempts(username, created_at DESC);

-- Quest proof uploads storage bucket (run in Supabase dashboard → Storage → New bucket)
-- Name: campaign-proofs, Public: true
-- Or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('campaign-proofs', 'campaign-proofs', true);

-- RPC function for incrementing idea votes
CREATE OR REPLACE FUNCTION increment_idea_votes(idea_id_input uuid)
RETURNS void AS $$
BEGIN
  UPDATE campaign_ideas SET votes = votes + 1 WHERE id = idea_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies (permissive for campaign — public read, authenticated write)
ALTER TABLE campaign_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_login_attempts ENABLE ROW LEVEL SECURITY;

-- Public read on all campaign tables
CREATE POLICY "campaign_volunteers_read" ON campaign_volunteers FOR SELECT USING (true);
CREATE POLICY "campaign_activity_read" ON campaign_activity FOR SELECT USING (true);
CREATE POLICY "campaign_ideas_read" ON campaign_ideas FOR SELECT USING (true);
CREATE POLICY "campaign_idea_votes_read" ON campaign_idea_votes FOR SELECT USING (true);
CREATE POLICY "campaign_videos_read" ON campaign_videos FOR SELECT USING (true);

-- Login attempts: anyone can insert (needed before auth), anyone can read (for rate check)
CREATE POLICY "login_attempts_insert" ON campaign_login_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "login_attempts_read" ON campaign_login_attempts FOR SELECT USING (true);

-- Authenticated insert
CREATE POLICY "campaign_volunteers_insert" ON campaign_volunteers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "campaign_activity_insert" ON campaign_activity FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "campaign_ideas_insert" ON campaign_ideas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "campaign_idea_votes_insert" ON campaign_idea_votes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "campaign_videos_insert" ON campaign_videos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Volunteers can update their own records
CREATE POLICY "campaign_volunteers_update" ON campaign_volunteers FOR UPDATE USING (id = auth.uid());
