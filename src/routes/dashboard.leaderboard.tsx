import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Flame } from "lucide-react";

export const Route = createFileRoute("/dashboard/leaderboard")({ component: Leaderboard });

interface Row { id: string; full_name: string; xp: number; streak: number; productivity_score: number; }

function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("id,full_name,xp,streak,productivity_score")
      .order("xp", { ascending: false }).limit(20)
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground text-sm">Top performers this season.</p>
      </div>
      <div className="glass-strong rounded-2xl border-gradient overflow-hidden">
        {rows.map((r, i) => (
          <div key={r.id} className={`px-5 py-4 flex items-center gap-4 ${i < rows.length - 1 ? "border-b border-border/40" : ""}`}>
            <div className={`text-lg font-bold w-8 ${i === 0 ? "text-[var(--neon-cyan)]" : i === 1 ? "text-[var(--neon-violet)]" : i === 2 ? "text-[var(--neon-pink)]" : "text-muted-foreground"}`}>
              {i + 1}
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] flex items-center justify-center text-background font-semibold text-sm">
              {r.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{r.full_name || "Unnamed"}</div>
            </div>
            <div className="flex items-center gap-1 text-sm text-[var(--neon-pink)]"><Flame className="h-4 w-4" />{r.streak}</div>
            <div className="text-sm font-semibold text-[var(--neon-cyan)] w-16 text-right">{r.xp} XP</div>
            {i === 0 && <Trophy className="h-5 w-5 text-[var(--neon-cyan)]" />}
          </div>
        ))}
      </div>
    </div>
  );
}
