import { useEffect, useMemo, useState } from "react";
import { fetchIndex } from "../lib/api";
import type { TipMeta } from "../types";
import TipCard from "../components/TipCard";

export default function Home() {
  const [tips, setTips] = useState<TipMeta[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  useEffect(() => {
    fetchIndex()
      .then((idx) => {
        setTips([...idx.tips].sort((a, b) => b.date.localeCompare(a.date)));
        setState("ok");
      })
      .catch(() => setState("error"));
  }, []);

  const categories = useMemo(() => [...new Set(tips.map((t) => t.category))], [tips]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tips.filter(
      (t) =>
        (!cat || t.category === cat) &&
        (!q ||
          t.title.toLowerCase().includes(q) ||
          (t.excerpt ?? "").toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q))
    );
  }, [tips, query, cat]);

  return (
    <main className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <section className="py-14 text-center">
        <p className="mb-3 inline-block rounded-full border border-redhot-500/40 bg-redhot-900/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-redhot-400">
          Nouvelle astuce chaque semaine
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Des astuces <span className="text-redhot-500">tech</span>,<br />
          claires et testées.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-bone-500">
          Web, Linux, Android, outils du quotidien : tout ce que j'apprends, écrit pour être
          compris et rejoué en deux minutes.
        </p>
        <div className="relative mx-auto mt-8 max-w-md">
          <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-ink-600" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une astuce…"
            className="w-full rounded-2xl border border-ink-700 bg-ink-850 py-3.5 pl-11 pr-4 text-bone-100 placeholder:text-ink-600 focus:border-redhot-500 focus:outline-none"
          />
        </div>
      </section>

      {/* Filtres */}
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setCat(null)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              cat === null
                ? "border-redhot-500 bg-redhot-500 text-white"
                : "border-ink-700 bg-ink-850 text-bone-300 hover:border-redhot-500/50"
            }`}
          >
            Tout
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(cat === c ? null : c)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                cat === c
                  ? "border-redhot-500 bg-redhot-500 text-white"
                  : "border-ink-700 bg-ink-850 text-bone-300 hover:border-redhot-500/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Grille */}
      {state === "loading" && (
        <p className="py-16 text-center text-bone-500">
          <i className="bi bi-arrow-repeat mr-2 animate-spin" aria-hidden="true" />
          Chargement des astuces…
        </p>
      )}
      {state === "error" && (
        <p className="py-16 text-center text-redhot-400">
          <i className="bi bi-wifi-off mr-2" aria-hidden="true" />
          Impossible de charger les astuces.
        </p>
      )}
      {state === "ok" && filtered.length === 0 && (
        <p className="py-16 text-center text-bone-500">Aucune astuce ne correspond 😕</p>
      )}
      {state === "ok" && filtered.length > 0 && (
        <div className="grid gap-5 pb-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TipCard key={t.slug} tip={t} />
          ))}
        </div>
      )}
    </main>
  );
}
