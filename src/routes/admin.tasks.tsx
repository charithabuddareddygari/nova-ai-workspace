import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Loader2, Sparkles, Search, Mail, Activity, Zap, CheckCircle2, Sparkle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tasks")({
  component: TasksPage,
});

interface Task {
  id: string; title: string; description: string | null;
  status: string; priority: string; deadline: string | null;
}
interface Member {
  id: string;
  full_name: string;
  email: string;
  profile_image: string | null;
  productivity_score: number;
  role: "admin" | "member";
  activeTasks: number;
  completedTasks: number;
  workload: number;
  online: boolean;
}
interface Project { id: string; title: string; }

function TasksPage() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium", projectId: "",
    assignedTo: "", deadline: "",
  });

  async function load() {
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("id,title"),
    ]);
    setTasks((t ?? []) as Task[]);
    setProjects((p ?? []) as Project[]);
  }

  async function loadMembers() {
    if (!profile) return;
    setMembersLoading(true);
    try {
      const { data: profs, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, profile_image, productivity_score, updated_at")
        .eq("company_id", profile.companyId);
      if (pErr) throw pErr;
      const ids = (profs ?? []).map((p) => p.id);
      if (ids.length === 0) { setMembers([]); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", ids);
      const roleMap = new Map((roles ?? []).map((r: any) => [r.user_id, r.role]));

      const { data: allTasks } = await supabase
        .from("tasks")
        .select("assigned_to, status")
        .in("assigned_to", ids);
      const taskAgg = new Map<string, { active: number; done: number }>();
      (allTasks ?? []).forEach((t: any) => {
        if (!t.assigned_to) return;
        const cur = taskAgg.get(t.assigned_to) ?? { active: 0, done: 0 };
        if (t.status === "completed") cur.done += 1; else cur.active += 1;
        taskAgg.set(t.assigned_to, cur);
      });
      const maxActive = Math.max(1, ...Array.from(taskAgg.values()).map((v) => v.active));

      const enriched: Member[] = (profs ?? [])
        .map((p: any) => {
          const agg = taskAgg.get(p.id) ?? { active: 0, done: 0 };
          const updated = p.updated_at ? new Date(p.updated_at).getTime() : 0;
          return {
            id: p.id,
            full_name: p.full_name || "Unnamed",
            email: p.email,
            profile_image: p.profile_image,
            productivity_score: p.productivity_score ?? 0,
            role: (roleMap.get(p.id) as "admin" | "member") ?? "member",
            activeTasks: agg.active,
            completedTasks: agg.done,
            workload: Math.round((agg.active / maxActive) * 100),
            online: Date.now() - updated < 5 * 60 * 1000,
          };
        })
        .filter((m) => m.role === "member")
        .sort((a, b) => a.workload - b.workload);

      setMembers(enriched);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { if (open) loadMembers(); }, [open, profile?.companyId]);

  const filteredMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      m.full_name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }, [members, memberQuery]);

  const aiSuggestedId = useMemo(() => {
    if (members.length === 0) return null;
    return [...members].sort((a, b) =>
      (a.workload - b.workload) || (b.productivity_score - a.productivity_score),
    )[0]?.id ?? null;
  }, [members]);

  async function aiBreakdown() {
    if (!form.title) return toast.error("Add a title first");
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { prompt: `Break down this task into a clear description with 3-5 actionable subtasks:\n${form.title}`, mode: "breakdown" },
      });
      if (error) throw error;
      if (data?.text) setForm((f) => ({ ...f, description: data.text }));
      toast.success("AI generated breakdown");
    } catch (e: any) {
      toast.error(e.message ?? "AI failed");
    } finally { setAiLoading(false); }
  }

  async function create() {
    if (!profile || !form.title) return;
    if (!form.assignedTo) return toast.error("Pick a member to assign");
    setCreating(true);
    const { data: inserted, error } = await supabase.from("tasks").insert({
      title: form.title, description: form.description || null,
      priority: form.priority, project_id: form.projectId || null,
      assigned_to: form.assignedTo, deadline: form.deadline || null,
      company_id: profile.companyId, created_by: profile.id,
    }).select().single();
    if (error) { setCreating(false); return toast.error(error.message); }

    // Notify assignee in-app
    await supabase.from("notifications").insert({
      user_id: form.assignedTo,
      message: `New task assigned: ${form.title}`,
      type: "task_assigned",
    } as any);

    setCreating(false);
    toast.success("Task assigned"); setOpen(false);
    setForm({ title: "", description: "", priority: "medium", projectId: "", assignedTo: "", deadline: "" });
    setMemberQuery("");
    load();
  }

  const priorityColor: Record<string, string> = {
    low: "text-[var(--neon-green)]", medium: "text-[var(--neon-cyan)]", high: "text-[var(--neon-pink)]",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm">All work across the organization.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background border-0 glow-cyan">
              <Plus className="h-4 w-4 mr-1" /> Assign Task
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Assign new task</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 glass" /></div>
              <div>
                <div className="flex justify-between items-center">
                  <Label>Description</Label>
                  <Button size="sm" variant="ghost" onClick={aiBreakdown} disabled={aiLoading} className="text-[var(--neon-cyan)] h-7">
                    {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Sparkles className="h-3 w-3 mr-1" />AI breakdown</>}
                  </Button>
                </div>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 glass" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger className="mt-1.5 glass"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="mt-1.5 glass" /></div>
                <div>
                  <Label>Project</Label>
                  <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                    <SelectTrigger className="mt-1.5 glass"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Assign to team member</Label>
                  <span className="text-xs text-muted-foreground">{members.length} member{members.length === 1 ? "" : "s"} in your company</span>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    placeholder="Search by name or email…"
                    className="pl-9 glass"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {membersLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="glass rounded-xl p-3"><Skeleton className="h-16 w-full" /></div>
                    ))
                  ) : filteredMembers.length === 0 ? (
                    <div className="col-span-2 glass rounded-xl p-8 text-center text-sm text-muted-foreground">
                      {members.length === 0
                        ? "No registered members in your company yet. Share your Company ID so members can sign up."
                        : "No members match your search."}
                    </div>
                  ) : (
                    filteredMembers.map((m) => {
                      const selected = form.assignedTo === m.id;
                      const suggested = aiSuggestedId === m.id;
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setForm({ ...form, assignedTo: m.id })}
                          className={`text-left glass rounded-xl p-3 border transition-all hover:-translate-y-0.5 hover:glow-cyan ${
                            selected
                              ? "border-[var(--neon-cyan)] glow-cyan ring-1 ring-[var(--neon-cyan)]"
                              : "border-border/40"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={m.profile_image ?? undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background text-xs">
                                  {m.full_name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${m.online ? "bg-[var(--neon-green)]" : "bg-muted"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <div className="font-medium text-sm truncate">{m.full_name}</div>
                                {suggested && (
                                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background flex items-center gap-0.5">
                                    <Sparkle className="h-2.5 w-2.5" /> AI pick
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                <Mail className="h-3 w-3" /> {m.email}
                              </div>
                              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1"><Activity className="h-3 w-3 text-[var(--neon-cyan)]" /> {m.activeTasks} active</span>
                                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-[var(--neon-green)]" /> {m.completedTasks} done</span>
                                <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-[var(--neon-violet)]" /> {m.productivity_score}</span>
                              </div>
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                  <span>Workload</span><span>{m.workload}%</span>
                                </div>
                                <Progress value={m.workload} className="h-1.5" />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <Button onClick={create} disabled={creating || !form.assignedTo} className="w-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background border-0">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-strong rounded-2xl border-gradient overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No tasks yet.</div>
        ) : (
          <div className="divide-y divide-border/40">
            {tasks.map((t) => (
              <div key={t.id} className="px-5 py-4 flex items-center gap-4 hover:bg-card/30 transition">
                <div className={`text-xs uppercase font-semibold ${priorityColor[t.priority]}`}>{t.priority}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.description}</div>
                </div>
                <div className="text-xs px-2.5 py-1 rounded-full glass capitalize">{t.status}</div>
                {t.deadline && <div className="text-xs text-muted-foreground">{new Date(t.deadline).toLocaleDateString()}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
