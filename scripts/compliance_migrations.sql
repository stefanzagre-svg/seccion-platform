-- Add moderation status column to public.platform_content
ALTER TABLE public.platform_content 
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved';

-- Enforce CHECK constraint on moderation status
ALTER TABLE public.platform_content
DROP CONSTRAINT IF EXISTS chk_moderation_status,
ADD CONSTRAINT chk_moderation_status CHECK (moderation_status IN ('pending', 'approved', 'rejected'));

-- Set default for new rows to 'pending' (existing rows stay 'approved')
ALTER TABLE public.platform_content ALTER COLUMN moderation_status SET DEFAULT 'pending';
