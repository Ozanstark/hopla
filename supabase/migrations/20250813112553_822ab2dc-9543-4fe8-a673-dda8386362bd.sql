-- Delete KorOglan's fraudulent 9999 score
DELETE FROM public.game_scores 
WHERE player_name = 'KorOglan' AND score = 9999;