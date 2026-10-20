import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Article, CategoryType } from '../models/article';

interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  /** JSON-LD personnalisé (ex. Person / ProfilePage) injecté tel quel. */
  jsonLd?: Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {

  constructor(
    private meta: Meta, 
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {}

  updateSEO(data: SEOData): void {
    // Title
    this.title.setTitle(data.title);
    this.updateMetaTag('title', data.title);

    // Description
    this.updateMetaTag('description', data.description);

    // Keywords
    if (data.keywords?.length) {
      this.updateMetaTag('keywords', data.keywords.join(', '));
    }

    // Image OG par défaut (aperçu de partage LinkedIn / Twitter)
    const ogImage = data.image || '/og-cybergarage.png';

    // Open Graph
    this.updateMetaTag('property="og:title"', data.title);
    this.updateMetaTag('property="og:description"', data.description);
    this.updateMetaTag('property="og:type"', data.type || 'website');
    this.updateMetaTag('property="og:site_name"', 'CyberGarage - Geoffrey Aubert');
    this.updateMetaTag('property="og:image"', ogImage);
    this.updateMetaTag('property="og:image:alt"', data.title);

    if (data.url) {
      this.updateMetaTag('property="og:url"', data.url);
    }

    // Twitter Cards
    this.updateMetaTag('name="twitter:card"', 'summary_large_image');
    this.updateMetaTag('name="twitter:title"', data.title);
    this.updateMetaTag('name="twitter:description"', data.description);
    this.updateMetaTag('name="twitter:image"', ogImage);

    // Article specific meta
    if (data.type === 'article') {
      this.updateMetaTag('property="article:author"', data.author || 'CyberGarage Team');
      
      if (data.publishedDate) {
        this.updateMetaTag('property="article:published_time"', data.publishedDate);
      }
      
      if (data.modifiedDate) {
        this.updateMetaTag('property="article:modified_time"', data.modifiedDate);
      }
    }

    // Structured data for rich snippets
    this.updateStructuredData(data);
  }

  updateHomeSEO(): void {
    this.updateSEO({
      title: 'CyberGarage - Tech Engineering Hub | Articles Techniques & Innovations',
      description: 'Découvrez CyberGarage : votre destination pour l\'ingénierie moderne. Articles techniques sur l\'automobile, développement, cybersécurité, FPGA, mécanique et électronique.',
      keywords: [
        'ingénierie', 'technologie', 'automobile', 'développement logiciel',
        'cybersécurité', 'FPGA', 'mécanique', 'électronique', 'innovation',
        'articles techniques', 'ByteByteGo', 'engineering'
      ],
      type: 'website',
      url: '/',
      image: '/assets/images/cybergarage-og.jpg'
    });
  }

  updateCategorySEO(categoryType: CategoryType, categoryName: string, description: string): void {
    this.updateSEO({
      title: `${categoryName} - Articles Techniques | CyberGarage`,
      description: `${description}. Découvrez nos articles techniques et guides pratiques sur ${categoryName.toLowerCase()}.`,
      keywords: this.getCategoryKeywords(categoryType),
      type: 'website',
      url: `/${categoryType}`,
      image: `/assets/images/categories/${categoryType}-og.jpg`
    });
  }

  updateArticleSEO(article: Article, url: string): void {
    this.updateSEO({
      title: `${article.title} | CyberGarage`,
      description: article.seoMetadata.description || article.summary,
      keywords: article.seoMetadata.keywords,
      type: 'article',
      url: url,
      image: article.imageUrl || `/assets/images/categories/${article.category}-default.jpg`,
      author: article.author,
      publishedDate: article.publishedDate.toISOString(),
      modifiedDate: article.lastModified.toISOString()
    });
  }

  private updateMetaTag(selector: string, content: string): void {
    if (selector.includes('=')) {
      // Pour les attributs comme property="og:title"
      const [attr, value] = selector.split('=');
      const cleanValue = value.replace(/"/g, '');
      this.meta.updateTag({ [attr]: cleanValue, content: content });
    } else {
      // Pour les attributs simples comme name="description"
      this.meta.updateTag({ name: selector, content: content });
    }
  }

  private updateStructuredData(data: SEOData): void {
    // Ne fonctionne que côté browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Supprimer l'ancien structured data s'il existe
    const existingScript = this.document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    let structuredData: any;

    if (data.jsonLd) {
      // JSON-LD fourni explicitement par la page (ex. Person / ProfilePage)
      structuredData = data.jsonLd;
    } else if (data.type === 'article') {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        author: {
          '@type': 'Organization',
          name: data.author || 'CyberGarage Team'
        },
        publisher: {
          '@type': 'Organization',
          name: 'CyberGarage',
          logo: {
            '@type': 'ImageObject',
            url: '/assets/images/logo.png'
          }
        },
        datePublished: data.publishedDate,
        dateModified: data.modifiedDate,
        image: data.image,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url
        }
      };
    } else {
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'CyberGarage',
        description: 'Tech Engineering Hub - Articles techniques et innovations',
        url: 'https://cybergarage.tech',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://cybergarage.tech/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      };
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    this.document.head.appendChild(script);
  }

  private getCategoryKeywords(category: CategoryType): string[] {
    const keywordMap: Record<CategoryType, string[]> = {
      [CategoryType.AUTOMOBILE]: [
        'automobile', 'véhicule électrique', 'innovation auto', 'technologie automobile',
        'moteur', 'batterie', 'conduite autonome', 'automotive'
      ],
      [CategoryType.DEV_INFO]: [
        'développement logiciel', 'programmation', 'architecture logicielle', 'craftsmanship',
        'system design', 'microservices', 'API', 'scalabilité', 'clean code',
        'base de données', 'soft skills', 'software engineering'
      ],
      [CategoryType.IA_MASTER]: [
        'intelligence artificielle', 'IA', 'LLM', 'IA générative', 'machine learning',
        'deep learning', 'prompt engineering', 'RAG', 'agents IA', 'MLOps'
      ],
      [CategoryType.CYBERSECURITY]: [
        'cybersécurité', 'sécurité informatique', 'ethical hacking', 'zero trust',
        'cryptographie', 'réseau sécurisé', 'pentest', 'security'
      ],
      [CategoryType.FPGA]: [
        'FPGA', 'systèmes embarqués', 'VHDL', 'Verilog', 'programmation hardware',
        'embedded systems', 'microcontrôleur', 'IoT'
      ],
      [CategoryType.MECHANICAL]: [
        'ingénierie mécanique', 'conception mécanique', 'CAO', 'matériaux',
        'thermodynamique', 'mécanique des fluides', 'design industriel'
      ],
      [CategoryType.ELECTRONICS]: [
        'électronique', 'circuits électroniques', 'PCB', 'composants électroniques',
        'analyse de signaux', 'electronique analogique', 'électronique numérique'
      ],
      [CategoryType.PRAGMATIC]: [
        'bonnes pratiques', 'ingénierie pragmatique', 'méthodologie', 'leadership',
        'gestion de projet', 'architecture système', 'code quality', 'soft skills', 'best practices'
      ],
        // Ces trois categories avaient des articles et une route mais aucune
        // entree dans CategoryType : l'y ajouter les rend obligatoires ici.
        [CategoryType.HPC]: [
          'calcul haute performance', 'HPC', 'GPU', 'CUDA', 'calcul parallele',
          'optimisation', 'bande passante memoire', 'supercalculateur'
        ],
        [CategoryType.TELECOM]: [
          'telecommunications', 'reseaux', '5G', '6G', 'IoT', 'objets connectes',
          'protocoles reseau', 'Bluetooth', 'radio'
        ],
        [CategoryType.SIMULATION]: [
          'simulation', 'modelisation numerique', 'simulation physique',
          'analyse predictive', 'jumeau numerique', 'validation de modele'
        ]
    };

    return keywordMap[category] || [];
  }
}