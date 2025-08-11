-- Enable realtime on game_scores and add helpful index
-- Ensure full row data is captured for updates/inserts
ALTER TABLE public.game_scores REPLICA IDENTITY FULL;

-- Add table to the realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'game_scores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_scores;
  END IF;
END $$;

-- Create index to speed up top scores query
CREATE INDEX IF NOT EXISTS idx_game_scores_score_created_at 
  ON public.game_scores (score DESC, created_at DESC);
