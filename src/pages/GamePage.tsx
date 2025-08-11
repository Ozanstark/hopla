import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import Preloader from "@/infiniteRunner/scenes/Preloader";
import GameScene from "@/infiniteRunner/scenes/Game";
import GameOver from "@/infiniteRunner/scenes/GameOver";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
const GamePage = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    document.title = "Phaser Infinite Runner | Play";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Play the Phaser 3 infinite runner game in your browser.");
  }, []);
  useEffect(() => {
    if (gameRef.current || !parentRef.current) return;
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      backgroundColor: "#000000",
      physics: {
        default: "arcade",
        arcade: {
          gravity: {
            x: 0,
            y: 200
          }
        }
      },
      scene: [Preloader, GameScene, GameOver],
      scale: {
        parent: parentRef.current!,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 640
      }
    };
    gameRef.current = new Phaser.Game(config);
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);
  const [lastScore, setLastScore] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  type ScoreEntry = { name: string; score: number; date: number };
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);

const { toast } = useToast();

  const fetchTopScores = async () => {
    const { data, error } = await supabase
      .from('game_scores')
      .select('player_name, score, created_at')
      .order('score', { ascending: false })
      .limit(20);
    if (error) {
      console.error(error);
      toast({ title: 'Skorlar yüklenemedi', description: error.message, variant: 'destructive' });
      return;
    }
    setLeaderboard(
      (data ?? []).map((d: any) => ({
        name: d.player_name,
        score: d.score,
        date: new Date(d.created_at).getTime(),
      }))
    );
  };

  useEffect(() => {
    const savedName = localStorage.getItem('ir-player-name') || '';
    setPlayerName(savedName);
    fetchTopScores();
  }, []);

  useEffect(() => {
    const onGameOver = (e: Event) => {
      const detail = (e as CustomEvent<{
        score: number;
      }>).detail;
      setLastScore(detail?.score ?? 0);
      setIsDialogOpen(true);
    };
    window.addEventListener('infinite-runner:game-over', onGameOver as EventListener);
    return () => window.removeEventListener('infinite-runner:game-over', onGameOver as EventListener);
  }, []);

  const submitScore = async () => {
    const name = playerName.trim() || 'Misafir';
    localStorage.setItem('ir-player-name', name);
    try {
      const { error } = await supabase.from('game_scores').insert({ player_name: name, score: lastScore });
      if (error) throw error;
      toast({ title: 'Skor kaydedildi!', description: 'Tebrikler 🎉' });
      setIsDialogOpen(false);
      await fetchTopScores();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Skor kaydedilemedi', description: err.message ?? 'Bilinmeyen hata', variant: 'destructive' });
    }
  };
  const rockets = "🚀🚀🚀";
  const text = encodeURIComponent(`Hörikeynle 100 Milyona oyununda ${lastScore} skor aldım. ${rockets}\nLink:`);
  const url = encodeURIComponent(window.location.href);
  const shareHref = `https://x.com/intent/tweet?text=${text}&url=${url}&via=ozanstark`;
  return <main className="min-h-screen w-full bg-background">
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="font-pixel text-2xl md:text-4xl lg:text-5xl mb-4 text-center text-rainbow animate-rainbow">Hörikeyn'le 100 Milyona hopla</h1>
        <div className="grid gap-6 md:grid-cols-[1fr,320px] items-start">
          <div className="flex flex-col items-center">
            <div className="mb-3">
              <Button variant="secondary" asChild>
                <a href={shareHref} target="_blank" rel="noopener noreferrer" aria-label="X'te paylaş">
                  <Share2 /> X'te Paylaş
                </a>
              </Button>
            </div>
            <div ref={parentRef} className="w-full max-w-full aspect-[5/4] rounded-lg overflow-hidden border" aria-label="Game canvas" />
            <p className="text-sm text-muted-foreground mt-3">
              Powered by{' '}<a href="https://x.com/ozanstark" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">@ozanstark</a>
            </p>
          </div>
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3">Skorboard</h2>
            <ol className="space-y-2">
              {leaderboard.length === 0 ? (
                <li className="text-muted-foreground text-sm">Henüz skor yok.</li>
              ) : (
                leaderboard.map((e, i) => (
                  <li key={e.date} className="flex items-center justify-between">
                    <span className="text-muted-foreground w-6">{i + 1}.</span>
                    <span className="flex-1 mx-2 truncate">{e.name}</span>
                    <span className="font-medium">{e.score}</span>
                  </li>
                ))
              )}
            </ol>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skorun: {lastScore}</DialogTitle>
            <DialogDescription>İsmini gir ve skorboard’a kaydol.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="name">İsim</Label>
            <Input id="name" value={playerName} onChange={(e)=>setPlayerName(e.target.value)} placeholder="Adın" />
          </div>
          <DialogFooter>
            <Button onClick={submitScore}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>;
};
export default GamePage;