import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, usernameToEmail, claimOrphanRows } from "@/lib/supabase";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in · F1 Telemetry" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!username.trim() || !password) { setErr("Username and password required."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      const email = usernameToEmail(username);
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Try immediate sign-in in case email confirmation is disabled.
        await supabase.auth.signInWithPassword({ email, password });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      // Attach any orphan legacy rows to this account (only affects the first user).
      await claimOrphanRows();
      navigate({ to: "/" });
    } catch (e: any) {
      setErr(e?.message || "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-6 shadow-xl">
        <h1 className="mb-1 text-2xl font-black tracking-tight">
          <span className="text-red-500">F1</span> Telemetry
        </h1>
        <p className="mb-6 text-sm text-white/50">
          {mode === "signin" ? "Sign in to your account" : "Create an account"}
        </p>

        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-white/60">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          className="mb-4 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-red-500"
          placeholder="felek"
        />

        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-white/60">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className="mb-4 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-red-500"
          placeholder="••••••"
        />

        {err && <div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</div>}

        <button
          type="submit"
          disabled={busy}
          className="mb-3 w-full rounded-md bg-red-500 px-4 py-2 text-sm font-black uppercase tracking-widest text-white transition hover:bg-red-600 disabled:opacity-50"
        >
          {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => { setErr(null); setMode(mode === "signin" ? "signup" : "signin"); }}
          className="w-full text-center text-xs text-white/50 hover:text-white"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
