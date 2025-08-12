import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import Preloader from "@/infiniteRunner/scenes/Preloader";
import GameScene from "@/infiniteRunner/scenes/Game";
import GameOver from "@/infiniteRunner/scenes/GameOver";
import { Button } from "@/components/ui/button";
import { Share2, HelpCircle, Pause, Play, Trophy, Smartphone, Maximize, Minimize } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import usePWAInstall from "@/hooks/usePWAInstall";
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
  const [lastDialogScore, setLastDialogScore] = useState<number>(-1);
  const [playerName, setPlayerName] = useState("");
type ScoreEntry = { name: string; score: number; date: number; twitterUsername?: string };
const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
const [isPaused, setIsPaused] = useState(false);
const [isMuted, setIsMuted] = useState(false);
const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement);
const [reduceMotion, setReduceMotion] = useState<boolean>(false);
const [isHowToOpen, setIsHowToOpen] = useState(false);
const { toast } = useToast();
const [twitterUsername, setTwitterUsername] = useState("");
const { canInstall, promptInstall } = usePWAInstall();
const [period, setPeriod] = useState<"all" | "today">("all");
  const fetchTopScores = async () => {
    let query = supabase
      .from('game_scores')
      .select('player_name, score, created_at, twitter_username')
      .order('score', { ascending: false })
      .limit(20);

    if (period === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      query = query.gte('created_at', start.toISOString());
    }

    const { data, error } = await query;
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
        twitterUsername: d.twitter_username || undefined,
      }))
    );
  };

  useEffect(() => {
    const savedName = localStorage.getItem('ir-player-name') || '';
    setPlayerName(savedName);
    const savedTw = localStorage.getItem('ir-twitter-username') || '';
    setTwitterUsername(savedTw);
    fetchTopScores();

    // Init reduce motion + fullscreen listener
    const saved = localStorage.getItem('ir-reduce-motion') === '1';
    setReduceMotion(saved);
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, []);

  // Refetch when period changes
  useEffect(() => { fetchTopScores(); }, [period]);

  useEffect(() => {
    const onGameOver = (e: Event) => {
      const detail = (e as CustomEvent<{ score: number }>).detail;
      const score = detail?.score ?? 0;
      setLastScore(score);
      // Open only once per score to avoid reopen loops
      setLastDialogScore((prev) => {
        if (prev !== score) {
          setIsDialogOpen(true);
          const best = Number(localStorage.getItem('ir-best-score') || '0');
          if (score > best) {
            localStorage.setItem('ir-best-score', String(score));
            try { fireConfetti(); } catch {}
            toast({ title: 'Yeni rekor! 🎉', description: `Skor: ${score}` });
          }
          return score;
        }
        return prev;
      });
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

  const sanitizeTwitter = (raw: string) => {
    const v = (raw || '').trim();
    // Extract from URL if provided
    const urlMatch = v.match(/(?:twitter|x)\.com\/(?:#!\/)?@?([A-Za-z0-9_]{1,15})/i);
    let handle = urlMatch ? urlMatch[1] : v.replace(/^@/, '');
    handle = handle.replace(/[^A-Za-z0-9_]/g, '').slice(0, 15);
    return handle;
  };

  const submitScore = async () => {
    const name = playerName.trim() || 'Misafir';
    const handle = sanitizeTwitter(twitterUsername);
    localStorage.setItem('ir-player-name', name);
    localStorage.setItem('ir-twitter-username', handle);
    try {
      const payload: any = { player_name: name, score: lastScore, twitter_username: handle || null };
      const { error } = await supabase.from('game_scores').insert(payload as any);
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

  const getShareText = () => `Hörikeyn'le 100 Milyona oyununda ${lastScore} skor aldım. 🚀🚀🚀`;
  const handleShare = async () => {
    try {
      const canvas = parentRef.current?.querySelector('canvas');
      const shareText = `${getShareText()}\n${window.location.href}`;
      if (!canvas) {
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&via=ozanstark`, '_blank');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'score.png', { type: 'image/png' });
      const navAny = navigator as any;
      if (navAny.canShare && navAny.canShare({ files: [file] })) {
        await navAny.share({ files: [file], title: 'Hörikeyn Oyun Skorum', text: getShareText() });
      } else if (navigator.share) {
        await navigator.share({ title: 'Hörikeyn Oyun Skorum', text: shareText });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'score.png';
        a.click();
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&via=ozanstark`, '_blank');
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Paylaşım başarısız', description: 'Tarayıcın paylaşımı desteklemiyor olabilir.', variant: 'destructive' });
    }
  };

  const toggleFullscreen = async () => {
    playClick();
    try {
      if (!document.fullscreenElement) {
        await parentRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  };

  const handleReduceMotion = (v: boolean) => {
    playClick();
    setReduceMotion(v);
    localStorage.setItem('ir-reduce-motion', v ? '1' : '0');
    window.dispatchEvent(new CustomEvent('ir:reduce-motion-change', { detail: v }));
  };

  async function fireConfetti() {
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } catch {}
  }
  return <main className="min-h-screen w-full bg-background">
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="font-pixel text-2xl md:text-4xl lg:text-5xl mb-4 text-center text-rainbow animate-rainbow">Hörikeyn'le 100 Milyona hopla</h1>
        <div className="grid gap-6 md:grid-cols-[1fr,320px] items-start">
          <div className="flex flex-col items-center">
            <div className="mb-3 flex flex-wrap items-center gap-2 justify-center">
              {canInstall && (
                <Button variant="secondary" onClick={() => { playClick(); promptInstall(); }} aria-label="Uygulamayı yükle">
                  <Smartphone className="mr-1 h-4 w-4" /> Yükle
                </Button>
              )}
              <Button variant="secondary" onClick={() => { playClick(); handleShare(); }} aria-label="Paylaş">
                <Share2 className="mr-1 h-4 w-4" /> Paylaş
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  playClick();
                  try {
                    if (!document.fullscreenElement) {
                      await parentRef.current?.requestFullscreen?.();
                    } else {
                      await document.exitFullscreen();
                    }
                  } catch {}
                }}
                aria-label={isFullscreen ? 'Tam ekrandan çık' : 'Tam ekran'}
              >
                {isFullscreen ? <Minimize className="mr-1 h-4 w-4" /> : <Maximize className="mr-1 h-4 w-4" />} {isFullscreen ? 'Çık' : 'Tam ekran'}
              </Button>
              <Button variant="outline" onClick={() => { playClick(); handlePauseToggle(); }} aria-label={isPaused ? 'Devam et' : 'Duraklat'}>
                {isPaused ? <Play className="mr-1 h-4 w-4" /> : <Pause className="mr-1 h-4 w-4" />} {isPaused ? 'Devam' : 'Duraklat'}
              </Button>
              <div className="flex items-center gap-2">
                <Label htmlFor="mute">Sessiz</Label>
                <Switch id="mute" checked={isMuted} onCheckedChange={(v)=>{ playClick(); setIsMuted(v); }} aria-label="Sesi kapat/aç" />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="rm">Azaltılmış hareket</Label>
                <Switch id="rm" checked={reduceMotion} onCheckedChange={handleReduceMotion} aria-label="Hareket efektlerini azalt" />
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Skorboard
              </h2>
              <div className="flex items-center gap-3">
                <ToggleGroup type="single" value={period} onValueChange={(v) => setPeriod((v as "all" | "today") || "all")} className="rounded-lg bg-muted/40 p-1">
                  <ToggleGroupItem value="all" className="px-3 py-1.5 rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground">Tümü</ToggleGroupItem>
                  <ToggleGroupItem value="today" className="px-3 py-1.5 rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground">Bugün</ToggleGroupItem>
                </ToggleGroup>
                {lastScore > 0 && (
                  <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    Son skor: <span className="font-semibold text-foreground">{lastScore}</span>
                  </div>
                )}
              </div>
            </div>
            <ScrollArea className="h-80 pr-2">
              <ol className="space-y-2">
                {leaderboard.length === 0 ? (
                  <li className="text-muted-foreground text-sm">Henüz skor yok.</li>
                ) : (
                  leaderboard.map((e, i) => {
                    const rankBg = i === 0
                      ? 'bg-[hsl(var(--gold)/.22)] text-[hsl(var(--gold))]'
                      : i === 1
                      ? 'bg-[hsl(var(--silver)/.22)] text-[hsl(var(--silver))]'
                      : i === 2
                      ? 'bg-[hsl(var(--bronze)/.22)] text-[hsl(var(--bronze))]'
                      : 'bg-muted text-muted-foreground';
                    const rowBg = i === 0
                      ? 'bg-[linear-gradient(to_right,hsl(var(--gold)/.14),transparent)]'
                      : i === 1
                      ? 'bg-[linear-gradient(to_right,hsl(var(--silver)/.14),transparent)]'
                      : i === 2
                      ? 'bg-[linear-gradient(to_right,hsl(var(--bronze)/.14),transparent)]'
                      : 'bg-card/70';
                    const scoreColor = i < 3 ? 'text-foreground' : 'text-foreground';
                    return (
                      <li
                        key={e.date}
                        className={`group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border px-4 py-3 ${rowBg} hover:bg-accent/30 transition-colors animate-fade-in shadow-sm hover:shadow`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-8 h-8 grid place-content-center rounded-full text-sm font-bold ring-1 ring-border ${rankBg}`}>{i + 1}</span>
                          <div className="min-w-0 flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate font-semibold text-foreground max-w-[140px] sm:max-w-[200px]">{e.name}</span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">{e.name}</p>
                              </TooltipContent>
                            </Tooltip>
                            {e.twitterUsername && (
                              <a
                                href={`https://x.com/${e.twitterUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:underline"
                                aria-label={`${e.name} Twitter profili`}
                              >
                                @{e.twitterUsername}
                              </a>
                            )}
                          </div>
                        </div>
                        <span className={`font-extrabold tabular-nums ${scoreColor} text-lg leading-none tracking-tight ml-auto pl-2 shrink-0`}>{e.score}</span>
                      </li>
                    );
                  })
                )}
              </ol>
            </ScrollArea>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open)=>{ setIsDialogOpen(open); if (!open) setLastDialogScore(lastScore); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skorun: {lastScore}</DialogTitle>
            <DialogDescription>İsmini gir ve skorboard’a kaydol.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="name">İsim</Label>
            <Input id="name" value={playerName} onChange={(e)=>setPlayerName(e.target.value)} placeholder="Adın" />
          </div>
          <div className="grid gap-2 py-2">
            <Label htmlFor="twitter">Twitter kullanıcı adı (opsiyonel)</Label>
            <Input id="twitter" value={twitterUsername} onChange={(e)=>setTwitterUsername(e.target.value)} placeholder="@kullaniciadi" />
            <p className="text-xs text-muted-foreground">Sadece kullanıcı adı yeterli; @ veya x.com/… yazdıysan otomatik temizleriz.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { playClick(); setIsDialogOpen(false); setLastDialogScore(lastScore); }}>Daha sonra</Button>
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