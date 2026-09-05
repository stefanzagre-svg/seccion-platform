-- Migration: 20260905_matrix_escrow_orders.sql
-- Description: Matrix Escrow Engine for Custom Creator Orders (Red 💊 Held -> Released)

CREATE TABLE IF NOT EXISTS public.matrix_escrow_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fan_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    red_pills_amount INTEGER NOT NULL CHECK (red_pills_amount > 0),
    blue_pills_xp_reward INTEGER NOT NULL DEFAULT 50, -- XP awarded to both upon successful delivery
    status VARCHAR(30) NOT NULL DEFAULT 'held_in_escrow', -- 'held_in_escrow', 'in_progress', 'delivered', 'completed', 'refunded', 'disputed'
    delivery_media_url TEXT,
    delivery_notes TEXT,
    deadline_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    delivered_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    auto_release_at TIMESTAMPTZ, -- 48 hours after delivery
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_fan ON public.matrix_escrow_orders(fan_id);
CREATE INDEX IF NOT EXISTS idx_escrow_creator ON public.matrix_escrow_orders(creator_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON public.matrix_escrow_orders(status);
