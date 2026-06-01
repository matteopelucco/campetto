"use client";

import { use, useEffect, useState } from "react";

type Status = "loading" | "valid" | "invalid" | "done";
type InviteInfo = { email: string; expiresAt: string };

export default function InvitoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [status, setStatus] = useState<Status>("loading");
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: "", cognome: "", dataNascita: "", codiceFiscale: "", indirizzo: "",
    genitoreNome: "", genitoreCognome: "", genitoreTelefono: "", genitoreRelazione: "",
  });

  useEffect(() => {
    fetch(`/api/inviti/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json() as { error: string };
          setErrorMsg(d.error);
          setStatus("invalid");
        } else {
          setInfo(await res.json() as InviteInfo);
          setStatus("valid");
        }
      })
      .catch(() => { setErrorMsg("Errore di rete"); setStatus("invalid"); });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/inviti/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json() as { error: string };
        setErrorMsg(d.error);
      } else {
        setStatus("done");
      }
    } catch { setErrorMsg("Errore di rete"); }
    finally { setSubmitting(false); }
  };

  const inp = "w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";
  const lbl = "block text-xs font-medium text-zinc-400 mb-1";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0d1209" }}>
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Campetto ⚽</h1>
          <p className="text-zinc-400 text-sm mt-1">Iscrizione bambino</p>
        </div>

        {status === "loading" && (
          <p className="text-center text-zinc-500">Verifica link…</p>
        )}

        {status === "invalid" && (
          <div className="rounded-xl border border-red-800 bg-red-950/40 p-6 text-center">
            <p className="text-red-400 font-medium">{errorMsg}</p>
            <p className="text-zinc-500 text-sm mt-2">Contatta l'allenatore per ricevere un nuovo link.</p>
          </div>
        )}

        {status === "done" && (
          <div className="rounded-xl border border-green-800 bg-green-950/40 p-6 text-center">
            <p className="text-green-400 font-semibold text-lg">✅ Iscrizione completata!</p>
            <p className="text-zinc-400 text-sm mt-2">I dati sono stati inviati all'allenatore. Ti contatteremo a breve.</p>
          </div>
        )}

        {status === "valid" && info && (
          <div className="rounded-xl border border-white/5 p-6" style={{ background: "#131a0f" }}>
            <p className="text-xs text-zinc-500 mb-4">
              Link per: <span className="text-zinc-300">{info.email}</span>
              {" · "}scade il{" "}
              <span className="text-zinc-300">
                {new Date(info.expiresAt).toLocaleString("it-IT")}
              </span>
            </p>

            {errorMsg && (
              <div className="mb-4 rounded-lg bg-red-950/40 border border-red-800 px-3 py-2 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-3">Dati del bambino</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>Nome *</label><input required className={inp} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
                  <div><label className={lbl}>Cognome *</label><input required className={inp} value={form.cognome} onChange={(e) => setForm({ ...form, cognome: e.target.value })} /></div>
                </div>
                <div className="mt-3"><label className={lbl}>Data di nascita *</label><input required type="date" className={inp} value={form.dataNascita} onChange={(e) => setForm({ ...form, dataNascita: e.target.value })} /></div>
                <div className="mt-3"><label className={lbl}>Codice fiscale</label><input className={inp} placeholder="RSSMRA10A01H501Z" value={form.codiceFiscale} onChange={(e) => setForm({ ...form, codiceFiscale: e.target.value })} /></div>
                <div className="mt-3"><label className={lbl}>Indirizzo</label><input className={inp} value={form.indirizzo} onChange={(e) => setForm({ ...form, indirizzo: e.target.value })} /></div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="text-sm font-semibold text-zinc-300 mb-3">I tuoi dati (genitore)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>Nome</label><input className={inp} value={form.genitoreNome} onChange={(e) => setForm({ ...form, genitoreNome: e.target.value })} /></div>
                  <div><label className={lbl}>Cognome</label><input className={inp} value={form.genitoreCognome} onChange={(e) => setForm({ ...form, genitoreCognome: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><label className={lbl}>Telefono</label><input className={inp} type="tel" value={form.genitoreTelefono} onChange={(e) => setForm({ ...form, genitoreTelefono: e.target.value })} /></div>
                  <div><label className={lbl}>Relazione</label><input className={inp} placeholder="Padre / Madre" value={form.genitoreRelazione} onChange={(e) => setForm({ ...form, genitoreRelazione: e.target.value })} /></div>
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 px-4 py-3 text-sm font-bold text-white transition-colors">
                {submitting ? "Invio in corso…" : "Completa iscrizione"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
