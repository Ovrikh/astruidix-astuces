export default function Footer() {
  const stack = [
    { slug: "vite", label: "Vite" },
    { slug: "react", label: "React" },
    { slug: "tailwindcss", label: "Tailwind CSS" },
    { slug: "typescript", label: "TypeScript" },
  ];
  return (
    <footer className="mt-20 border-t border-ink-800 bg-ink-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-bone-500">
            Astruidix Astuces — des astuces tech, claires et testées.
          </p>
          <div className="flex items-center gap-4">
            {stack.map((s) => (
              <img
                key={s.slug}
                src={`https://thesvg.org/icons/${s.slug}/default.svg`}
                alt={s.label}
                title={s.label}
                width={26}
                height={26}
                loading="lazy"
                className="h-[26px] w-[26px] opacity-80 transition hover:opacity-100"
              />
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-600 sm:text-left">
          Icônes de marques : thesvg.org · Propulsé par Vite + React + Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
