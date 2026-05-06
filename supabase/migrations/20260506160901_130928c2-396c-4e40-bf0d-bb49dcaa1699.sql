
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.get_company_id(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
