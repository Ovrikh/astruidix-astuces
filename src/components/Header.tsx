import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-redhot-500 font-black text-white shadow-lg shadow-redhot-500/25 transition group-hover:rotate-6">
            A
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Astruidix <span className="text-redhot-500">Astuces</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 transition hover:bg-ink-800 ${
                isActive ? "text-redhot-400" : "text-bone-300"
              }`
            }
          >
            Accueil
          </NavLink>
          <NavLink
            to="/a-propos"
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 transition hover:bg-ink-800 ${
                isActive ? "text-redhot-400" : "text-bone-300"
              }`
            }
          >
            À propos
          </NavLink>
          <a
            href="https://github.com/Ovrikh/astruidix-astuces"
            target="_blank"
            rel="noopener"
            className="ml-1 flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-2 text-bone-300 transition hover:border-redhot-500 hover:text-white"
          >
            <i className="bi bi-github" aria-hidden="true" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
