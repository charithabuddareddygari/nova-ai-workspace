import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CheckCircle2, Clock, AlertTriangle, Flame, Trophy, Zap, Inbox, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/")({ component: MemberOverview });

const TREND = Array.from({ length: 7 }, (_, i) => ({ d: ["M","T","W","T","F","S","S"][i], v: Math.round(2 + Math.random() * 8) }));

interface AssignedTask {
  id: string; title: string; description: string | null;
  status: string; priority: string; deadline: string | null; created_at: string;
}

function MemberOverview() {
  const { profile } = useAuth();
  const [counts, setCounts] = useState({ pending: 0, completed: 0, overdue: 0 });
  const [assigned, setAssigned] = useState<AssignedTask[]>([]);

  useEffect(() => {
    if (!profile) return;
    const loadCounts = () => Promise.all([
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("assigned_to", profile.id).neq("status", "completed"),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("assigned_to", profile.id).eq("status", "completed"),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("assigned_to", profile.id).lt("deadline", new Date().toISOString()).neq("status", "completed"),
    ]).then(([p, c, o]) => setCounts({ pending: p.count ?? 0, completed: c.count ?? 0, overdue: o.count ?? 0 }));

    const loadAssigned = () => supabase
      .from("tasks")
      .select("id,title,description,status,priority,deadline,created_at")
      .eq("assigned_to", profile.id)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => setAssigned((data ?? []) as AssignedTask[]));

    loadCounts();
    loadAssigned();

    const ch = supabase
      .channel("dashboard-assigned")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `assigned_to=eq.${profile.id}` },
        (payload) => {
          loadCounts();
          loadAssigned();
          if (payload.eventType === "INSERT") {
            const t = payload.new as AssignedTask;
            toast.success(`New task assigned: ${t.title}`);
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [profile]);

  const priorityColor: Record<string, string> = {
    low: "text-[var(--neon-green)]",
    medium: "text-[var(--neon-cyan)]",
    high: "text-[var(--neon-pink)]",
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hey {profile.fullName.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground text-sm">Here's your day at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Pending", v: counts.pending, c: Clock, color: "from-[var(--neon-cyan)] to-[var(--neon-violet)]" },
          { l: "Completed", v: counts.completed, c: CheckCircle2, color: "from-[var(--neon-green)] to-[var(--neon-cyan)]" },
          { l: "Overdue", v: counts.overdue, c: AlertTriangle, color: "from-[var(--neon-pink)] to-[var(--neon-violet)]" },
          { l: "Streak", v: profile.id ? "🔥 5" : 0, c: Flame, color: "from-[var(--neon-pink)] to-[var(--neon-cyan)]" },
        ].map((s, i) => (
          <div key={i} className="glass-strong rounded-2xl p-5 border-gradient relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-2xl`} />
            <s.c className="h-5 w-5 text-[var(--neon-cyan)]" />
            <div className="mt-4 text-3xl font-bold">{s.v}</div>
            <div className="text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-strong rounded-2xl p-6 border-gradient">
          <h3 className="font-semibold mb-3">Productivity (7d)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TREND}>
              <defs>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0.27 300)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.78 0.18 210)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" stroke="oklch(0.7 0.03 260)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270)", border: "1px solid oklch(0.97 0.01 250 / 0.1)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="v" stroke="oklch(0.65 0.27 300)" strokeWidth={2} fill="url(#memGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-strong rounded-2xl p-6 border-gradient">
          <div className="flex items-center gap-2 mb-2"><Trophy className="h-4 w-4 text-[var(--neon-cyan)]" /><h3 className="font-semibold">Level progress</h3></div>
          <div className="text-4xl font-bold text-gradient mt-3">Lvl 7</div>
          <div className="text-xs text-muted-foreground mt-1">{profile.id ? "1240 / 2000 XP" : "0 XP"}</div>
          <Progress value={62} className="mt-3 h-2" />
          <div className="mt-4 space-y-2">
            {[
              { i: Zap, t: "Speedrunner", d: "5 tasks in a day" },
              { i: Flame, t: "On fire", d: "5-day streak" },
            ].map((b) => (
              <div key={b.t} className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-sm">
                <b.i className="h-4 w-4 text-[var(--neon-cyan)]" />
                <div><div>{b.t}</div><div className="text-xs text-muted-foreground">{b.d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-strong rounded-2xl border-gradient overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-border/40">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-[var(--neon-cyan)]" />
            <h3 className="font-semibold">Assigned to you</h3>
            <span className="text-xs text-muted-foreground">({assigned.length})</span>
          </div>
          <Link to="/dashboard/tasks" className="text-xs text-[var(--neon-cyan)] hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {assigned.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No tasks assigned yet. When an admin assigns work to you, it will appear here in real-time.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {assigned.map((t) => {
              const overdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed";
              return (
                <div key={t.id} className="px-6 py-4 flex items-center gap-4 hover:bg-card/30 transition">
                  <div className={`text-[10px] uppercase font-semibold tracking-wider ${priorityColor[t.priority] ?? ""}`}>{t.priority}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{t.title}</div>
                    {t.description && <div className="text-xs text-muted-foreground truncate">{t.description}</div>}
                  </div>
                  <div className="text-xs px-2.5 py-1 rounded-full glass capitalize">{t.status.replace("_", " ")}</div>
                  {t.deadline && (
                    <div className={`text-xs ${overdue ? "text-[var(--neon-pink)]" : "text-muted-foreground"}`}>
                      {new Date(t.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
