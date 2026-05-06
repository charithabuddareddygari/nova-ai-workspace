
-- Roles enum and table (separate from profiles for security)
create type public.app_role as enum ('admin', 'member');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  company_id text not null default '',
  organization_name text,
  profile_image text,
  productivity_score int not null default 0,
  xp int not null default 0,
  streak int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  company_id text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  deadline timestamptz,
  tags text[] not null default '{}',
  progress int not null default 0,
  status text not null default 'active',
  company_id text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending',
  priority text not null default 'medium',
  deadline timestamptz,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  company_id text not null,
  attachments text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  type text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Helper functions (security definer to avoid RLS recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.get_company_id(_user_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = _user_id
$$;

-- Auto-create profile + role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _role public.app_role;
  _company text;
begin
  _company := coalesce(new.raw_user_meta_data->>'company_id', '');
  _role := coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'member'::public.app_role);

  insert into public.profiles (id, full_name, email, company_id, organization_name, profile_image)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    _company,
    new.raw_user_meta_data->>'organization_name',
    new.raw_user_meta_data->>'profile_image'
  );

  insert into public.user_roles (user_id, role, company_id) values (new.id, _role, _company);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at triggers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();
create trigger tasks_touch before update on public.tasks for each row execute function public.touch_updated_at();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "profiles_select_company" on public.profiles for select to authenticated
  using (company_id = public.get_company_id(auth.uid()) or id = auth.uid());
create policy "profiles_update_self" on public.profiles for update to authenticated
  using (id = auth.uid());
create policy "profiles_insert_self" on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- Roles
create policy "roles_select_self" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- Projects
create policy "projects_select_company" on public.projects for select to authenticated
  using (company_id = public.get_company_id(auth.uid()));
create policy "projects_insert_admin" on public.projects for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin') and company_id = public.get_company_id(auth.uid()));
create policy "projects_update_admin" on public.projects for update to authenticated
  using (public.has_role(auth.uid(), 'admin') and company_id = public.get_company_id(auth.uid()));
create policy "projects_delete_admin" on public.projects for delete to authenticated
  using (public.has_role(auth.uid(), 'admin') and company_id = public.get_company_id(auth.uid()));

-- Project members
create policy "pm_select_company" on public.project_members for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.company_id = public.get_company_id(auth.uid())));
create policy "pm_admin_manage" on public.project_members for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Tasks
create policy "tasks_select_company" on public.tasks for select to authenticated
  using (company_id = public.get_company_id(auth.uid()));
create policy "tasks_insert_admin" on public.tasks for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin') and company_id = public.get_company_id(auth.uid()));
create policy "tasks_update_assignee_or_admin" on public.tasks for update to authenticated
  using ((assigned_to = auth.uid() or public.has_role(auth.uid(), 'admin')) and company_id = public.get_company_id(auth.uid()));
create policy "tasks_delete_admin" on public.tasks for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Comments
create policy "comments_select_company" on public.task_comments for select to authenticated
  using (exists (select 1 from public.tasks t where t.id = task_id and t.company_id = public.get_company_id(auth.uid())));
create policy "comments_insert_company" on public.task_comments for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.tasks t where t.id = task_id and t.company_id = public.get_company_id(auth.uid())));

-- Notifications
create policy "notif_select_self" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notif_update_self" on public.notifications for update to authenticated using (user_id = auth.uid());
create policy "notif_insert_self" on public.notifications for insert to authenticated with check (user_id = auth.uid());

-- Realtime
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.projects;
