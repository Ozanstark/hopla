-- Delete KorOglan's fraudulent 9999 score
DELETE FROM public.game_scores 
WHERE player_name = 'KorOglan' AND score = 9999;

-- Create the missing validation trigger that should prevent high scores
CREATE TRIGGER validate_game_score_before_insert
  BEFORE INSERT ON public.game_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_game_score_submission();