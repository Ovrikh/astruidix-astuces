import type { Tip, TipMeta, TipsIndex } from "../types";

const REPO = "Ovrikh/astruidix-astuces";
const DATA_DIR = "public/data/astuces";
const BRANCH = "main";
/** Domaines autorisés pour les images référencées dans les .md */
const ALLOWED_IMG_HOSTS = ["raw.githubusercontent.com", "user-images.githubusercontent.com", "github.com"];

const SITE = import.meta.env.BASE_URL.replace(/\/$/, "");

/**
 * Charge les données d'abord depuis GitHub raw : une astuce publiée via /admin
 * apparaît immédiatement, sans attendre un redéploiement. Repli sur la copie
 * embarquée du site si GitHub est indisponible.
 */
async function fetchWithFallback(rawPath: string, bundledPath: string): Promise<Response> {
  try {
    const res = await fetch(rawPath, { cache: "no-store" });
    if (res.ok) return res;
  } catch {
    /* réseau bloqué → repli */
  }
  return fetch(bundledPath);
}

const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/data/astuces`;

export async function fetchIndex(): Promise<TipsIndex> {
  const res = await fetchWithFallback(`${RAW}/index.json`, `${SITE}/data/astuces/index.json`);
  if (!res.ok) throw new Error(`Index indisponible (${res.status})`);
  return res.json();
}

export async function fetchTip(slug: string): Promise<Tip> {
  const idx = await fetchIndex();
  const meta = idx.tips.find((t) => t.slug === slug);
  if (!meta) throw new Error("Astuce introuvable");
  const res = await fetchWithFallback(`${RAW}/${slug}.md`, `${SITE}/data/astuces/${slug}.md`);
  if (!res.ok) throw new Error(`Contenu indisponible (${res.status})`);
  const content = await res.text();
  return { ...meta, content };
}

/** Rend l'URL d'une image de l'astuce sûre à afficher (sinon null). */
export function safeImageUrl(url: string): string | null {
  try {
    const u = new URL(url, window.location.origin);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!ALLOWED_IMG_HOSTS.includes(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export const PUBLISH_HELP = `Écrivez en Markdown (titres, listes, code…). Images : hébergez-les via un commentaire sur une issue GitHub, puis utilisez leur lien raw.githubusercontent.com. L'icône de marque se choisit dans le champ prévu (bibliothèque thesvg.org).`;

interface PublishArgs {
  token: string;
  meta: TipMeta;
  markdown: string;
  existingSlugs: string[];
}

/** Publie l'astuce : 2 commits — le .md puis l'index.json régénéré. */
export async function publishTip({ token, meta, markdown, existingSlugs }: PublishArgs): Promise<string> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const api = (path: string, init?: RequestInit) =>
    fetch(`https://api.github.com${path}`, { ...init, headers: { ...headers, ...init?.headers } });

  // 0. Refuse un slug déjà pris
  if (existingSlugs.includes(meta.slug)) {
    throw new Error(`Le slug "${meta.slug}" existe déjà, choisissez-en un autre.`);
  }

  // 1. SHA courant de la branche main
  const refRes = await api(`/repos/${REPO}/git/ref/heads/${BRANCH}`);
  if (!refRes.ok) throw new Error("Impossible de lire la branche (token invalide ?)");
  const ref = (await refRes.json()) as { object: { sha: string } };

  // 2. SHA de l'arbre et de l'index.json existant
  const treeRes = await api(`/repos/${REPO}/git/trees/${ref.object.sha}?recursive=1`);
  if (!treeRes.ok) throw new Error("Impossible de lire l'arbre du dépôt");
  const tree = (await treeRes.json()) as {
    tree: Array<{ path: string; sha: string | null }>;
  };
  const indexPath = `${DATA_DIR}/index.json`;
  const entry = tree.tree.find((e) => e.path === indexPath);
  const baseTree = ref.object.sha;

  // 3. Nouveau tree : ajout du .md + remplacement de index.json
  const newTreeRes = await api(`/repos/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTree,
      tree: [
        { path: `${DATA_DIR}/${meta.slug}.md`, mode: "100644", type: "blob", content: markdown },
        { path: indexPath, mode: "100644", type: "blob", sha: entry?.sha ?? null },
      ],
    }),
  });
  if (!newTreeRes.ok) throw new Error(`Création de l'arbre refusée : ${await newTreeRes.text()}`);
  const newTree = (await newTreeRes.json()) as { sha: string };

  // 4. Commit + avance de main
  const commitRes = await api(`/repos/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: `astuce: ${meta.title}`,
      tree: newTree.sha,
      parents: [ref.object.sha],
    }),
  });
  if (!commitRes.ok) throw new Error(`Commit refusé : ${await commitRes.text()}`);
  const commit = (await commitRes.json()) as { sha: string };

  const updateRes = await api(`/repos/${REPO}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });
  if (!updateRes.ok) throw new Error(`Mise à jour de la branche refusée : ${await updateRes.text()}`);

  return commit.sha;
}
