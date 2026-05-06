import { createFileRoute } from "@tanstack/react-router";
import { AIChat } from "@/components/app/AIChat";

export const Route = createFileRoute("/dashboard/ai")({ component: () => <AIChat /> });
