import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuroraBackground } from "@/components/site/AuroraBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — TaskNova AI" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"admin" | "member">("member");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "", email: "", companyId: "", organization: "",
    password: "", confirm: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords don't match");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: form.fullName,
          company_id: form.companyId,
          organization_name: role === "admin" ? form.organization : undefined,
          role,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Account created!");
    navigate({ to: role === "admin" ? "/admin" : "/dashboard" });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <AuroraBackground />
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 text-[var(--neon-cyan)]" />
        <span className="text-gradient font-semibold">TaskNova AI</span>
      </Link>

      <div className="w-full max-w-md glass-strong rounded-3xl p-8 border-gradient animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Join the future of teamwork</p>

        <Tabs value={role} onValueChange={(v) => setRole(v as "admin" | "member")} className="mt-6">
          <TabsList className="grid grid-cols-2 w-full glass">
            <TabsTrigger value="member">Member</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSignup} className="mt-5 space-y-3">
            <div>
              <Label>Full Name</Label>
              <Input required className="mt-1.5 glass" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" required className="mt-1.5 glass" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <Label>Company ID</Label>
              <Input required placeholder="acme-corp" className="mt-1.5 glass" value={form.companyId} onChange={(e) => update("companyId", e.target.value)} />
            </div>
            <TabsContent value="admin" className="mt-0 p-0">
              <Label>Organization Name</Label>
              <Input required={role === "admin"} className="mt-1.5 glass" value={form.organization} onChange={(e) => update("organization", e.target.value)} />
            </TabsContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Password</Label>
                <Input type="password" required className="mt-1.5 glass" value={form.password} onChange={(e) => update("password", e.target.value)} />
              </div>
              <div>
                <Label>Confirm</Label>
                <Input type="password" required className="mt-1.5 glass" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background border-0 glow-cyan mt-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Create ${role} account`}
            </Button>
          </form>
        </Tabs>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-[var(--neon-cyan)] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
