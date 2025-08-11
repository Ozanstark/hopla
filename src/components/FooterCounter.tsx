import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const COUNTER_KEY = "global";
const SESSION_KEY = "ir_session_incremented";

export default function FooterCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function updateCounter() {
      try {
        const already = sessionStorage.getItem(SESSION_KEY);
        const { data, error } = await supabase.rpc("increment_counter", {
          counter_key: COUNTER_KEY,
          delta: already ? 0 : 1,
        });
        if (cancelled) return;
        if (error) {
          console.error("Global counter RPC error", error);
          setCount(224);
          return;
        }
        setCount((data as number) ?? 224);
        if (!already) sessionStorage.setItem(SESSION_KEY, "1");
      } catch (e) {
        console.error(e);
        setCount(224);
      }
    }

    updateCounter();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <span className="text-xs text-muted-foreground">Toplam Ziyaret</span>
        <span
          aria-label="Ziyaret sayısı"
          role="status"
          className="font-mono text-xl font-semibold tracking-tight text-foreground"
        >
          {count === null ? "…" : count.toLocaleString("tr-TR")}
        </span>
      </div>
    </footer>
  );
}

