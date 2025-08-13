-- Update the validation function to check session_id timestamp
CREATE OR REPLACE FUNCTION public.validate_game_score_submission()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  session_timestamp bigint;
  current_timestamp_ms bigint;
  time_diff_hours numeric;
BEGIN
  -- Require session_id for all new submissions
  IF NEW.session_id IS NULL OR NEW.session_id = '' THEN
    RAISE EXCEPTION 'Session ID is required for score submission';
  END IF;
  
  -- Extract timestamp from session_id (format: "timestamp-randomstring")
  BEGIN
    session_timestamp := split_part(NEW.session_id, '-', 1)::bigint;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid session_id format';
  END;
  
  -- Get current timestamp in milliseconds
  current_timestamp_ms := extract(epoch from now()) * 1000;
  
  -- Calculate time difference in hours
  time_diff_hours := (current_timestamp_ms - session_timestamp) / (1000.0 * 60 * 60);
  
  -- Session must be from within the last 24 hours and not from the future
  IF time_diff_hours > 24 OR time_diff_hours < -1 THEN
    RAISE EXCEPTION 'Session timestamp is invalid: session must be from within the last 24 hours';
  END IF;
  
  -- Prevent unreasonably high scores (lowered from 10000 to 1000)
  IF NEW.score > 1000 THEN
    RAISE EXCEPTION 'Score too high: maximum allowed score is 1000';
  END IF;
  
  -- Prevent negative scores
  IF NEW.score < 0 THEN
    RAISE EXCEPTION 'Score cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$function$