export interface TipMeta {
  /** Identifiant unique (aussi nom du fichier sans .md), ex : "optimiser-images-web" */
  slug: string;
  title: string;
  /** Nom de catégorie affiché, ex : "Web", "Linux", "Android" */
  category: string;
  /** Slug validé dans le catalogue officiel theSVG. */
  icon?: string;
  /** "aaaa-mm-jj" */
  date: string;
  /** Résumé court affiché sur la carte */
  excerpt?: string;
}

export interface Tip extends TipMeta {
  content: string;
}

export interface TipsIndex {
  /** Dernier commit SHA de data/astuces — nécessaire pour l'API GitHub côté /admin */
  sha?: string;
  tips: TipMeta[];
}
