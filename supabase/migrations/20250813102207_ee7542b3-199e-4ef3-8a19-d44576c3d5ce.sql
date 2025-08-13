-- Enable RLS on game_scores table
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Allow public read access to view all scores (for leaderboard)
CREATE POLICY "Anyone can view game scores" 
ON public.game_scores 
FOR SELECT 
USING (true);

-- Allow anyone to insert scores (no authentication required for game)
CREATE POLICY "Anyone can insert game scores" 
ON public.game_scores 
FOR INSERT 
WITH CHECK (true);