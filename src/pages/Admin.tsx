import { useEffect, useMemo, useState } from "react";
import { PUBLISH_HELP, fetchIndex, fetchTip, publishTip } from "../lib/api";
import type { TipMeta } from "../types";
import { slugify } from "../lib/slugify";
import Markdown from "../components/Markdown";

const THESVG_CATALOG_URL = "https://raw.githubusercontent.com/glincker/thesvg/main/src/data/icons.json";
const THESVG_ICON_URL = (slug: string) =>
  `https://thesvg.org/icons/${encodeURIComponent(slug)}/default.svg`;

type TheSvgIcon = {
  slug: string;
  title: string;
  aliases?: string[];
  categories?: string[];
};

const CAT_CHOICES = ["Web", "Linux", "Android", "Outils", "Divers"];

export default function Admin() {
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CAT_CHOICES[0]);
  const [icon, setIcon] = useState("");
  const [iconQuery, setIconQuery] = useState("");
  const [icons, setIcons] = useState<TheSvgIcon[] | null>(null);
  const [iconsError, setIconsError] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [preview, setPreview] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [showExisting, setShowExisting] = useState(false);
  const [existingTips, setExistingTips] = useState<TipMeta[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [publishedDate, setPublishedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const slug = useMemo(() => (editingSlug ?? slugify(title)) || "nouvelle-astuce", [editingSlug, title]);
  const wordCount = useMemo(
    () => markdown.trim().split(/\s+/).filter(Boolean).length,
    [markdown]
  );
  const iconResults = useMemo(() => {
    const query = iconQuery.trim().toLocaleLowerCase();
    if (!query || !icons) return [];
    return icons
      .filter((item) =>
        [item.title, item.slug, ...(item.aliases ?? []), ...(item.categories ?? [])]
          .some((value) => value.toLocaleLowerCase().includes(query))
      )
      .slice(0, 18);
  }, [iconQuery, icons]);

  useEffect(() => {
    if (iconQuery.trim().length < 2 || icons || iconsError) return;
    const controller = new AbortController();
    fetch(THESVG_CATALOG_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<TheSvgIcon[]>;
      })
      .then((data) => setIcons(data.filter((item) => item.slug && item.title)))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setIconsError("Le catalogue theSVG est momentanément indisponible.");
      });
    return () => controller.abort();
  }, [iconQuery, icons, iconsError]);

  async function unlock() {
    setMsg(null);
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const user = (await res.json()) as { login: string };
      setUnlocked(true);
      setMsg({ ok: true, text: `Connecté en tant que ${user.login}.` });
    } catch {
      setMsg({ ok: false, text: "Token invalide ou expiré." });
    }
  }

  function resetEditor() {
    setEditingSlug(null);
    setTitle("");
    setCategory(CAT_CHOICES[0]);
    setIcon("");
    setIconQuery("");
    setExcerpt("");
    setMarkdown("");
    setPublishedDate(new Date().toISOString().slice(0, 10));
    setPreview(false);
  }

  async function toggleExistingTips() {
    const nextVisible = !showExisting;
    setShowExisting(nextVisible);
    if (!nextVisible || existingTips.length > 0) return;
    setLoadingExisting(true);
    setMsg(null);
    try {
      const index = await fetchIndex();
      setExistingTips(index.tips);
    } catch {
      setMsg({ ok: false, text: "Impossible de charger les astuces existantes." });
    } finally {
      setLoadingExisting(false);
    }
  }

  async function editTip(meta: TipMeta) {
    setBusy(true);
    setMsg(null);
    try {
      const tip = await fetchTip(meta.slug);
      setEditingSlug(tip.slug);
      setTitle(tip.title);
      setCategory(tip.category);
      setIcon(tip.icon ?? "");
      setIconQuery(tip.icon ?? "");
      setExcerpt(tip.excerpt ?? "");
      setMarkdown(tip.content);
      setPublishedDate(tip.date);
      setShowExisting(false);
      setPreview(false);
      setMsg({ ok: true, text: `Modification de « ${tip.title} » : enregistrez pour publier vos changements.` });
    } catch {
      setMsg({ ok: false, text: "Impossible de charger cette astuce." });
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    setBusy(true);
    setMsg(null);
    try {
      const idx = await fetchIndex();
      const meta: TipMeta = {
        slug,
        title: title.trim() || "Sans titre",
        category,
        icon: icon || undefined,
        date: publishedDate,
        excerpt: excerpt.trim() || undefined,
      };
      const sha = await publishTip({ token, meta, markdown, existingTips: idx.tips, replaceSlug: editingSlug ?? undefined });
      setMsg({
        ok: true,
        text: `✅ ${editingSlug ? "Modifiée" : "Publiée"} ! Le site se met à jour automatiquement (commit ${sha.slice(0, 7)}).`,
      });
      setExistingTips((tips) => [meta, ...tips.filter((tip) => tip.slug !== editingSlug)]);
      resetEditor();
    } catch (e) {
      setMsg({ ok: false, text: `❌ ${e instanceof Error ? e.message : String(e)}` });
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-ink-700 bg-ink-850 px-4 py-2.5 text-bone-100 placeholder:text-ink-600 focus:border-redhot-500 focus:outline-none";

  if (!unlocked)
    return (
      <main className="mx-auto max-w-md px-4 py-20">
        <div className="rounded-2xl border border-ink-700 bg-ink-850 p-7">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <i className="bi bi-shield-lock text-redhot-500" aria-hidden="true" /> Éditeur privé
          </h1>
          <p className="mt-2 text-sm text-bone-500">
            Collez un <strong>fine-grained PAT GitHub</strong> limité au dépôt{" "}
            <code className="rounded bg-ink-800 px-1 py-0.5">astruidix-astuces</code>, permission{" "}
            <em>Contents: Read and write</em>. Le token reste dans votre navigateur, il n'est
            jamais envoyé ailleurs qu'à api.github.com.
          </p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_…"
            className={`${input} mt-4 font-mono`}
            onKeyDown={(e) => e.key === "Enter" && token && unlock()}
          />
          <button
            onClick={unlock}
            disabled={!token}
            className="mt-4 w-full rounded-xl bg-redhot-500 py-2.5 font-bold text-white transition hover:bg-redhot-600 disabled:opacity-40"
          >
            Déverrouiller
          </button>
          {msg && <p className={`mt-3 text-sm ${msg.ok ? "text-emerald-400" : "text-redhot-400"}`}>{msg.text}</p>}
        </div>
      </main>
    );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-black">
          <i className="bi bi-pencil-square text-redhot-500" aria-hidden="true" /> {editingSlug ? "Modifier une astuce" : "Nouvelle astuce"}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleExistingTips}
            disabled={busy}
            className="rounded-xl border border-ink-700 px-4 py-2 text-sm font-semibold text-bone-300 hover:border-redhot-500 disabled:opacity-40"
          >
            <i className="bi bi-pencil mr-1.5" aria-hidden="true" />Modifier une astuce
          </button>
          {editingSlug && (
            <button type="button" onClick={resetEditor} className="rounded-xl border border-ink-700 px-4 py-2 text-sm font-semibold text-bone-300 hover:border-redhot-500">
              Nouvelle astuce
            </button>
          )}
          <button
            onClick={() => setPreview(!preview)}
            className="rounded-xl border border-ink-700 px-4 py-2 text-sm font-semibold text-bone-300 hover:border-redhot-500"
          >
            {preview ? <><i className="bi bi-pencil mr-1.5" aria-hidden="true" />Écrire</> : <><i className="bi bi-eye mr-1.5" aria-hidden="true" />Aperçu</>}
          </button>
          <button
            onClick={publish}
            disabled={busy || !markdown.trim()}
            className="rounded-xl bg-redhot-500 px-5 py-2 font-bold text-white transition hover:bg-redhot-600 disabled:opacity-40"
          >
            {busy ? "Publication…" : "🚀 Publier"}
          </button>
        </div>
        </div>

      {msg && (
        <div className={`mb-4 rounded-xl border p-3 text-sm ${msg.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-redhot-500/40 bg-redhot-900/40 text-redhot-400"}`}>
          {msg.text}
        </div>
      )}

      {showExisting && (
        <section className="mb-5 rounded-2xl border border-ink-700 bg-ink-850 p-5">
          <h2 className="text-base font-bold">Choisissez une astuce à modifier</h2>
          {loadingExisting ? (
            <p className="mt-3 text-sm text-bone-500">Chargement des astuces…</p>
          ) : existingTips.length > 0 ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {existingTips.map((tip) => (
                <button
                  type="button"
                  key={tip.slug}
                  onClick={() => editTip(tip)}
                  className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3 text-left hover:border-redhot-500"
                >
                  <i className="bi bi-pencil-square text-redhot-400" aria-hidden="true" />
                  <span className="min-w-0"><strong className="block truncate text-bone-100">{tip.title}</strong><span className="block truncate text-xs text-bone-500">{tip.category} · {tip.date}</span></span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-bone-500">Aucune astuce publiée pour le moment.</p>
          )}
        </section>
      )}

      {/* Métadonnées */}
      <div className="mb-5 grid gap-4 rounded-2xl border border-ink-700 bg-ink-850 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-bone-300">Titre</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : 5 raccourcis Git qui font gagner du temps" className={input} />
          <p className="mt-1 text-xs text-ink-600">slug : <code className="rounded bg-ink-800 px-1">{slug}.md</code>{editingSlug && " (conservé pour ne pas casser le lien)"}</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-bone-300">Catégorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
            {CAT_CHOICES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-bone-300" htmlFor="icon-search">Icône de marque (theSVG)</label>
          <input
            id="icon-search"
            value={iconQuery}
            onChange={(e) => {
              setIconQuery(e.target.value);
              setIconsError("");
            }}
            placeholder="Recherchez une marque : GitHub, Netflix, Discord…"
            autoComplete="off"
            className={input}
          />
          {icon && (
            <div className="mt-2 flex items-center gap-2 text-sm text-bone-300">
              <img src={THESVG_ICON_URL(icon)} alt="" className="h-6 w-6" />
              <span>Icône choisie : <strong>{icon}</strong></span>
              <button type="button" onClick={() => { setIcon(""); setIconQuery(""); }} className="ml-auto text-xs text-redhot-400 hover:underline">Retirer</button>
            </div>
          )}
          {iconQuery.trim().length >= 2 && !icons && !iconsError && <p className="mt-2 text-xs text-bone-500">Chargement du catalogue theSVG…</p>}
          {iconsError && <p className="mt-2 text-xs text-redhot-400">{iconsError}</p>}
          {icons && iconQuery.trim().length >= 2 && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-ink-700 bg-ink-900 p-1">
              {iconResults.length > 0 ? iconResults.map((item) => (
                <button
                  type="button"
                  key={item.slug}
                  onClick={() => { setIcon(item.slug); setIconQuery(item.title); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-ink-800 ${icon === item.slug ? "bg-redhot-900/40" : ""}`}
                >
                  <img src={THESVG_ICON_URL(item.slug)} alt="" className="h-6 w-6 shrink-0" />
                  <span className="min-w-0"><strong className="block truncate text-bone-100">{item.title}</strong><span className="block truncate text-xs text-bone-500">{item.slug}</span></span>
                </button>
              )) : (
                <p className="px-3 py-2 text-sm text-bone-500">Aucune icône trouvée. Essayez un autre nom.</p>
              )}
            </div>
          )}
          <p className="mt-2 text-xs text-ink-600">Les résultats proviennent du catalogue officiel <a className="text-redhot-400 hover:underline" href="https://thesvg.org" target="_blank" rel="noreferrer">theSVG</a>. Cliquez sur un résultat pour le sélectionner.</p>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-bone-300">Résumé (affiché sur la carte)</label>
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Une phrase qui donne envie de cliquer" className={input} />
        </div>
      </div>

      {/* Éditeur / aperçu */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={"## Introduction\n\nExpliquez le problème en une phrase.\n\n```bash\nla-commande-magique\n```\n\n## Pour ça marche\n\n- point 1\n- point 2"}
            className="h-[480px] w-full resize-y rounded-2xl border border-ink-700 bg-ink-900 p-4 font-mono text-sm text-bone-100 placeholder:text-ink-600 focus:border-redhot-500 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-ink-600">
            <span>{wordCount} mots</span>
            <span>Markdown · GFM supporté</span>
          </div>
        </div>
        <div className="hidden rounded-2xl border border-ink-700 bg-ink-900 p-6 lg:block">
          <Markdown content={markdown || PUBLISH_HELP} />
        </div>
      </div>
    </main>
  );
}
