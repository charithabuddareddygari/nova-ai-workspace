import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/projects")({
  component: ProjectsPage,
});

interface Project {
  id: string; title: string; description: string | null; deadline: string | null;
  progress: number; status: string; tags: string[];
}

function ProjectsPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", deadline: "" });

  async function load() {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects((data ?? []) as Project[]);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!profile || !form.title) return;
    setCreating(true);
    const { error } = await supabase.from("projects").insert({
      title: form.title,
      description: form.description || null,
      deadline: form.deadline || null,
      company_id: profile.companyId,
      created_by: profile.id,
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Project created");
    setOpen(false); setForm({ title: "", description: "", deadline: "" });
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">Manage your team's missions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background border-0 glow-cyan">
              <Plus className="h-4 w-4 mr-1" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong">
            <DialogHeader><DialogTitle>Create project</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 glass" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 glass" /></div>
              <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="mt-1.5 glass" /></div>
              <Button onClick={create} disabled={creating} className="w-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background border-0">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="glass-strong rounded-2xl p-12 text-center text-muted-foreground border-gradient">No projects yet. Create your first one.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="glass-strong rounded-2xl p-5 border-gradient hover:-translate-y-0.5 transition">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{p.title}</h3>
                <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description || "No description"}</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1"><span>Progress</span><span>{p.progress}%</span></div>
                <Progress value={p.progress} className="h-1.5" />
              </div>
              {p.deadline && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {new Date(p.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
