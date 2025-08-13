-- Lower validation limit to prevent 9999 score manipulation
CREATE OR REPLACE FUNCTION public.validate_game_score_submission()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Require session_id for all new submissions
  IF NEW.session_id IS NULL OR NEW.session_id = '' THEN
    RAISE EXCEPTION 'Session ID is required for score submission';
  END IF;
  
  -- Prevent unreasonably high scores (above 1000 is likely cheating for this game)
  IF NEW.score > 1000 THEN
    RAISE EXCEPTION 'Score too high: maximum allowed score is 1000';
  END IF;
  
  -- Prevent negative scores
  IF NEW.score < 0 THEN
    RAISE EXCEPTION 'Score cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$function$;