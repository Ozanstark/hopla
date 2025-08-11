import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import Preloader from "@/infiniteRunner/scenes/Preloader";
import GameScene from "@/infiniteRunner/scenes/Game";
import GameOver from "@/infiniteRunner/scenes/GameOver";
import { Button } from "@/components/ui/button";
import { Share2, HelpCircle, Pause, Play, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
const [isPaused, setIsPaused] = useState(false);
const [isMuted, setIsMuted] = useState(false);
const [isHowToOpen, setIsHowToOpen] = useState(false);
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

  // UI click sfx helper
  const playClick = () => {
    try {
      const game = gameRef.current as any;
      game?.sound?.play?.('sfx-click', { volume: 0.4 });
    } catch {}
  };

  // Ses kapatma/açma oyun motoruna uygula
  useEffect(() => {
    const game = gameRef.current;
    if (game && (game as any).sound) {
      (game as any).sound.mute = isMuted;
    }
  }, [isMuted]);

  // Skorboard için realtime aboneliği
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_scores' }, () => {
        fetchTopScores();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
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
  const handlePauseToggle = () => {
    const game = gameRef.current;
    if (!game) return;
    const active = game.scene.isActive('game');
    if (active) {
      game.scene.pause('game');
      setIsPaused(true);
    } else {
      game.scene.resume('game');
      setIsPaused(false);
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
            <div className="mb-3 flex flex-wrap items-center gap-2 justify-center">
              <Button variant="secondary" asChild>
                <a href={shareHref} target="_blank" rel="noopener noreferrer" aria-label="X'te paylaş" onMouseDown={playClick}>
                  <Share2 /> X'te Paylaş
                </a>
              </Button>
              <Button variant="outline" onClick={() => { playClick(); handlePauseToggle(); }} aria-label={isPaused ? 'Devam et' : 'Duraklat'}>
                {isPaused ? <Play className="mr-1 h-4 w-4" /> : <Pause className="mr-1 h-4 w-4" />} {isPaused ? 'Devam' : 'Duraklat'}
              </Button>
              <div className="flex items-center gap-2">
                <Label htmlFor="mute">Sessiz</Label>
                <Switch id="mute" checked={isMuted} onCheckedChange={(v)=>{ playClick(); setIsMuted(v); }} aria-label="Sesi kapat/aç" />
              </div>
              <Button variant="outline" onClick={() => { playClick(); setIsHowToOpen(true); }} aria-label="Nasıl oynanır?">
                <HelpCircle className="mr-1 h-4 w-4" /> Nasıl oynanır?
              </Button>
            </div>
            <div ref={parentRef} className="relative w-full max-w-[960px] h-[60vh] max-h-[640px] rounded-lg overflow-hidden border mx-auto" aria-label="Game canvas" />
            <p className="text-sm text-muted-foreground mt-3">
              Powered by{' '}<a href="https://x.com/ozanstark" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">@ozanstark</a>
            </p>
          </div>
          <Card className="p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Skorboard
              </h2>
              {lastScore > 0 && (
                <Badge variant="secondary" aria-label="Son skor">Son skor: {lastScore}</Badge>
              )}
            </div>
            <ScrollArea className="h-80 pr-2">
              <ol className="space-y-2">
                {leaderboard.length === 0 ? (
                  <li className="text-muted-foreground text-sm">Henüz skor yok.</li>
                ) : (
                  leaderboard.map((e, i) => {
                    const rankClasses = i === 0
                      ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                      : i === 1
                      ? 'bg-secondary text-secondary-foreground'
                      : i === 2
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground';
                    return (
                      <li key={e.date} className="group flex items-center justify-between rounded-md border px-3 py-2 bg-card/50 hover:bg-accent/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-8 h-8 grid place-content-center rounded-full text-sm font-bold ${rankClasses}`}>{i + 1}</span>
                          <span className="truncate font-medium">{e.name}</span>
                        </div>
                        <span className="font-semibold tabular-nums">{e.score}</span>
                      </li>
                    );
                  })
                )}
              </ol>
            </ScrollArea>
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
            <Button onClick={() => { playClick(); submitScore(); }}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHowToOpen} onOpenChange={setIsHowToOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nasıl oynanır?</DialogTitle>
            <DialogDescription>Kontroller ve ipuçları</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>• Bilgisayar: Boşluk tuşuna basılı tutarak uç.</p>
            <p>• Mobil: Ekrana basılı tutarak uç.</p>
            <p>• Amaç: Coin topla, lazerlerden kaç.</p>
            <p>• Yeniden başlat: Oyun bitti ekranında ekrana dokun veya SPACE.</p>
            <p>• Duraklat: Üstteki Duraklat düğmesini kullan.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => { playClick(); setIsHowToOpen(false); }}>Tamam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>;
};
export default GamePage;