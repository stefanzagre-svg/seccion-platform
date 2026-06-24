-- ADD BEST CREATORS RPC FUNCTION
-- Ranks creators based on total sales amount, quantity, and their dynamic rating score
CREATE OR REPLACE FUNCTION get_best_creators(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    creator_id UUID,
    username TEXT,
    avatar_url TEXT,
    total_sales_amount DECIMAL,
    total_sales_quantity BIGINT,
    rating_score DECIMAL,
    rank_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH spend_cte AS (
        SELECT 
            s.creator_id, 
            COALESCE(SUM(s.price_paid), 0) as sales_amount,
            COUNT(*) as sales_quantity
        FROM public.subscriptions s
        WHERE s.is_active = true
        GROUP BY s.creator_id
    )
    SELECT 
        p.id AS creator_id,
        p.username,
        p.avatar_url,
        COALESCE(s.sales_amount, 0) AS total_sales_amount,
        COALESCE(s.sales_quantity, 0) AS total_sales_quantity,
        (SELECT COALESCE(AVG(score), 10.00) FROM public.ratings WHERE target_id = p.id) AS rating_score,
        -- Normalize the score: (Sales Amount * 0.50) + (Sales Qty * 10) + (Rating * 20)
        (COALESCE(s.sales_amount, 0) * 0.50) + (COALESCE(s.sales_quantity, 0) * 10) + ((SELECT COALESCE(AVG(score), 10.00) FROM public.ratings WHERE target_id = p.id) * 20) AS rank_score
    FROM public.profiles p
    LEFT JOIN spend_cte s ON p.id = s.creator_id
    WHERE p.role = 'creator'
    ORDER BY rank_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
