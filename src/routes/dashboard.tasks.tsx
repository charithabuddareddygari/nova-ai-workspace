import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/tasks")({ component: MyTasksPage });

interface Task {
  id: string; title: string; description: string | null;
  status: string; priority: string; deadline: string | null;
}

function MyTasksPage() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!profile) return;
    const load = () => supabase.from("tasks").select("*").eq("assigned_to", profile.id)
      .order("created_at", { ascending: false }).then(({ data }) => setTasks((data ?? []) as Task[]));
    load();
    const ch = supabase.channel("my-tasks").on("postgres_changes",
      { event: "*", schema: "public", table: "tasks", filter: `assigned_to=eq.${profile.id}` },
      () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile]);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Updated");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground text-sm">Live-synced with your team.</p>
      </div>
      <div className="glass-strong rounded-2xl border-gradient overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No tasks assigned yet.</div>
        ) : (
          <div className="divide-y divide-border/40">
            {tasks.map((t) => (
              <div key={t.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.description}</div>
                </div>
                <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v)}>
                  <SelectTrigger className="w-36 glass"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
