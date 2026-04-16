BEGIN;

-- Add payout_amount to campaigns so creators know what they'll earn
ALTER TABLE campaigns ADD COLUMN payout_amount NUMERIC DEFAULT 0 NOT NULL;

-- Create creator_earnings table to track what we owe creators
CREATE TABLE creator_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
    deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(deliverable_id) -- One earning per approved video
);

-- Enable RLS
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Creators can view own earnings" ON creator_earnings 
    FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Admins can manage all earnings" ON creator_earnings 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

COMMIT;
