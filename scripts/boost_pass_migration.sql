-- 1. Create User XP & Pass Profile Table
CREATE TABLE IF NOT EXISTS public.user_xp_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_xp INTEGER DEFAULT 0 NOT NULL,
    boost_passes_available INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Boost Pass Status Enum (Check if it already exists to prevent duplicate error)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'boost_pass_status') THEN
        CREATE TYPE public.boost_pass_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
    END IF;
END$$;

-- 3. Create Boost Pass Transactions Table
CREATE TABLE IF NOT EXISTS public.boost_pass_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.boost_pass_status DEFAULT 'pending'::public.boost_pass_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days') NOT NULL,
    CONSTRAINT uniq_sender_receiver UNIQUE (sender_id, receiver_id)
);

-- 4. Enable Row Level Security (RLS) on new tables
ALTER TABLE public.user_xp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boost_pass_transactions ENABLE ROW LEVEL SECURITY;

-- 5. Create basic RLS policies
-- XP Profiles: Everyone can read, only service role / triggers can write, users can read their own
DROP POLICY IF EXISTS select_user_xp_profiles ON public.user_xp_profiles;
CREATE POLICY select_user_xp_profiles ON public.user_xp_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS select_boost_pass_transactions ON public.boost_pass_transactions;
CREATE POLICY select_boost_pass_transactions ON public.boost_pass_transactions
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS insert_boost_pass_transactions ON public.boost_pass_transactions;
CREATE POLICY insert_boost_pass_transactions ON public.boost_pass_transactions
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS update_boost_pass_transactions ON public.boost_pass_transactions;
CREATE POLICY update_boost_pass_transactions ON public.boost_pass_transactions
    FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- 6. Populate default XP profile rows for all existing users
INSERT INTO public.user_xp_profiles (user_id, current_xp, boost_passes_available)
SELECT id, 0, 0 FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
