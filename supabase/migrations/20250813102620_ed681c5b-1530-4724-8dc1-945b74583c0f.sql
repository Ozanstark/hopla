-- Add constraint to prevent submissions without session_id (for new scores)
-- First, let's add a check constraint to ensure session_id is provided for new scores
-- We'll use a trigger instead of check constraint for flexibility

CREATE OR REPLACE FUNCTION validate_game_score_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Require session_id for all new submissions
  IF NEW.session_id IS NULL OR NEW.session_id = '' THEN
    RAISE EXCEPTION 'Session ID is required for score submission';
  END IF;
  
  -- Prevent unreasonably high scores (above 10000 seems suspicious)
  IF NEW.score > 10000 THEN
    RAISE EXCEPTION 'Score too high: maximum allowed score is 10000';
  END IF;
  
  -- Prevent negative scores
  IF NEW.score < 0 THEN
    RAISE EXCEPTION 'Score cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for score validation
CREATE TRIGGER validate_game_score_before_insert
  BEFORE INSERT ON public.game_scores
  FOR EACH ROW
  EXECUTE FUNCTION validate_game_score_submission();

-- Delete the suspicious 1000 score from KorOglan that was clearly exploited
DELETE FROM public.game_scores 
WHERE player_name = 'KorOglan' AND score = 1000 AND session_id IS NULL;