import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — TaskNova AI" }] }),
  component: () => <AppShell role="admin" />,
});
