-- ============================================================================
-- KYC ENFORCEMENT ON SUGGESTION MOVES
-- Creates a lookup table for suggestion moves and enforces KYC requirements
-- via a database trigger on the messages table.
-- ============================================================================

-- 1. Create the suggestion_moves lookup table
CREATE TABLE IF NOT EXISTS public.suggestion_moves (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    emoji TEXT,
    kyc_required BOOLEAN DEFAULT false,
    relationship_level TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for suggestion_moves
ALTER TABLE public.suggestion_moves ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view suggestion moves" ON public.suggestion_moves;

-- Create policy for public viewing
CREATE POLICY "Anyone can view suggestion moves" 
ON public.suggestion_moves FOR SELECT 
USING (true);

-- 2. Seed the table with existing moves from the Relationship Engine
INSERT INTO public.suggestion_moves (id, label, emoji, kyc_required, relationship_level) VALUES
-- Acquaintance
('follow', 'Send a Hi five', '🖐️', false, 'acquaintance'),
('poke', 'Send a Poke', '👉', false, 'acquaintance'),
('punch', 'Send a Punch Line', '🎙️', false, 'acquaintance'),

-- Friendly
('reaction', 'Send a Reaction', '🎉', false, 'friendly'),
('compliment', 'Send a Compliment', '💬', false, 'friendly'),
('introduce_yourself', 'Send your presentation', '📝', false, 'friendly'),
('playlist', 'Share your playlist', '🎵', false, 'friendly'),
('movie', 'Share your Favorite Movies/Series', '🎬', false, 'friendly'),
('gaming', 'Ask online Gaming Session', '🎮', false, 'friendly'),
('gift', 'Send a gift', '🎁', false, 'friendly'),
('online', 'Propose Online Date', '💻', false, 'friendly'),
('learn', 'Suggest Online Courses', '📚', false, 'friendly'),
('live_streaming_performance', 'Live Streaming performance', '📹', false, 'friendly'),
('live_stream_introduction', 'Live Stream introduction', '🎙️', false, 'friendly'),

-- Close
('coffee', 'Propose Coffee Date', '☕', true, 'close'),
('picnic', 'Propose Picnic Date', '🧺', true, 'close'),
('city', 'Propose City/Park walk', '🌳', true, 'close'),
('culture', 'Propose Cultural Visit', '🏛️', true, 'close'),
('beach', 'Propose Beach Activities', '🏖️', true, 'close'),
('beach_bar', 'Propose beach bar/Party', '🍹', true, 'close'),
('lunch', 'Propose Lunch out', '🍱', true, 'close'),
('brunch', 'Propose Brunch out', '🥞', true, 'close'),
('shopping', 'Suggest to go to Shopping together', '🛍️', true, 'close'),
('happy', 'Propose happy hour', '🍻', true, 'close'),
('concert', 'Propose to go to Concert Live', '🎸', true, 'close'),
('tour', 'Propose City Tour', '🚌', true, 'close'),
('yoga', 'Propose Yoga Session', '🧘', true, 'close'),
('run', 'Suggest Running mate', '🏃', true, 'close'),
('outdoor', 'suggest outdoors Excursion', '🥾', true, 'close'),
('drink', 'Propose night out', '🥂', true, 'close'),
('restaurant', 'propose dinner out', '🍴', true, 'close'),
('exhibition', 'suggest an exhibition', '🎨', true, 'close'),
('show', 'Propose a Restaurant Live', '🎪', true, 'close'),
('sport', 'Suggest Sport activities', '⚽', true, 'close'),
('cook', 'Propose to cook together', '🧑‍🍳', true, 'close'),

-- Intimate (cook is already added under close)
('spa', 'Spa day', '💆', true, 'intimate'),
('karaoke', 'karaoke date', '🎤', true, 'intimate'),
('local', 'Local Short Trip', '🚗', true, 'intimate'),
('appetizer', 'Libertine appetizer', '🍢', true, 'intimate'),
('club', 'Night club/ lounge bar', '🕺', true, 'intimate'),
('home', 'Invitation home', '🏠', true, 'intimate'),
('relax', 'Massage/Relaxation', '🕯️', true, 'intimate'),
('performance', 'Sexual partner', '🫦', true, 'intimate'),

-- Passionate
('escape', 'impromptu escape', '🏝️', true, 'passionate'),
('surprise', 'surprise plan', '🎊', true, 'passionate'),
('international', 'International trip', '✈️', true, 'passionate'),
('swing', 'Swinger Party', '😈', true, 'passionate'),

-- Committed
('collab', 'Business/Social/Creative collaboration', '🎨', true, 'committed'),
('sponsor', 'Financial/Social sponsor', '💎', true, 'committed'),
('inner_circle', 'inner circle meet', '🤝', true, 'committed'),
('engagement', 'being engage', '💍', true, 'committed'),
('move_in', 'Co-Living ready', '🏠', true, 'committed'),
('family', 'build a Family', '👨‍👩‍👧‍👦', true, 'committed'),
('investment', 'Economical/Social investment together', '📈', true, 'committed'),
('house', 'buy a property', '🏡', true, 'committed'),
('parents', 'meet parents', '👥', true, 'committed'),

-- Soulmate
('partner', 'Life Partner', '💖', true, 'soulmate'),
('business', 'Business Partner', '💼', true, 'soulmate'),
('adopt', 'Adopt a child', '👶', true, 'soulmate')

ON CONFLICT (id) DO UPDATE SET
    label = EXCLUDED.label,
    emoji = EXCLUDED.emoji,
    kyc_required = EXCLUDED.kyc_required,
    relationship_level = EXCLUDED.relationship_level;


-- 3. Create the Trigger Function to enforce KYC on messages
CREATE OR REPLACE FUNCTION public.check_kyc_for_suggestion_move()
RETURNS TRIGGER AS $$
DECLARE
    sender_kyc_verified BOOLEAN;
    move_requires_kyc BOOLEAN;
BEGIN
    -- Only check if this is a suggestion message with a move ID
    IF NEW.is_suggestion = true AND NEW.suggestion_move_id IS NOT NULL THEN
        
        -- Look up if the move requires KYC
        SELECT kyc_required INTO move_requires_kyc
        FROM public.suggestion_moves
        WHERE id = NEW.suggestion_move_id;

        IF move_requires_kyc = true THEN
            -- Retrieve the sender's KYC status
            SELECT is_kyc_verified INTO sender_kyc_verified
            FROM public.profiles
            WHERE id = NEW.sender_id;

            -- If not verified, reject the insert/update
            IF sender_kyc_verified IS NOT TRUE THEN
                RAISE EXCEPTION 'KYC verification is required to send this suggested move (%)', NEW.suggestion_move_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Attach the Trigger to the messages table
DROP TRIGGER IF EXISTS trg_check_kyc_on_suggestion ON public.messages;
CREATE TRIGGER trg_check_kyc_on_suggestion
BEFORE INSERT OR UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.check_kyc_for_suggestion_move();
