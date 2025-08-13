-- Update KorOglan's score from 999 to 99
UPDATE public.game_scores
SET score = 99, updated_at = now()
WHERE player_name = 'KorOglan' AND score = 999;