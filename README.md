# Astruidix Astuces 🧭

**Des astuces tech, claires et testées** — site inspiré de l'architecture de [movix.men](https://movix.men) (Vite + React + Tailwind mode sombre), avec des icônes de marques de [thesvg.org](https://thesvg.org).

🌐 **En ligne** : https://ovrikh.github.io/astruidix-astuces/

## Stack

| Technologie | Rôle |
|---|---|
| **Vite 7** | Build (comme movix.men) |
| **React 19 + React Router 7** | SPA multi-pages |
| **Tailwind CSS 4** | Thème sombre rouge/noir/blanc |
| **TypeScript** strict | Typage complet |
| **react-markdown + GFM** | Rendu des astuces |
| **Bootstrap Icons** | Icônes d'interface (comme movix) |
| **thesvg.org** | Icônes de marques (`/icons/<brand>/default.svg`) |
| **GitHub Pages + Actions** | Déploiement automatique |

## ✍️ Publier une astuce (sans toucher au code)

1. Ouvrir `/admin` sur le site
2. Coller un **fine-grained PAT** GitHub : limite au dépôt `astruidix-astuces`, permission **Contents: Read and write** (le token ne quitte pas le navigateur)
3. Écrire en Markdown : titre, catégorie, icône de marque, résumé, aperçu en direct
4. Cliquer **🚀 Publier** → l'astuce est commitée dans `data/astuces/`, le site se redéploie automatiquement

Les astuces sont de simples fichiers `.md` + un `index.json` dans `data/astuces/` — versionnés, sans base de données.

## Développement local

```bash
npm install
npm run dev      # serveur de dev
npm run build    # build de production dans dist/
```

## Structure

```
├── data/astuces/        # Les astuces (markdown + index.json)
├── src/
│   ├── components/      # Header, Footer, TipCard, Markdown
│   ├── pages/           # Home, TipPage, About, Admin
│   └── lib/api.ts       # Chargement + publication via l'API GitHub
└── .github/workflows/   # Déploiement Pages automatique
```
