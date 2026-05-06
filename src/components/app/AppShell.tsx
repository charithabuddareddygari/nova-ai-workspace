import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users, BarChart3,
  Bot, Sparkles, LogOut, Bell, Trophy,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { Button } from "@/components/ui/button";

export function AppShell({ role }: { role: "admin" | "member" }) {
  const { profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading && !profile) navigate({ to: "/login" });
    else if (!loading && profile && profile.role !== role) {
      navigate({ to: profile.role === "admin" ? "/admin" : "/dashboard" });
    }
  }, [loading, profile, role, navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--neon-cyan)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const adminNav = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/projects", label: "Projects", icon: FolderKanban },
    { to: "/admin/tasks", label: "Tasks", icon: CheckSquare },
    { to: "/admin/team", label: "Team", icon: Users },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/ai", label: "AI Assistant", icon: Bot },
  ];
  const memberNav = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/tasks", label: "My Tasks", icon: CheckSquare },
    { to: "/dashboard/board", label: "Kanban", icon: FolderKanban },
    { to: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/dashboard/ai", label: "AI Assistant", icon: Bot },
  ];
  const nav = role === "admin" ? adminNav : memberNav;

  return (
    <div className="relative min-h-screen flex">
      <AuroraBackground />

      <aside className="hidden lg:flex w-64 flex-col glass-strong border-r border-border/50 p-4 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] glow-cyan">
            <Sparkles className="h-4 w-4 text-background" />
          </span>
          <span className="text-gradient font-semibold">TaskNova AI</span>
        </Link>

        <nav className="mt-6 space-y-1 flex-1">
          {nav.map((it) => {
            const active = loc.pathname === it.to;
            return (
              <Link key={it.to} to={it.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? "bg-gradient-to-r from-[var(--neon-cyan)]/20 to-[var(--neon-violet)]/20 text-foreground border border-[var(--neon-cyan)]/30 glow-cyan" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}>
                <it.icon className="h-4 w-4" />{it.label}
              </Link>
            );
          })}
        </nav>

        <div className="glass rounded-2xl p-3 mt-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] flex items-center justify-center text-background font-semibold text-sm">
              {profile.fullName.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{profile.fullName}</div>
              <div className="text-xs text-muted-foreground capitalize">{profile.role}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 glass-strong border-b border-border/50 px-6 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{profile.organizationName || profile.companyId}</div>
            <div className="text-sm font-medium capitalize">{role} workspace</div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost"><Bell className="h-4 w-4" /></Button>
          </div>
        </header>
        <div className="p-6"><Outlet /></div>
      </main>
    </div>
  );
}
