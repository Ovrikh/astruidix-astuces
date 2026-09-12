import { Link } from "react-router-dom";
import { useState } from "react";
import type { TipMeta } from "../types";

const catColors: Record<string, string> = {
  Web: "border-redhot-500/40 bg-redhot-900/40 text-redhot-400",
  Linux: "border-ink-600 bg-ink-800 text-bone-100",
  Android: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Outils: "border-sky-500/30 bg-sky-500/10 text-sky-400",
};

export function BrandIcon({ slug, className }: { slug?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!slug || failed) return <i className="bi bi-lightbulb text-redhot-400" aria-label="Icône par défaut" />;
  return (
    <img
      src={`https://cdn.jsdelivr.net/npm/@thesvg/icons/icons/${encodeURIComponent(slug)}.svg`}
      alt=""
      loading="lazy"
      className={className ?? "h-5 w-5"}
      onError={() => setFailed(true)}
    />
  );
}

export default function TipCard({ tip }: { tip: TipMeta }) {
  const dateFmt = new Date(tip.date + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <Link
      to={`/astuce/${tip.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-ink-700 bg-ink-850 p-5 transition hover:-translate-y-1 hover:border-redhot-500/60 hover:shadow-xl hover:shadow-redhot-500/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-800">
          <BrandIcon slug={tip.icon} className="h-6 w-6" />
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            catColors[tip.category] ?? catColors.Linux
          }`}
        >
          {tip.category}
        </span>
      </div>
      <div>
        <h3 className="font-bold text-bone-100 group-hover:text-redhot-400">{tip.title}</h3>
        {tip.excerpt && <p className="mt-1 line-clamp-2 text-sm text-bone-500">{tip.excerpt}</p>}
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-xs text-ink-600">
        <i className="bi bi-calendar3" aria-hidden="true" />
        <time dateTime={tip.date}>{dateFmt}</time>
      </div>
    </Link>
  );
}
