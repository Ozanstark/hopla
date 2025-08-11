import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

const Index = () => {
  useEffect(() => {
    document.title = "Infinite Runner | Arcade Game";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Play an Infinite Runner built with Phaser 3 and TypeScript.");
  }, []);

  const text = encodeURIComponent("Phaser 3 ile yapılmış Infinite Runner'ı oyna!");
  const url = encodeURIComponent(window.location.origin + "/game");
  const shareHref = `https://x.com/intent/tweet?text=${text}&url=${url}`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Infinite Runner Game</h1>
        <p className="text-lg text-muted-foreground">Fast-paced arcade fun. Press SPACE to fly, collect coins, avoid lasers.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/game">
            <Button size="lg">Play Now</Button>
          </Link>
          <Button variant="secondary" size="lg" asChild>
            <a href={shareHref} target="_blank" rel="noopener noreferrer" aria-label="X'te paylaş">
              <Share2 /> X'te Paylaş
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Index;
