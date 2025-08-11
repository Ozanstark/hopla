import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import Preloader from "@/infiniteRunner/scenes/Preloader";
import GameScene from "@/infiniteRunner/scenes/Game";
import GameOver from "@/infiniteRunner/scenes/GameOver";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
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
  useEffect(() => {
    const onGameOver = (e: Event) => {
      const detail = (e as CustomEvent<{
        score: number;
      }>).detail;
      setLastScore(detail?.score ?? 0);
    };
    window.addEventListener('infinite-runner:game-over', onGameOver as EventListener);
    return () => window.removeEventListener('infinite-runner:game-over', onGameOver as EventListener);
  }, []);
  const rockets = "🚀🚀🚀";
  const text = encodeURIComponent(`Hörikeynle 100 Milyona oyununda ${lastScore} skor aldım. ${rockets}\nLink:`);
  const url = encodeURIComponent(window.location.href);
  const shareHref = `https://x.com/intent/tweet?text=${text}&url=${url}&via=ozanstark`;
  return <main className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Hörikeyn'le    100   Milyona   hopla</h1>
      
      <div className="mb-3">
        <Button variant="secondary" asChild>
          <a href={shareHref} target="_blank" rel="noopener noreferrer" aria-label="X'te paylaş">
            <Share2 /> X'te Paylaş
          </a>
        </Button>
      </div>
      <div ref={parentRef} className="w-full max-w-screen-md aspect-[5/4] rounded-lg overflow-hidden border" aria-label="Game canvas" />
      <p className="text-sm text-muted-foreground mt-3">
        Powered by{' '}<a href="https://x.com/ozanstark" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">@ozanstark</a>
      </p>
    </main>;
};
export default GamePage;