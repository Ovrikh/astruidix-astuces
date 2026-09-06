import { Link } from "react-router-dom";

const stack = [
  { slug: "vite", label: "Vite", desc: "Build ultra-rapide (même moteur que movix.men)" },
  { slug: "react", label: "React 19", desc: "Interface réactive" },
  { slug: "tailwindcss", label: "Tailwind CSS 4", desc: "Thème sombre rouge/noir/blanc" },
  { slug: "typescript", label: "TypeScript", desc: "Typage strict" },
];

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-black tracking-tight">À propos</h1>
      <p className="mt-4 leading-relaxed text-bone-300">
        <strong>Astruidix Astuces</strong> est un carnet de bord tech : chaque astuce est testée
        avant d'être publiée, et rédigée pour être rejouable en quelques minutes. Pas de blabla,
        pas de pub.
      </p>
      <p className="mt-3 leading-relaxed text-bone-300">
        Le site s'inspire de l'architecture de <span className="text-bone-100">movix.men</span>{" "}
        (Vite + React + Tailwind en mode sombre) et affiche des icônes de marques fournies par{" "}
        <a href="https://thesvg.org" target="_blank" rel="noopener" className="text-redhot-400 hover:underline">
          thesvg.org
        </a>
        .
      </p>

      <h2 className="mt-10 mb-4 text-xl font-bold text-redhot-400">Sous le capot</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {stack.map((s) => (
          <div key={s.slug} className="flex items-center gap-4 rounded-2xl border border-ink-700 bg-ink-850 p-4">
            <img
              src={`https://thesvg.org/icons/${s.slug}/default.svg`}
              alt=""
              width={34}
              height={34}
              loading="lazy"
              className="h-[34px] w-[34px]"
            />
            <div>
              <p className="font-bold">{s.label}</p>
              <p className="text-sm text-bone-500">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-ink-700 bg-ink-850 p-5">
        <h2 className="font-bold">Publier une astuce</h2>
        <p className="mt-2 text-sm text-bone-500">
          L'édition se fait sur la page <code className="rounded bg-ink-800 px-1.5 py-0.5 text-sm">/admin</code> :
          rédaction Markdown, aperçu en direct et publication en un commit.
        </p>
        <Link to="/admin" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-redhot-500 px-4 py-2 text-sm font-semibold text-white hover:bg-redhot-600">
          <i className="bi bi-pencil-square" aria-hidden="true" /> Ouvrir l'éditeur
        </Link>
      </div>
    </main>
  );
}
