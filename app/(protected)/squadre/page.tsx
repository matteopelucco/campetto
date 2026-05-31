"use client";

import { useEffect, useState, useCallback } from "react";
import { IconEdit, IconTrash, IconPlus, IconX } from "@tabler/icons-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Categoria =
  | "PICCOLI_AMICI"
  | "PULCINI"
  | "ESORDIENTI"
  | "GIOVANISSIMI"
  | "ALLIEVI";

type Squadra = {
  id: number;
  nome: string;
  categoria: Categoria;
  stagione: string;
  allenatore: string | null;
  _count: { giocatori: number };
};

type FormData = {
  nome: string;
  categoria: Categoria;
  stagione: string;
  allenatore: string;
};

type Toast = { type: "success" | "error"; message: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIE: { value: Categoria; label: string }[] = [
  { value: "PICCOLI_AMICI", label: "Piccoli Amici" },
  { value: "PULCINI", label: "Pulcini" },
  { value: "ESORDIENTI", label: "Esordienti" },
  { value: "GIOVANISSIMI", label: "Giovanissimi" },
  { value: "ALLIEVI", label: "Allievi" },
];

const CATEGORIA_LABEL: Record<Categoria, string> = Object.fromEntries(
  CATEGORIE.map(({ value, label }) => [value, label]),
) as Record<Categoria, string>;

const CATEGORIA_COLOR: Record<Categoria, string> = {
  PICCOLI_AMICI: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  PULCINI: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  ESORDIENTI: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  GIOVANISSIMI: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  ALLIEVI: "bg-green-500/20 text-green-300 border-green-500/30",
};

const EMPTY_FORM: FormData = {
  nome: "",
  categoria: "PULCINI",
  stagione: "",
  allenatore: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SquadrePage() {
  const [squadre, setSquadre] = useState<Squadra[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [toast, setToast] = useState<Toast | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type: Toast["type"], message: string) =>
    setToast({ type, message });

  // Fetch list
  const fetchSquadre = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/squadre");
      if (!res.ok) throw new Error("Errore caricamento");
      setSquadre(await res.json() as Squadra[]);
    } catch {
      showToast("error", "Impossibile caricare le squadre");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSquadre(); }, [fetchSquadre]);

  // Form helpers
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.nome.trim()) e.nome = "Il nome è obbligatorio";
    if (!form.stagione.trim()) e.stagione = "La stagione è obbligatoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = (s: Squadra) => {
    setEditId(s.id);
    setForm({
      nome: s.nome,
      categoria: s.categoria,
      stagione: s.stagione,
      allenatore: s.allenatore ?? "",
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      nome: form.nome.trim(),
      categoria: form.categoria,
      stagione: form.stagione.trim(),
      allenatore: form.allenatore.trim() || null,
    };

    try {
      const res = await fetch(
        editId ? `/api/squadre/${editId}` : "/api/squadre",
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Errore server");
      }
      showToast("success", editId ? "Squadra aggiornata" : "Squadra creata");
      resetForm();
      fetchSquadre();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (s: Squadra) => {
    if (s._count.giocatori > 0) {
      showToast(
        "error",
        `Impossibile eliminare: ${s._count.giocatori} giocatori assegnati`,
      );
      return;
    }
    if (!confirm(`Eliminare "${s.nome}"?`)) return;
    try {
      const res = await fetch(`/api/squadre/${s.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Errore server");
      }
      showToast("success", "Squadra eliminata");
      if (editId === s.id) resetForm();
      fetchSquadre();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Errore");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const inputCls =
    "w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";
  const labelCls = "block text-xs font-medium text-zinc-400 mb-1";
  const errorCls = "text-xs text-red-400 mt-1";

  return (
    <div className="flex gap-6 h-full">
      {/* ── Table ── */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Squadre ({squadre.length})
          </span>
        </div>

        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5" style={{ background: "#131a0f" }}>
                {["Nome", "Categoria", "Stagione", "Allenatore", "Giocatori", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    Caricamento…
                  </td>
                </tr>
              ) : squadre.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    Nessuna squadra. Creane una!
                  </td>
                </tr>
              ) : (
                squadre.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                      editId === s.id ? "bg-green-950/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-white font-medium">{s.nome}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORIA_COLOR[s.categoria]}`}
                      >
                        {CATEGORIA_LABEL[s.categoria]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{s.stagione}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {s.allenatore ?? <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{s._count.giocatori}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Modifica"
                        >
                          <IconEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Elimina"
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="w-72 flex-shrink-0">
        <div
          className="rounded-xl border border-white/5 p-5"
          style={{ background: "#131a0f" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              {editId ? "Modifica squadra" : "Nuova squadra"}
            </h3>
            {editId && (
              <button
                onClick={resetForm}
                className="p-1 rounded text-zinc-500 hover:text-white transition-colors"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Nome *</label>
              <input
                className={inputCls}
                placeholder="es. Pulcini 2016"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
              {errors.nome && <p className={errorCls}>{errors.nome}</p>}
            </div>

            <div>
              <label className={labelCls}>Categoria *</label>
              <select
                className={inputCls}
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value as Categoria })
                }
              >
                {CATEGORIE.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Stagione *</label>
              <input
                className={inputCls}
                placeholder="2024/25"
                value={form.stagione}
                onChange={(e) => setForm({ ...form, stagione: e.target.value })}
              />
              {errors.stagione && <p className={errorCls}>{errors.stagione}</p>}
            </div>

            <div>
              <label className={labelCls}>Allenatore</label>
              <input
                className={inputCls}
                placeholder="Nome allenatore"
                value={form.allenatore}
                onChange={(e) => setForm({ ...form, allenatore: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {submitting ? (
                "Salvataggio…"
              ) : editId ? (
                "Aggiorna"
              ) : (
                <>
                  <IconPlus size={15} />
                  Aggiungi
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${
            toast.type === "success"
              ? "bg-green-900/90 text-green-100 border-green-700"
              : "bg-red-900/90 text-red-100 border-red-700"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
