BEGIN;

-- Create campaign_applications table
CREATE TABLE campaign_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
    status application_status DEFAULT 'pending' NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(campaign_id, creator_id)
);

-- Enable RLS
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_applications
CREATE POLICY "Creators can view own applications" ON campaign_applications 
    FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Creators can apply for campaigns" ON campaign_applications 
    FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Brands can view applications for their campaigns" ON campaign_applications 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND brand_id = auth.uid())
    );

CREATE POLICY "Brands can update application status" ON campaign_applications 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM campaigns WHERE id = campaign_id AND brand_id = auth.uid())
    );

CREATE POLICY "Admins can manage all applications" ON campaign_applications 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

COMMIT;
