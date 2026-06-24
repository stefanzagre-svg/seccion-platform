-- ======================================================
-- SESSION PLATFORM - CROWDFUNDING & GOALS SCHEMA
-- ======================================================

-- Create creator_goals table
CREATE TABLE IF NOT EXISTS public.creator_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (current_amount >= 0),
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goal_contributions table
CREATE TABLE IF NOT EXISTS public.goal_contributions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    goal_id UUID REFERENCES public.creator_goals(id) ON DELETE CASCADE NOT NULL,
    contributor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for lookup efficiency
CREATE INDEX IF NOT EXISTS creator_goals_creator_id_idx ON public.creator_goals(creator_id);
CREATE INDEX IF NOT EXISTS goal_contributions_goal_id_idx ON public.goal_contributions(goal_id);

-- Enable RLS
ALTER TABLE public.creator_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY "Creator goals are viewable by everyone" ON public.creator_goals FOR SELECT USING (true);
CREATE POLICY "Goal contributions are viewable by everyone" ON public.goal_contributions FOR SELECT USING (true);

-- Manage policies
CREATE POLICY "Creators can manage their own goals" ON public.creator_goals 
    FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Members can log contributions" ON public.goal_contributions
    FOR INSERT WITH CHECK (auth.uid() = contributor_id);

-- Updated_at trigger
CREATE TRIGGER update_creator_goals_updated_at BEFORE UPDATE ON public.creator_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
