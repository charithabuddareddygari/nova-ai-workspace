import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — TaskNova AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).maybeSingle();
      toast.success("Welcome back!");
      navigate({ to: r?.role === "admin" ? "/admin" : "/dashboard" });
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <AuroraBackground />
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 text-[var(--neon-cyan)]" />
        <span className="text-gradient font-semibold">TaskNova AI</span>
      </Link>

      <div className="w-full max-w-md glass-strong rounded-3xl p-8 border-gradient animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your AI workspace</p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 glass" placeholder="you@company.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 glass" placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background border-0 glow-cyan">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/signup" className="text-[var(--neon-cyan)] hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
