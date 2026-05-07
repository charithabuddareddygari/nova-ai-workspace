import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export const Route = createFileRoute("/api/users/company-members")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      GET: async ({ request }) => {
        try {
          const SUPABASE_URL = process.env.SUPABASE_URL;
          const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
          if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
            return json({ error: "Server misconfigured" }, 500);
          }

          const authHeader = request.headers.get("authorization");
          if (!authHeader?.startsWith("Bearer ")) {
            return json({ error: "Unauthorized" }, 401);
          }
          const token = authHeader.slice(7);

          const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
          });

          const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
          if (claimsErr || !claimsData?.claims?.sub) {
            return json({ error: "Invalid token" }, 401);
          }
          const userId = claimsData.claims.sub;

          // Verify caller is admin
          const { data: callerRole } = await supabase
            .from("user_roles")
            .select("role, company_id")
            .eq("user_id", userId)
            .maybeSingle();
          if (!callerRole || callerRole.role !== "admin") {
            return json({ error: "Forbidden: admin only" }, 403);
          }

          const { data: callerProfile } = await supabase
            .from("profiles")
            .select("company_id")
            .eq("id", userId)
            .maybeSingle();
          const companyId = callerProfile?.company_id;
          if (!companyId) return json({ error: "No company" }, 400);

          const { data: profs, error: pErr } = await supabase
            .from("profiles")
            .select("id, full_name, email, profile_image, productivity_score, updated_at")
            .eq("company_id", companyId);
          if (pErr) return json({ error: pErr.message }, 500);

          const ids = (profs ?? []).map((p) => p.id);
          if (ids.length === 0) return json({ members: [] });

          const [{ data: roles }, { data: allTasks }] = await Promise.all([
            supabase.from("user_roles").select("user_id, role").in("user_id", ids),
            supabase.from("tasks").select("assigned_to, status").in("assigned_to", ids),
          ]);

          const roleMap = new Map((roles ?? []).map((r: any) => [r.user_id, r.role]));
          const taskAgg = new Map<string, { active: number; done: number }>();
          (allTasks ?? []).forEach((t: any) => {
            if (!t.assigned_to) return;
            const cur = taskAgg.get(t.assigned_to) ?? { active: 0, done: 0 };
            if (t.status === "completed") cur.done += 1;
            else cur.active += 1;
            taskAgg.set(t.assigned_to, cur);
          });
          const maxActive = Math.max(1, ...Array.from(taskAgg.values()).map((v) => v.active));

          const members = (profs ?? [])
            .filter((p) => (roleMap.get(p.id) ?? "member") === "member")
            .map((p: any) => {
              const agg = taskAgg.get(p.id) ?? { active: 0, done: 0 };
              const updated = p.updated_at ? new Date(p.updated_at).getTime() : 0;
              return {
                id: p.id,
                full_name: p.full_name || "Unnamed",
                email: p.email,
                profile_image: p.profile_image,
                productivity_score: p.productivity_score ?? 0,
                role: "member" as const,
                activeTasks: agg.active,
                completedTasks: agg.done,
                workload: Math.round((agg.active / maxActive) * 100),
                online: Date.now() - updated < 5 * 60 * 1000,
              };
            })
            .sort((a, b) => a.workload - b.workload);

          return json({ companyId, count: members.length, members });
        } catch (e: any) {
          return json({ error: e?.message ?? "Internal error" }, 500);
        }
      },
    },
  },
});
