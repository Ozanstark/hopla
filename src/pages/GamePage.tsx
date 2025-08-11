import { useEffect, useRef } from "react";
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
      width: 800,
      height: 640,
      parent: parentRef.current,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 200 },
        },
      },
      scene: [Preloader, GameScene, GameOver],
      backgroundColor: "#000000",
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const text = encodeURIComponent("Phaser 3 ile yapılmış Infinite Runner'ı oyna!");
  const url = encodeURIComponent(window.location.href);
  const shareHref = `https://x.com/intent/tweet?text=${text}&url=${url}`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Phaser Infinite Runner</h1>
      <p className="text-muted-foreground mb-4">Press SPACE to fly. Collect coins. Avoid lasers!</p>
      <div className="mb-6">
        <Button variant="secondary" asChild>
          <a href={shareHref} target="_blank" rel="noopener noreferrer" aria-label="X'te paylaş">
            <Share2 /> X'te Paylaş
          </a>
        </Button>
      </div>
      <div ref={parentRef} className="rounded-lg overflow-hidden border" aria-label="Game canvas" />
    </main>
  );
};

export default GamePage;
