-- SQL migration script to add Ephemeral Media columns to the messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_ephemeral BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS media_url TEXT DEFAULT null,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT null, -- 'image' | 'video' | 'file'
ADD COLUMN IF NOT EXISTS media_name TEXT DEFAULT null,
ADD COLUMN IF NOT EXISTS media_size TEXT DEFAULT null,
ADD COLUMN IF NOT EXISTS ephemeral_viewed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ephemeral_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT null,
ADD COLUMN IF NOT EXISTS ephemeral_expires_at TIMESTAMP WITH TIME ZONE DEFAULT null,
ADD COLUMN IF NOT EXISTS screenshot_detected BOOLEAN DEFAULT false;

-- Add policy to allow receivers to update ephemeral fields
DROP POLICY IF EXISTS "Users can update ephemeral fields of messages received by them" ON public.messages;
CREATE POLICY "Users can update ephemeral fields of messages received by them" 
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id);
