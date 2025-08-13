-- Add session_id column to game_scores table for duplicate prevention
ALTER TABLE public.game_scores 
ADD COLUMN session_id TEXT;

-- Create unique index to prevent duplicate scores from same session
CREATE UNIQUE INDEX idx_game_scores_unique_session 
ON public.game_scores (session_id) 
WHERE session_id IS NOT NULL;