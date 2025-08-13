-- Delete all suspicious scores from abdullah that have null session_id
DELETE FROM public.game_scores 
WHERE player_name ILIKE '%abdullah%' AND session_id IS NULL;