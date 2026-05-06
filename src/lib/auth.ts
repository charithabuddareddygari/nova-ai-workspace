import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "admin" | "member";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  companyId: string;
  organizationName?: string;
  profileImage?: string;
  role: AppRole;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => loadProfile(session.user.id), 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id);
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadProfile(uid: string) {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid).maybeSingle(),
    ]);
    if (p) {
      setProfile({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        companyId: p.company_id,
        organizationName: p.organization_name ?? undefined,
        profileImage: p.profile_image ?? undefined,
        role: (r?.role as AppRole) ?? "member",
      });
    }
    setLoading(false);
  }

  return { user, profile, loading, signOut: () => supabase.auth.signOut() };
}
