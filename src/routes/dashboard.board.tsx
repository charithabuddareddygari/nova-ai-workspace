import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/board")({ component: KanbanPage });

interface Task { id: string; title: string; status: string; priority: string; }

const COLUMNS = [
  { id: "pending", label: "Pending", color: "from-[var(--neon-cyan)] to-[var(--neon-violet)]" },
  { id: "in_progress", label: "In Progress", color: "from-[var(--neon-violet)] to-[var(--neon-pink)]" },
  { id: "review", label: "Review", color: "from-[var(--neon-pink)] to-[var(--neon-cyan)]" },
  { id: "completed", label: "Completed", color: "from-[var(--neon-green)] to-[var(--neon-cyan)]" },
];

function KanbanPage() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    supabase.from("tasks").select("id,title,status,priority").eq("assigned_to", profile.id)
      .then(({ data }) => setTasks((data ?? []) as Task[]));
  }, [profile]);

  async function move(id: string, status: string) {
    setTasks((t) => t.map((x) => x.id === id ? { ...x, status } : x));
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kanban</h1>
        <p className="text-muted-foreground text-sm">Drag tasks between columns.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragId) { move(dragId, col.id); setDragId(null); } }}
            className="glass-strong rounded-2xl p-4 border-gradient min-h-[420px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${col.color}`} />
                <h3 className="font-semibold text-sm">{col.label}</h3>
              </div>
              <span className="text-xs text-muted-foreground">{tasks.filter((t) => t.status === col.id).length}</span>
            </div>
            <div className="space-y-2">
              {tasks.filter((t) => t.status === col.id).map((t) => (
                <div key={t.id}
                  draggable onDragStart={() => setDragId(t.id)}
                  className="glass rounded-xl p-3 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition">
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">{t.priority}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
