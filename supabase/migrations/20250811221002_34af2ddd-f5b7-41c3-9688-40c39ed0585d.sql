-- Add optional Twitter username column for scores
ALTER TABLE public.game_scores
  ADD COLUMN IF NOT EXISTS twitter_username text NULL;