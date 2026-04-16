BEGIN;

-- Function to automatically create earning record on deliverable approval
CREATE OR REPLACE FUNCTION public.handle_deliverable_approval()
RETURNS trigger AS $$
DECLARE
    v_payout NUMERIC;
BEGIN
    -- Only proceed if status changed to 'approved'
    IF (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved')) THEN
        -- Get the payout amount from the campaign
        SELECT payout_amount INTO v_payout 
        FROM public.campaigns 
        WHERE id = NEW.campaign_id;

        -- Insert into creator_earnings
        INSERT INTO public.creator_earnings (
            creator_id,
            campaign_id,
            deliverable_id,
            amount,
            status
        ) VALUES (
            NEW.creator_id,
            NEW.campaign_id,
            NEW.id,
            COALESCE(v_payout, 0),
            'pending'
        )
        ON CONFLICT (deliverable_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for deliverable approval
CREATE OR REPLACE TRIGGER on_deliverable_approved
  AFTER UPDATE ON public.deliverables
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_deliverable_approval();

COMMIT;
