import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, Brain, Zap, Users, BarChart3, Shield, MessageSquare,
  Mic, Calendar, KanbanSquare, Bell, Cpu, ArrowRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import heroOrb from "@/assets/hero-orb.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskNova AI — The AI Workspace for Modern Teams" },
      { name: "description", content: "Jira + Notion + Slack + ChatGPT in one futuristic AI workspace. Ship faster with intelligent task automation, real-time collaboration, and predictive analytics." },
      { property: "og:title", content: "TaskNova AI — The AI Workspace for Modern Teams" },
      { property: "og:description", content: "An intelligent collaboration ecosystem powered by AI." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <AISection />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-36 pb-24 px-6">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-muted-foreground mb-6 animate-fade-in">
            <Sparkles className="h-3 w-3 text-[var(--neon-cyan)]" />
            Powered by next-gen AI · v2.0 just launched
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            The <span className="text-gradient">AI workspace</span><br />
            built for hyper-teams.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            TaskNova AI combines Jira, Notion, Slack, and ChatGPT into one futuristic platform.
            Plan, ship, and analyze with an autonomous AI co-pilot at your side.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background font-semibold border-0 glow-cyan group">
                Start free <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="glass">Watch demo</Button>
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-[var(--neon-green)]" /> No credit card</div>
            <div className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-[var(--neon-green)]" /> Free 14-day trial</div>
            <div className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-[var(--neon-green)]" /> Cancel anytime</div>
          </div>
        </div>
        <div className="relative animate-float">
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--neon-cyan)] to-[var(--neon-violet)] blur-3xl opacity-30 rounded-3xl" />
          <div className="relative glass-strong rounded-3xl p-2 border-gradient">
            <img src={heroOrb} alt="AI neural network" width={1536} height={1024} className="rounded-2xl w-full" />
          </div>
          <FloatingCard className="absolute -left-6 top-10" icon={<Brain className="h-4 w-4" />} title="AI suggested" value="Move 3 tasks" color="cyan" />
          <FloatingCard className="absolute -right-6 bottom-10" icon={<Zap className="h-4 w-4" />} title="Velocity" value="+24% this week" color="violet" />
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ className = "", icon, title, value, color }: { className?: string; icon: React.ReactNode; title: string; value: string; color: "cyan" | "violet" }) {
  return (
    <div className={`glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 ${color === "cyan" ? "glow-cyan" : "glow-violet"} ${className}`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${color === "cyan" ? "from-[var(--neon-cyan)] to-[var(--neon-violet)]" : "from-[var(--neon-violet)] to-[var(--neon-pink)]"} text-background`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function Stats() {
  const stats = [
    { v: "10M+", l: "Tasks completed" },
    { v: "94%", l: "AI accuracy" },
    { v: "5K+", l: "Teams onboard" },
    { v: "120+", l: "Countries" },
  ];
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-7xl glass-strong rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="text-4xl font-bold text-gradient">{s.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: KanbanSquare, title: "Smart Kanban", desc: "Drag-and-drop boards with AI auto-prioritization." },
    { icon: Brain, title: "AI Task Breakdown", desc: "Paste a goal, get subtasks, owners, and timelines." },
    { icon: BarChart3, title: "Predictive Analytics", desc: "Burnout detection and delay risk forecasting." },
    { icon: MessageSquare, title: "Real-time Chat", desc: "Live collaboration like Slack — built in." },
    { icon: Mic, title: "Voice Assistant", desc: "“Create project”, “Show overdue tasks” — done." },
    { icon: Calendar, title: "Timeline & Calendar", desc: "Cinematic gantt + calendar synced to your day." },
    { icon: Bell, title: "Smart Notifications", desc: "AI filters noise, surfaces what matters." },
    { icon: Shield, title: "Enterprise RBAC", desc: "Row-level security, SSO-ready, audit logs." },
  ];
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex glass rounded-full px-3 py-1 text-xs text-muted-foreground mb-4">Features</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything your team needs. <span className="text-gradient">Reimagined.</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((it) => (
            <div key={it.title} className="group glass rounded-2xl p-5 hover:bg-card transition-all hover:-translate-y-1 border-gradient">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--neon-cyan)]/20 to-[var(--neon-violet)]/20 text-[var(--neon-cyan)] group-hover:text-[var(--neon-violet)] transition">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{it.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AISection() {
  return (
    <section id="analytics" className="px-6 py-24">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
        <div className="glass-strong rounded-3xl p-8 border-gradient relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[var(--neon-violet)] opacity-20 blur-3xl" />
          <div className="space-y-3 relative">
            {[
              { i: Cpu, t: "Auto-assigning task to Sarah (best fit, 92% match)" },
              { i: Brain, t: "Detected burnout risk on Backend team" },
              { i: BarChart3, t: "Project Atlas delayed by 3 days — rebalancing" },
              { i: Users, t: "Generated weekly report and emailed to leads" },
            ].map((row, i) => (
              <div key={i} className="glass rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background">
                  <row.i className="h-4 w-4" />
                </div>
                <span className="text-sm">{row.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="inline-flex glass rounded-full px-3 py-1 text-xs text-muted-foreground mb-4">AI Engine</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">An autonomous co-pilot. <span className="text-gradient">Always on.</span></h2>
          <p className="mt-5 text-muted-foreground">
            TaskNova AI watches every project signal — workload, deadlines, sentiment — and acts.
            It assigns work to the right person, predicts delays before they happen, and writes
            your weekly report so you don't have to.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {["Smart workload balancing", "Burnout & mood detection", "AI meeting notes generator", "Auto-generated PDF reports"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--neon-green)]" />{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    { name: "Starter", price: "$0", desc: "For small teams getting started", features: ["Up to 5 members", "10 projects", "AI suggestions", "Community support"], cta: "Start free" },
    { name: "Pro", price: "$24", desc: "Per user / month — most popular", features: ["Unlimited projects", "Advanced AI automation", "Voice assistant", "Priority support"], cta: "Try Pro", featured: true },
    { name: "Enterprise", price: "Custom", desc: "Security, SSO, dedicated support", features: ["SSO + SAML", "Audit logs", "Dedicated CSM", "SLA 99.99%"], cta: "Contact us" },
  ];
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex glass rounded-full px-3 py-1 text-xs text-muted-foreground mb-4">Pricing</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Simple. <span className="text-gradient">Transparent.</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((t) => (
            <div key={t.name} className={`relative rounded-3xl p-7 ${t.featured ? "glass-strong border-gradient glow-violet" : "glass"}`}>
              {t.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background font-semibold">MOST POPULAR</div>}
              <h3 className="font-semibold text-lg">{t.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{t.price}</span>
                {t.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {t.features.map((f) => <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--neon-green)]" />{f}</li>)}
              </ul>
              <Link to="/signup" className="block mt-6">
                <Button className={`w-full ${t.featured ? "bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background border-0" : ""}`} variant={t.featured ? "default" : "outline"}>{t.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    { q: "How does the AI work?", a: "TaskNova AI uses next-generation language models to read project context, suggest assignees, predict delays, and write reports — all privately within your workspace." },
    { q: "Is my data secure?", a: "Yes. Row-level security, encrypted at rest and in transit, SSO-ready, and SOC2-aligned controls." },
    { q: "Can I import from Jira/Notion?", a: "Yes — one-click importers for Jira, Notion, Trello, Asana, and CSV." },
    { q: "Does it work offline?", a: "The desktop app supports limited offline editing with auto-sync when you reconnect." },
  ];
  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-4xl font-bold text-center">Frequently asked</h2>
        <div className="mt-10 space-y-3">
          {qs.map((it) => (
            <details key={it.q} className="group glass rounded-2xl p-5 cursor-pointer">
              <summary className="font-medium list-none flex justify-between items-center">{it.q}<span className="text-[var(--neon-cyan)] group-open:rotate-45 transition">+</span></summary>
              <p className="mt-3 text-sm text-muted-foreground">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl glass-strong rounded-3xl p-12 text-center border-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--neon-cyan)]/10 to-[var(--neon-violet)]/10" />
        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-bold">Build the future of work. <span className="text-gradient">Today.</span></h2>
          <p className="mt-4 text-muted-foreground">Join thousands of teams shipping faster with TaskNova AI.</p>
          <Link to="/signup" className="inline-block mt-8">
            <Button size="lg" className="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background border-0 glow-cyan">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
