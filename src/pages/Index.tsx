import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  useEffect(() => {
    document.title = "Infinite Runner | Arcade Game";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Play an Infinite Runner built with Phaser 3 and TypeScript.");
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Infinite Runner Game</h1>
        <p className="text-lg text-muted-foreground">Fast-paced arcade fun. Press SPACE to fly, collect coins, avoid lasers.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/game">
            <Button size="lg">Play Now</Button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Index;
