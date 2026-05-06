import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tasks")({
  component: TasksPage,
});

interface Task {
  id: string; title: string; description: string | null;
  status: string; priority: string; deadline: string | null;
}
interface Member { id: string; full_name: string; }
interface Project { id: string; title: string; }

function TasksPage() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium", projectId: "",
    assignedTo: "", deadline: "",
  });

  async function load() {
    const [{ data: t }, { data: p }, { data: m }] = await Promise.all([
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("id,title"),
      supabase.from("profiles").select("id,full_name"),
    ]);
    setTasks((t ?? []) as Task[]);
    setProjects((p ?? []) as Project[]);
    setMembers((m ?? []) as Member[]);
  }
  useEffect(() => { load(); }, []);

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
    setCreating(true);
    const { error } = await supabase.from("tasks").insert({
      title: form.title, description: form.description || null,
      priority: form.priority, project_id: form.projectId || null,
      assigned_to: form.assignedTo || null, deadline: form.deadline || null,
      company_id: profile.companyId, created_by: profile.id,
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Task created"); setOpen(false);
    setForm({ title: "", description: "", priority: "medium", projectId: "", assignedTo: "", deadline: "" });
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
              <Plus className="h-4 w-4 mr-1" /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong max-w-lg">
            <DialogHeader><DialogTitle>Create task</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 glass" /></div>
              <div>
                <div className="flex justify-between items-center">
                  <Label>Description</Label>
                  <Button size="sm" variant="ghost" onClick={aiBreakdown} disabled={aiLoading} className="text-[var(--neon-cyan)] h-7">
                    {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Sparkles className="h-3 w-3 mr-1" />AI breakdown</>}
                  </Button>
                </div>
                <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 glass" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger className="mt-1.5 glass"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="mt-1.5 glass" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Project</Label>
                  <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                    <SelectTrigger className="mt-1.5 glass"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assignee</Label>
                  <Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                    <SelectTrigger className="mt-1.5 glass"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>{members.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name || "Unnamed"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={create} disabled={creating} className="w-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background border-0">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
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
