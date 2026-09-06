import { Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import TipPage from "./pages/TipPage";
import About from "./pages/About";
import Admin from "./pages/Admin";

function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="text-7xl font-black text-redhot-500">404</p>
      <p className="mt-3 text-bone-500">Cette page s'est envolée.</p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-redhot-500 px-5 py-2.5 font-semibold text-white hover:bg-redhot-600">
        Retour à l'accueil
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/astuce/:slug" element={<TipPage />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
