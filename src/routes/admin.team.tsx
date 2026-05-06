import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/admin/team")({ component: TeamPage });

interface Member {
  id: string; full_name: string; email: string; productivity_score: number;
  xp: number; streak: number; profile_image: string | null;
}

function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("*").order("productivity_score", { ascending: false })
      .then(({ data }) => setMembers((data ?? []) as Member[]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground text-sm">{members.length} members.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m, idx) => (
          <div key={m.id} className="glass-strong rounded-2xl p-5 border-gradient flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] flex items-center justify-center text-background font-semibold">
              {m.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{m.full_name || "Unnamed"}</div>
              <div className="text-xs text-muted-foreground truncate">{m.email}</div>
              <div className="mt-1 flex items-center gap-3 text-xs">
                <span className="text-[var(--neon-cyan)]">XP {m.xp}</span>
                <span className="text-[var(--neon-pink)]">🔥 {m.streak}</span>
              </div>
            </div>
            {idx < 3 && <Trophy className={idx === 0 ? "text-[var(--neon-cyan)]" : idx === 1 ? "text-[var(--neon-violet)]" : "text-[var(--neon-pink)]"} />}
          </div>
        ))}
      </div>
    </div>
  );
}
