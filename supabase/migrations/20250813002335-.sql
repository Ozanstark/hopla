-- Update any scoreboard entries showing 3232 to 141
UPDATE public.game_scores
SET score = 141, updated_at = now()
WHERE score = 3232;