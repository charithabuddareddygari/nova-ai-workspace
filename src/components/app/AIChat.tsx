import { useEffect, useState, useRef } from "react";
import { Send, Sparkles, Loader2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Msg { role: "user" | "assistant"; content: string; }

export function AIChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your TaskNova AI co-pilot. Ask me anything — task ideas, project breakdowns, productivity tips, summaries." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function toggleVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return toast.error("Voice not supported in this browser");
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = "en-US"; r.continuous = false; r.interimResults = false;
    r.onresult = (e: any) => setInput(e.results[0][0].transcript);
    r.onend = () => setListening(false);
    r.start(); recogRef.current = r; setListening(true);
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input };
    const next = [...messages, userMsg];
    setMessages(next); setInput(""); setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { messages: next },
      });
      if (error) throw error;
      setMessages([...next, { role: "assistant", content: data.text }]);
    } catch (e: any) {
      toast.error(e.message ?? "AI request failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-9rem)] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] glow-cyan">
          <Sparkles className="h-4 w-4 text-background" />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Assistant</h1>
          <p className="text-xs text-muted-foreground">Powered by next-gen AI</p>
        </div>
      </div>

      <div className="flex-1 glass-strong rounded-2xl border-gradient p-4 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background" : "glass"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="glass rounded-2xl px-4 py-2.5 inline-flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</div>}
        <div ref={endRef} />
      </div>

      <div className="mt-3 glass-strong rounded-2xl p-2 flex items-center gap-2 border-gradient">
        <Button size="icon" variant="ghost" onClick={toggleVoice}>{listening ? <MicOff className="h-4 w-4 text-[var(--neon-pink)]" /> : <Mic className="h-4 w-4" />}</Button>
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask anything…"
          className="flex-1 bg-transparent outline-none text-sm px-2"
        />
        <Button onClick={send} disabled={loading || !input.trim()} className="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-violet)] text-background border-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
