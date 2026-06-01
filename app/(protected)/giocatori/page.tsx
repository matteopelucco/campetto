"use client";

import { useEffect, useState, useCallback } from "react";
import { IconEdit, IconTrash, IconPlus, IconX, IconMail, IconCopy, IconCheck } from "@tabler/icons-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Ruolo = "PORTIERE" | "DIFENSORE" | "CENTROCAMPISTA" | "ATTACCANTE";
type Squadra = { id: number; nome: string; categoria: string };
type Genitore = { id: number; nome: string; cognome: string; telefono: string | null; email: string | null; relazione: string | null };
type Giocatore = {
  id: number; nome: string; cognome: string; dataNascita: string;
  codiceFiscale: string | null; indirizzo: string | null;
  numeroMaglia: number | null; ruolo: Ruolo | null; note: string | null;
  attivo: boolean; squadraId: number | null;
  squadra: Squadra | null; genitori: Genitore[];
};
type GenitoreForm = { nome: string; cognome: string; telefono: string; email: string; relazione: string };
type FormData = {
  nome: string; cognome: string; dataNascita: string;
  codiceFiscale: string; indirizzo: string;
  numeroMaglia: string; ruolo: Ruolo | ""; squadraId: string; note: string;
  genitori: [GenitoreForm, GenitoreForm];
};
type Toast = { type: "success" | "error"; message: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const RUOLI: { value: Ruolo; label: string }[] = [
  { value: "PORTIERE", label: "Portiere" },
  { value: "DIFENSORE", label: "Difensore" },
  { value: "CENTROCAMPISTA", label: "Centrocampista" },
  { value: "ATTACCANTE", label: "Attaccante" },
];

const EMPTY_GENITORE: GenitoreForm = { nome: "", cognome: "", telefono: "", email: "", relazione: "" };
const EMPTY_FORM: FormData = {
  nome: "", cognome: "", dataNascita: "", codiceFiscale: "",
  indirizzo: "", numeroMaglia: "", ruolo: "", squadraId: "", note: "",
  genitori: [{ ...EMPTY_GENITORE }, { ...EMPTY_GENITORE }],
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function GiocatoriPage() {
  const [giocatori, setGiocatori] = useState<Giocatore[]>([]);
  const [squadre, setSquadre] = useState<Squadra[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [showG2, setShowG2] = useState(false);
  const [panel, setPanel] = useState<"form" | "invito">("form");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type: Toast["type"], msg: string) => setToast({ type, message: msg });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, sRes] = await Promise.all([
        fetch("/api/giocatori"),
        fetch("/api/squadre"),
      ]);
      setGiocatori(await gRes.json() as Giocatore[]);
      setSquadre(await sRes.json() as Squadra[]);
    } catch { showToast("error", "Errore caricamento"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => { setForm(EMPTY_FORM); setEditId(null); setErrors({}); setShowG2(false); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Obbligatorio";
    if (!form.cognome.trim()) e.cognome = "Obbligatorio";
    if (!form.dataNascita) e.dataNascita = "Obbligatorio";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = (g: Giocatore) => {
    setEditId(g.id);
    setPanel("form");
    const d = new Date(g.dataNascita);
    const dateStr = d.toISOString().split("T")[0];
    const g1 = g.genitori[0] ?? EMPTY_GENITORE;
    const g2 = g.genitori[1] ?? EMPTY_GENITORE;
    setShowG2(!!g.genitori[1]);
    setForm({
      nome: g.nome, cognome: g.cognome, dataNascita: dateStr,
      codiceFiscale: g.codiceFiscale ?? "", indirizzo: g.indirizzo ?? "",
      numeroMaglia: g.numeroMaglia?.toString() ?? "", ruolo: g.ruolo ?? "",
      squadraId: g.squadraId?.toString() ?? "", note: g.note ?? "",
      genitori: [
        { nome: g1.nome ?? "", cognome: g1.cognome ?? "", telefono: g1.telefono ?? "", email: g1.email ?? "", relazione: g1.relazione ?? "" },
        { nome: g2.nome ?? "", cognome: g2.cognome ?? "", telefono: g2.telefono ?? "", email: g2.email ?? "", relazione: g2.relazione ?? "" },
      ],
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const genitori = [form.genitori[0], ...(showG2 ? [form.genitori[1]] : [])]
      .filter((g) => g.nome.trim());
    const payload = {
      nome: form.nome.trim(), cognome: form.cognome.trim(),
      dataNascita: form.dataNascita,
      codiceFiscale: form.codiceFiscale.trim() || null,
      indirizzo: form.indirizzo.trim() || null,
      numeroMaglia: form.numeroMaglia ? parseInt(form.numeroMaglia, 10) : null,
      ruolo: form.ruolo || null,
      squadraId: form.squadraId ? parseInt(form.squadraId, 10) : null,
      note: form.note.trim() || null,
      genitori,
    };
    try {
      const res = await fetch(editId ? `/api/giocatori/${editId}` : "/api/giocatori", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Errore");
      showToast("success", editId ? "Giocatore aggiornato" : "Giocatore aggiunto");
      resetForm();
      fetchData();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (g: Giocatore) => {
    if (!confirm(`Eliminare ${g.nome} ${g.cognome}?`)) return;
    try {
      const res = await fetch(`/api/giocatori/${g.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Errore");
      showToast("success", "Giocatore eliminato");
      if (editId === g.id) resetForm();
      fetchData();
    } catch (err) { showToast("error", err instanceof Error ? err.message : "Errore"); }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.includes("@")) { showToast("error", "Email non valida"); return; }
    setInviting(true);
    setInviteLink(null);
    try {
      const res = await fetch("/api/inviti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Errore");
      const data = await res.json() as { emailSent: boolean; link: string; email: string };
      if (data.emailSent) {
        showToast("success", `Email inviata a ${data.email}`);
        setInviteEmail("");
      } else {
        // Email service not configured — show the link for manual sharing
        setInviteLink(data.link);
        setInviteEmail("");
      }
    } catch (err) { showToast("error", err instanceof Error ? err.message : "Errore"); }
    finally { setInviting(false); }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setG = (idx: 0 | 1, field: keyof GenitoreForm, val: string) =>
    setForm((f) => {
      const g = [...f.genitori] as [GenitoreForm, GenitoreForm];
      g[idx] = { ...g[idx], [field]: val };
      return { ...f, genitori: g };
    });

  // ── Styles ────────────────────────────────────────────────────────────────

  const inp = "w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";
  const lbl = "block text-xs font-medium text-zinc-400 mb-1";
  const err = "text-xs text-red-400 mt-0.5";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Table */}
      <div className="flex-1 min-w-0 overflow-auto">
        <p className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
          Giocatori ({giocatori.length})
        </p>
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5" style={{ background: "#131a0f" }}>
                {["Cognome", "Nome", "Ruolo", "Squadra", "N°", "Genitori", ""].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-zinc-500">Caricamento…</td></tr>
              ) : giocatori.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-zinc-500">Nessun giocatore. Aggiungine uno!</td></tr>
              ) : giocatori.map((g) => (
                <tr key={g.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${editId === g.id ? "bg-green-950/20" : ""}`}>
                  <td className="px-3 py-2.5 text-white font-medium">{g.cognome}</td>
                  <td className="px-3 py-2.5 text-zinc-300">{g.nome}</td>
                  <td className="px-3 py-2.5 text-zinc-400 text-xs">{g.ruolo ?? <span className="text-zinc-600">—</span>}</td>
                  <td className="px-3 py-2.5 text-zinc-400 text-xs">{g.squadra?.nome ?? <span className="text-zinc-600">—</span>}</td>
                  <td className="px-3 py-2.5 text-zinc-400 text-xs">{g.numeroMaglia ?? "—"}</td>
                  <td className="px-3 py-2.5 text-zinc-500 text-xs">{g.genitori.length}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleEdit(g)} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" title="Modifica"><IconEdit size={14} /></button>
                      <button onClick={() => handleDelete(g)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Elimina"><IconTrash size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side panel */}
      <div className="w-80 flex-shrink-0 flex flex-col min-h-0">
        {/* Tab switcher */}
        <div className="flex rounded-lg border border-white/5 mb-3 overflow-hidden" style={{ background: "#131a0f" }}>
          {(["form", "invito"] as const).map((tab) => (
            <button key={tab} onClick={() => setPanel(tab)}
              className={`flex-1 py-2 text-xs font-semibold transition-colors ${panel === tab ? "bg-green-700 text-white" : "text-zinc-400 hover:text-white"}`}>
              {tab === "form" ? "Scheda giocatore" : "Invita via email"}
            </button>
          ))}
        </div>

        {/* Form panel */}
        {panel === "form" && (
          <div className="flex-1 overflow-y-auto rounded-xl border border-white/5 p-4" style={{ background: "#131a0f" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">{editId ? "Modifica" : "Nuovo giocatore"}</h3>
              {editId && <button onClick={resetForm} className="p-1 rounded text-zinc-500 hover:text-white"><IconX size={13} /></button>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className={lbl}>Nome *</label><input className={inp} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />{errors.nome && <p className={err}>{errors.nome}</p>}</div>
                <div><label className={lbl}>Cognome *</label><input className={inp} value={form.cognome} onChange={(e) => setForm({ ...form, cognome: e.target.value })} />{errors.cognome && <p className={err}>{errors.cognome}</p>}</div>
              </div>
              <div><label className={lbl}>Data di nascita *</label><input type="date" className={inp} value={form.dataNascita} onChange={(e) => setForm({ ...form, dataNascita: e.target.value })} />{errors.dataNascita && <p className={err}>{errors.dataNascita}</p>}</div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={lbl}>Ruolo</label>
                  <select className={inp} value={form.ruolo} onChange={(e) => setForm({ ...form, ruolo: e.target.value as Ruolo | "" })}>
                    <option value="">—</option>
                    {RUOLI.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>N° maglia</label><input type="number" className={inp} value={form.numeroMaglia} onChange={(e) => setForm({ ...form, numeroMaglia: e.target.value })} min={1} max={99} /></div>
              </div>
              <div><label className={lbl}>Squadra</label>
                <select className={inp} value={form.squadraId} onChange={(e) => setForm({ ...form, squadraId: e.target.value })}>
                  <option value="">—</option>
                  {squadre.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Codice fiscale</label><input className={inp} value={form.codiceFiscale} onChange={(e) => setForm({ ...form, codiceFiscale: e.target.value })} placeholder="RSSMRA10A01H501Z" /></div>
              <div><label className={lbl}>Indirizzo</label><input className={inp} value={form.indirizzo} onChange={(e) => setForm({ ...form, indirizzo: e.target.value })} /></div>
              <div><label className={lbl}>Note</label><textarea className={inp} rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>

              {/* Genitore 1 */}
              <div className="border-t border-white/5 pt-3">
                <p className="text-xs font-semibold text-zinc-400 mb-2">Genitore 1</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lbl}>Nome</label><input className={inp} value={form.genitori[0].nome} onChange={(e) => setG(0, "nome", e.target.value)} /></div>
                  <div><label className={lbl}>Cognome</label><input className={inp} value={form.genitori[0].cognome} onChange={(e) => setG(0, "cognome", e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div><label className={lbl}>Telefono</label><input className={inp} value={form.genitori[0].telefono} onChange={(e) => setG(0, "telefono", e.target.value)} /></div>
                  <div><label className={lbl}>Relazione</label><input className={inp} placeholder="Padre / Madre" value={form.genitori[0].relazione} onChange={(e) => setG(0, "relazione", e.target.value)} /></div>
                </div>
                <div className="mt-2"><label className={lbl}>Email</label><input type="email" className={inp} value={form.genitori[0].email} onChange={(e) => setG(0, "email", e.target.value)} /></div>
              </div>

              {/* Genitore 2 */}
              {!showG2 ? (
                <button type="button" onClick={() => setShowG2(true)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">+ Aggiungi secondo genitore</button>
              ) : (
                <div className="border-t border-white/5 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-semibold text-zinc-400">Genitore 2</p>
                    <button type="button" onClick={() => { setShowG2(false); setG(1, "nome", ""); }} className="text-xs text-zinc-600 hover:text-zinc-400">Rimuovi</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>Nome</label><input className={inp} value={form.genitori[1].nome} onChange={(e) => setG(1, "nome", e.target.value)} /></div>
                    <div><label className={lbl}>Cognome</label><input className={inp} value={form.genitori[1].cognome} onChange={(e) => setG(1, "cognome", e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div><label className={lbl}>Telefono</label><input className={inp} value={form.genitori[1].telefono} onChange={(e) => setG(1, "telefono", e.target.value)} /></div>
                    <div><label className={lbl}>Relazione</label><input className={inp} value={form.genitori[1].relazione} onChange={(e) => setG(1, "relazione", e.target.value)} /></div>
                  </div>
                  <div className="mt-2"><label className={lbl}>Email</label><input type="email" className={inp} value={form.genitori[1].email} onChange={(e) => setG(1, "email", e.target.value)} /></div>
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors mt-2">
                {submitting ? "Salvataggio…" : editId ? "Aggiorna" : <><IconPlus size={14} /> Aggiungi</>}
              </button>
            </form>
          </div>
        )}

        {/* Invite panel */}
        {panel === "invito" && (
          <div className="rounded-xl border border-white/5 p-4" style={{ background: "#131a0f" }}>
            <div className="flex items-center gap-2 mb-3">
              <IconMail size={16} className="text-green-400" />
              <h3 className="text-sm font-semibold text-white">Invita un genitore</h3>
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Invia un link di iscrizione via email. Il genitore avrà 48 ore per completare l'anagrafica del bambino.
            </p>
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className={lbl}>Email genitore *</label>
                <input type="email" className={inp} placeholder="genitore@email.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={inviting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors">
                {inviting ? "Generazione…" : <><IconMail size={14} /> Genera link invito</>}
              </button>
            </form>

            {/* Fallback: link copiabile quando email non è configurata */}
            {inviteLink && (
              <div className="mt-4 rounded-lg border border-yellow-700/50 bg-yellow-950/30 p-3">
                <p className="text-xs font-medium text-yellow-400 mb-2">
                  ⚠️ Email non configurata — copia e condividi il link manualmente:
                </p>
                <div className="flex gap-2 items-center">
                  <code className="flex-1 text-xs text-zinc-300 bg-zinc-900 rounded px-2 py-1.5 break-all">
                    {inviteLink}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    className="flex-shrink-0 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    title="Copia link"
                  >
                    {copied ? <IconCheck size={14} className="text-green-400" /> : <IconCopy size={14} />}
                  </button>
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                  Valido 48 ore. Per abilitare l&apos;invio automatico configura <code className="text-zinc-500">RESEND_API_KEY</code>.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === "success" ? "bg-green-900/90 text-green-100 border-green-700" : "bg-red-900/90 text-red-100 border-red-700"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
