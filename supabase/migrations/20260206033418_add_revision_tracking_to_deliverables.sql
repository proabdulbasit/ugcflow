BEGIN;

-- Add unique constraint to deliverables to allow upserting revisions
ALTER TABLE deliverables 
ADD CONSTRAINT unique_campaign_creator_deliverable UNIQUE (campaign_id, creator_id);

-- Add revision_count to track how many times a brand has requested changes
ALTER TABLE deliverables 
ADD COLUMN revision_count INTEGER DEFAULT 0 NOT NULL;

COMMIT;
