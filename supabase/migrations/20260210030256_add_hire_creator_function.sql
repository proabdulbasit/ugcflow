BEGIN;

-- Function to atomically hire a creator
-- Deducts 1 credit from brand and assigns creator to campaign
CREATE OR REPLACE FUNCTION hire_creator(
    p_campaign_id UUID,
    p_creator_id UUID,
    p_brand_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_credits INTEGER;
BEGIN
    -- 1. Check if brand has enough credits
    SELECT credits INTO v_credits FROM brands WHERE id = p_brand_id;
    
    IF v_credits < 1 THEN
        RAISE EXCEPTION 'Insufficient credits. Please purchase more packages.';
    END IF;

    -- 2. Deduct 1 credit
    UPDATE brands SET credits = credits - 1 WHERE id = p_brand_id;

    -- 3. Assign creator to campaign
    INSERT INTO campaign_creators (campaign_id, creator_id)
    VALUES (p_campaign_id, p_creator_id)
    ON CONFLICT (campaign_id, creator_id) DO NOTHING;

    -- 4. Update application status
    UPDATE campaign_applications 
    SET status = 'approved' 
    WHERE campaign_id = p_campaign_id AND creator_id = p_creator_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
