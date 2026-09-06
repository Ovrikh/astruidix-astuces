import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchTip } from "../lib/api";
import type { Tip } from "../types";
import Markdown from "../components/Markdown";
import { BrandIcon } from "../components/TipCard";

export default function TipPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tip, setTip] = useState<Tip | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!slug) return;
    setState("loading");
    fetchTip(slug)
      .then((t) => {
        setTip(t);
        setState("ok");
        document.title = `${t.title} — Astruidix Astuces`;
      })
      .catch(() => setState("error"));
    return () => {
      document.title = "Astruidix Astuces — des astuces tech, claires et testées";
    };
  }, [slug]);

  if (state === "loading")
    return (
      <p className="py-24 text-center text-bone-500">
        <i className="bi bi-arrow-repeat mr-2 animate-spin" aria-hidden="true" />
        Chargement…
      </p>
    );

  if (state === "error" || !tip)
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <i className="bi bi-emoji-frown text-5xl text-redhot-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold">Astuce introuvable</h1>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-redhot-500 px-5 py-2.5 font-semibold text-white hover:bg-redhot-600">
          Retour à l'accueil
        </Link>
      </main>
    );

  const dateFmt = new Date(tip.date + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-bone-500 hover:text-redhot-400">
        <i className="bi bi-arrow-left" aria-hidden="true" /> Toutes les astuces
      </Link>
      <header className="mb-8 border-b border-ink-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-800">
            <BrandIcon slug={tip.icon} className="h-8 w-8" />
          </div>
          <div>
            <span className="rounded-full border border-redhot-500/40 bg-redhot-900/40 px-2.5 py-0.5 text-xs font-semibold text-redhot-400">
              {tip.category}
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{tip.title}</h1>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-sm text-ink-600">
          <i className="bi bi-calendar3" aria-hidden="true" />
          <time dateTime={tip.date}>{dateFmt}</time>
        </div>
      </header>
      <article>
        <Markdown content={tip.content} />
      </article>
    </main>
  );
}
