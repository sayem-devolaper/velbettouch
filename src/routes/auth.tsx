import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন লগইন | ম্যাজিক টিস্যু অর্ডার ড্যাশবোর্ড" },
      {
        name: "description",
        content: "ম্যাজিক টিস্যু অর্ডার ড্যাশবোর্ডে ঢুকতে ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।",
      },
      { property: "og:title", content: "অ্যাডমিন লগইন | ম্যাজিক টিস্যু" },
      { property: "og:description", content: "অর্ডার দেখা, এডিট ও ক্যানসেল করার ড্যাশবোর্ড লগইন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        setMessage("অ্যাকাউন্ট তৈরি হয়েছে। এখন লগইন করুন।");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "কিছু ভুল হয়েছে");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-bold">অ্যাডমিন লগইন</h1>
        <p className="mt-1 text-sm text-muted-foreground">অর্ডার ড্যাশবোর্ডে প্রবেশ করুন</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">ইমেইল</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          {message && <p className="text-sm text-primary">{message}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "অপেক্ষা করুন..." : mode === "signin" ? "লগইন" : "অ্যাকাউন্ট তৈরি করুন"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-sm text-muted-foreground underline"
        >
          {mode === "signin" ? "নতুন অ্যাকাউন্ট তৈরি করবেন?" : "আগের অ্যাকাউন্টে লগইন করুন"}
        </button>
      </div>
    </main>
  );
}