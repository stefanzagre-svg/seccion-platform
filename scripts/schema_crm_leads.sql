-- Create CRM Outreach Leads Table
CREATE TABLE IF NOT EXISTS public.crm_outreach_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id TEXT UNIQUE, -- to store IDs like 'crm-med-001' from JSON
    full_name TEXT NOT NULL,
    city TEXT NOT NULL,
    specialization TEXT,
    instagram_handle TEXT,
    tiktok_handle TEXT,
    telegram TEXT,
    email TEXT,
    status TEXT DEFAULT 'lead_identified', -- lead_identified, dm_sent, application_submitted, under_review, waitlist, approved_onboarded, rejected
    outreach_stage TEXT,
    outreach_date DATE,
    applied_via_web BOOLEAN DEFAULT false,
    year1_founding_rate BOOLEAN DEFAULT false,
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Restrict to Service Role only for Admin UI access)
ALTER TABLE public.crm_outreach_leads ENABLE ROW LEVEL SECURITY;

-- Allow read/write access to authenticated super_admins (though the API uses service_role so it bypasses RLS anyway)
CREATE POLICY "Allow admin access"
ON public.crm_outreach_leads
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add index on city and status for fast querying
CREATE INDEX idx_crm_outreach_leads_city ON public.crm_outreach_leads (city);
CREATE INDEX idx_crm_outreach_leads_status ON public.crm_outreach_leads (status);
