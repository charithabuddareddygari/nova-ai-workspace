import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";

export const Route = createFileRoute("/admin/analytics")({ component: AnalyticsPage });

const team = [
  { n: "Alex", v: 28 }, { n: "Sarah", v: 34 }, { n: "Daniel", v: 19 },
  { n: "Mia", v: 41 }, { n: "Leo", v: 22 }, { n: "Zoe", v: 30 },
];
const trend = Array.from({ length: 14 }, (_, i) => ({ d: `D${i + 1}`, v: Math.round(20 + Math.sin(i / 2) * 10 + Math.random() * 6) }));

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">Performance insights and predictions.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-strong rounded-2xl p-6 border-gradient">
          <h3 className="font-semibold mb-3">Team output</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={team}>
              <XAxis dataKey="n" stroke="oklch(0.7 0.03 260)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270)", border: "1px solid oklch(0.97 0.01 250 / 0.1)", borderRadius: 12 }} />
              <Bar dataKey="v" fill="oklch(0.78 0.18 210)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-strong rounded-2xl p-6 border-gradient">
          <h3 className="font-semibold mb-3">Velocity (14d)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <XAxis dataKey="d" stroke="oklch(0.7 0.03 260)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270)", border: "1px solid oklch(0.97 0.01 250 / 0.1)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="v" stroke="oklch(0.65 0.27 300)" strokeWidth={2.5} dot={{ fill: "oklch(0.78 0.18 210)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
