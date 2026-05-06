import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, FolderKanban, CheckCircle2, Clock, AlertTriangle, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

const AREA = [
  { d: "Mon", v: 12 }, { d: "Tue", v: 18 }, { d: "Wed", v: 15 },
  { d: "Thu", v: 25 }, { d: "Fri", v: 32 }, { d: "Sat", v: 22 }, { d: "Sun", v: 28 },
];
const PIE_COLORS = ["oklch(0.78 0.18 210)", "oklch(0.65 0.27 300)", "oklch(0.72 0.27 350)", "oklch(0.85 0.2 155)"];

function AdminOverview() {
  const [counts, setCounts] = useState({ projects: 0, tasks: 0, completed: 0, members: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("tasks").select("id", { count: "exact", head: true }),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]).then(([p, t, c, m]) => setCounts({
      projects: p.count ?? 0, tasks: t.count ?? 0, completed: c.count ?? 0, members: m.count ?? 0,
    }));
  }, []);

  const cards = [
    { label: "Projects", value: counts.projects, icon: FolderKanban, color: "from-[var(--neon-cyan)] to-[var(--neon-violet)]" },
    { label: "Tasks", value: counts.tasks, icon: CheckCircle2, color: "from-[var(--neon-violet)] to-[var(--neon-pink)]" },
    { label: "Completed", value: counts.completed, icon: TrendingUp, color: "from-[var(--neon-green)] to-[var(--neon-cyan)]" },
    { label: "Team", value: counts.members, icon: Users, color: "from-[var(--neon-pink)] to-[var(--neon-violet)]" },
  ];

  const status = [
    { name: "Pending", value: Math.max(counts.tasks - counts.completed, 1) },
    { name: "Completed", value: counts.completed || 1 },
    { name: "Review", value: 3 },
    { name: "Overdue", value: 1 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
        <p className="text-muted-foreground text-sm">Real-time overview of your AI-powered organization.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="glass-strong rounded-2xl p-5 border-gradient relative overflow-hidden hover:-translate-y-0.5 transition">
            <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl`} />
            <c.icon className="h-5 w-5 text-[var(--neon-cyan)]" />
            <div className="mt-4 text-3xl font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-strong rounded-2xl p-6 border-gradient">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Productivity trend</h3>
              <p className="text-xs text-muted-foreground">Tasks completed this week</p>
            </div>
            <div className="text-xs text-[var(--neon-green)] flex items-center gap-1"><TrendingUp className="h-3 w-3" />+24%</div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={AREA}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.18 210)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.65 0.27 300)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" stroke="oklch(0.7 0.03 260)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270)", border: "1px solid oklch(0.97 0.01 250 / 0.1)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="v" stroke="oklch(0.78 0.18 210)" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-strong rounded-2xl p-6 border-gradient">
          <h3 className="font-semibold">Task status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={status} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {status.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270)", border: "1px solid oklch(0.97 0.01 250 / 0.1)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {status.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i] }} />{s.name}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-6 border-gradient">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-[var(--neon-cyan)]" />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <div className="space-y-2 text-sm">
          {[
            { t: "Project Atlas may slip 2 days — reassign 1 task to Daniel", c: AlertTriangle, color: "text-[var(--neon-pink)]" },
            { t: "3 team members consistently over capacity — consider hiring", c: Clock, color: "text-[var(--neon-cyan)]" },
            { t: "Velocity up 24% week-over-week — share with stakeholders", c: TrendingUp, color: "text-[var(--neon-green)]" },
          ].map((i, idx) => (
            <div key={idx} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <i.c className={`h-4 w-4 ${i.color}`} /> {i.t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
