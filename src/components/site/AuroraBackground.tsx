export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] rounded-full bg-[var(--neon-violet)] opacity-20 blur-[120px] animate-glow" />
      <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-[var(--neon-cyan)] opacity-15 blur-[120px] animate-glow" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[var(--neon-pink)] opacity-10 blur-[120px]" />
      <div className="absolute inset-0 bg-grid opacity-40" />
    </div>
  );
}
