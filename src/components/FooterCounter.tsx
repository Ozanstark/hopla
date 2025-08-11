import { useEffect, useState } from "react";

const STORAGE_KEY = "ir_total_visits";

export default function FooterCounter() {
  const [visits, setVisits] = useState<number>(0);

  useEffect(() => {
    try {
      const current = Number.parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) + 1;
      localStorage.setItem(STORAGE_KEY, String(current));
      setVisits(current);
    } catch {
      // no-op if storage unavailable
    }
  }, []);

  return (
    <footer className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <span className="text-xs text-muted-foreground">Ziyaret Sayaç</span>
        <span
          aria-label="Ziyaret sayısı"
          role="status"
          className="font-mono text-xl font-semibold tracking-tight text-foreground transition-transform duration-300"
        >
          {visits.toLocaleString("tr-TR")}
        </span>
      </div>
    </footer>
  );
}
