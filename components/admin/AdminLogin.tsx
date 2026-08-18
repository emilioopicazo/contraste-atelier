"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = supabaseBrowser();
    if (!supabase || !email) return;
    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin/workshops`,
      },
    });
    setState(error ? "error" : "sent");
  };

  return (
    <form className="adm__login" onSubmit={submit}>
      <h1>Admin</h1>
      <p className="adm__sub">Contraste Atelier · Workshops</p>
      <label className="fld">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          style={{ background: "var(--ink-2)", colorScheme: "dark", border: "1px solid rgba(236,234,227,.32)", color: "var(--paper)", padding: 12 }}
        />
      </label>
      <button className="btn" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send magic link"}
      </button>
      {state === "sent" && (
        <p className="adm__msg">Check your inbox — the sign-in link is on its way.</p>
      )}
      {state === "error" && (
        <p className="adm__msg adm__msg--err">Could not send the link. Try again.</p>
      )}
    </form>
  );
}
