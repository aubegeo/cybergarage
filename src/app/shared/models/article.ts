export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  publishedDate: Date;
  lastModified: Date;
  category: CategoryType;
  tags: string[];
  readTimeMinutes: number;
  featured: boolean;
  imageUrl?: string;
  seoMetadata: {
    description: string;
    keywords: string[];
  };
}

export enum CategoryType {
  AUTOMOBILE = 'automobile',
  DEV_INFO = 'dev-info',
  IA_MASTER = 'ia-master',
  CYBERSECURITY = 'cybersecurity',
  FPGA = 'fpga',
  MECHANICAL = 'mechanical',
  ELECTRONICS = 'electronics',
  PRAGMATIC = 'pragmatic',
  // Ajoutees le 2026-10-20 : ces 3 categories avaient des articles, un dossier
  // dans src/assets/articles/ et une route, mais pas d'entree ici — si bien que
  // getArticlesByCategory() ne pouvait meme pas etre appele pour elles.
  HPC = 'hpc',
  TELECOM = 'telecom',
  SIMULATION = 'simulation'
}

export interface ArticleMetadata {
  totalCount: number;
  categories: { [key in CategoryType]: number };
  latestArticles: Article[];
}
