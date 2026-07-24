-- ============================================
-- SECCIØN Pre-Launch Database Migration
-- Creator Applications + Member Waitlist
-- ============================================

-- 1. Creator Applications Table
-- Stores incoming creator applications from /become-creator form
CREATE TABLE IF NOT EXISTS creator_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  telegram TEXT NOT NULL,
  link1 TEXT NOT NULL,
  link2 TEXT,
  link3 TEXT,
  city TEXT,
  claim_offer BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'waitlist', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for admin panel queries
CREATE INDEX IF NOT EXISTS idx_creator_applications_status ON creator_applications(status);
CREATE INDEX IF NOT EXISTS idx_creator_applications_created ON creator_applications(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_creator_applications_email ON creator_applications(email);

-- 2. Member Waitlist Table
-- Stores member signups from public page waitlist CTAs
CREATE TABLE IF NOT EXISTS member_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  founding_member BOOLEAN DEFAULT true,
  notified_content_launch BOOLEAN DEFAULT false,
  notified_dating_launch BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for city-based queries
CREATE INDEX IF NOT EXISTS idx_member_waitlist_city ON member_waitlist(city);
CREATE INDEX IF NOT EXISTS idx_member_waitlist_created ON member_waitlist(created_at DESC);

-- 3. RLS Policies
-- creator_applications: only service role can read/write (admin operations)
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on creator_applications"
  ON creator_applications
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow anonymous inserts (public form submission)
CREATE POLICY "Public can insert creator_applications"
  ON creator_applications
  FOR INSERT
  WITH CHECK (true);

-- member_waitlist: public can insert, only service role can read/update
ALTER TABLE member_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on member_waitlist"
  ON member_waitlist
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Public can insert member_waitlist"
  ON member_waitlist
  FOR INSERT
  WITH CHECK (true);
