import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="glass-strong rounded-2xl px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] glow-cyan">
              <Sparkles className="h-4 w-4 text-background" />
            </span>
            <span className="text-gradient text-lg tracking-tight">TaskNova AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#analytics" className="hover:text-foreground transition-colors">AI</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/signup"><Button size="sm" className="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background font-semibold border-0 hover:opacity-90 glow-cyan">Get Started</Button></Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
