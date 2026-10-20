import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { ArticleService } from '../../shared/services/article';
import { SeoService } from '../../shared/services/seo';
import { CategoryType } from '../../shared/models/article';

/**
 * Page de catégorie, unique pour les 11 catégories.
 *
 * POURQUOI ce composant existe. Avant lui, 6 catégories avaient un composant
 * dédié dont les « articles à la une » étaient écrits EN DUR dans le template
 * (donc figés, et déjà faux), et 5 n'avaient aucun composant du tout : leur
 * route chargeait un `@NgModule` vide issu d'un `ng generate module` jamais
 * terminé. Résultat mesuré le 2026-10-20 : les 11 pages de catégorie ne
 * contenaient AUCUN lien d'article dans leur HTML prérendu, alors que `/blog`
 * en contenait 19. Un robot explorant /pragmatic voyait donc une page sans
 * issue, ce qui nuit à l'indexation de tout ce qui n'est pas lié ailleurs.
 *
 * Les 6 feuilles de style ne différaient que par la couleur d'accent, en
 * quatre endroits : elles sont remplacées par une seule, paramétrée par les
 * variables CSS posées ci-dessous.
 */
interface CategoryConfig {
  readonly titre: string;
  readonly description: string;
  readonly icone: string;
  readonly accent: string;
  readonly accent2: string;
  readonly intro: string;
  readonly sujets: readonly string[];
}

/** Les textes des 6 catégories qui avaient un composant sont repris tels quels. */
const CATEGORIES: Readonly<Record<string, CategoryConfig>> = {
  'automobile': {
    titre: 'Automobile & Mobilité',
    description: 'Véhicules électriques, mobilité autonome et innovations automobiles',
    icone: 'directions_car', accent: '#FF6B35', accent2: '#E74C3C',
    intro: "Motorisations, électrification et aides à la conduite, vus du côté de ce qui est mesurable plutôt que de ce qui est annoncé.",
    sujets: ['Véhicules électriques et hybrides', 'Diagnostic et codes défaut', 'Entretien et pannes courantes', 'Aides à la conduite'],
  },
  'dev-info': {
    titre: 'Artisan Développeur',
    description: 'Craftsmanship logiciel, System Design, bonnes pratiques et soft skills du développeur',
    icone: 'code', accent: '#4ECDC4', accent2: '#45B7AF',
    intro: "Le développement n'est pas qu'écrire du code : c'est un artisanat. Conception de systèmes robustes, code propre, et les pratiques qui font la différence entre « ça marche » et « ça tient dans le temps ».",
    sujets: ['System Design (scalabilité, cache, files, bases)', 'Clean Code & Clean Architecture', 'Design patterns & refactoring', 'Microservices & architecture hexagonale', 'Tests et qualité logicielle'],
  },
  'ia-master': {
    titre: 'IA Master',
    description: "Intelligence artificielle, LLM et IA générative appliquée au développement",
    icone: 'smart_toy', accent: '#6C5CE7', accent2: '#5F51D8',
    intro: "Ce que les modèles de langage changent réellement au métier, et ce qu'ils cassent. Harnais d'agents, limites mesurées, et lecture critique des annonces.",
    sujets: ["Harnais et outillage d'agents", 'Modèles locaux et coûts réels', 'IA générative et emploi', 'Lecture critique des études'],
  },
  'cybersecurity': {
    titre: 'Cybersécurité',
    description: 'Sécurité applicative, standards et spécifications : OWASP, OAuth 2.0, JWT, Zero Trust',
    icone: 'security', accent: '#C0392B', accent2: '#A93226',
    intro: "La sécurité telle que les spécifications la définissent, pas telle que les tutoriels la résument. Ce que disent vraiment les RFC et les référentiels.",
    sujets: ['OWASP Top 10', 'OAuth 2.0 et OpenID Connect', 'JSON Web Tokens (RFC 7519)', 'Architecture Zero Trust'],
  },
  'fpga': {
    titre: 'FPGA & Embarqué',
    description: "FPGA, temps réel et systèmes embarqués : ce que l'embarqué réapprend au développement applicatif",
    icone: 'memory', accent: '#16A085', accent2: '#138D75',
    intro: "Les contraintes de l'embarqué — mémoire finie, temps borné, pas de seconde chance — produisent des réflexes dont le développement applicatif aurait besoin.",
    sujets: ['Conception de circuits FPGA', 'RTOS et ordonnancement temps réel', 'Traitement vidéo temps réel', "Leçons de l'embarqué pour l'applicatif"],
  },
  'mechanical': {
    titre: 'Ingénierie Mécanique & Système',
    description: 'Ingénierie système et normes : les référentiels NASA et ECSS appliqués aux projets complexes',
    icone: 'precision_manufacturing', accent: '#7F8C8D', accent2: '#6C7A7B',
    intro: "Les normes spatiales chiffrent ce que le logiciel laisse implicite : marges, vérification, qualification. Des référentiels transposables bien au-delà de la mécanique.",
    sujets: ["Ingénierie système (NASA SE Handbook)", 'Vérification, qualification, certification', 'Matériaux et corrosion (ECSS)', 'Marges de sécurité structurale'],
  },
  'electronics': {
    titre: 'Électronique',
    description: 'Spécifications matérielles et conception : USB4, Bluetooth, PCB et circuits de puissance',
    icone: 'developer_board', accent: '#F39C12', accent2: '#D68910',
    intro: "Ce que les spécifications matérielles garantissent réellement, et les pièges de conception que les vérificateurs automatiques attrapent — ou pas.",
    sujets: ['USB4 et USB Power Delivery', 'Bluetooth et mesure de distance', 'Conception et vérification de PCB', 'Circuits de puissance'],
  },
  'pragmatic': {
    titre: 'Pragmatique',
    description: "Pratiques de terrain et conventions : versionnage, commits, outillage, et ce que l'IA change au métier",
    icone: 'build', accent: '#2980B9', accent2: '#2471A3',
    intro: "Les conventions qui font gagner du temps à l'échelle d'une équipe, et les constats de terrain sur l'évolution du métier. Rien qui ne soit vérifiable.",
    sujets: ['Semantic Versioning', 'Conventional Commits', 'Outillage et harnais de développement', "Ce que la GenAI change pour les devs"],
  },
  'hpc': {
    titre: 'Calcul Haute Performance (HPC)',
    description: 'Optimisation GPU, calcul parallèle et architectures haute performance',
    icone: 'speed', accent: '#8E44AD', accent2: '#9B59B6',
    intro: "Où passe réellement le temps d'un calcul, et pourquoi la bande passante mémoire décide plus souvent que la puissance brute.",
    sujets: ['Optimisation GPU', 'Calcul parallèle', 'Bande passante et goulots', 'Architectures haute performance'],
  },
  'telecom': {
    titre: 'Télécommunications',
    description: 'Réseaux avancés, 5G/6G, IoT et protocoles de communication',
    icone: 'signal_cellular_alt', accent: '#E74C3C', accent2: '#CB4335',
    intro: "Les protocoles qui portent les réseaux modernes, lus dans leurs spécifications plutôt que dans les communiqués des équipementiers.",
    sujets: ['5G et 6G', 'Objets connectés', 'Protocoles de communication', 'Réseaux avancés'],
  },
  'simulation': {
    titre: 'Simulation & Modélisation',
    description: 'Modélisation numérique, simulation physique et analyse prédictive',
    icone: 'timeline', accent: '#27AE60', accent2: '#229954',
    intro: "Ce qu'un modèle numérique garantit et ce qu'il suppose, parce qu'une simulation convaincante dont une hypothèse est fausse coûte plus cher que pas de simulation.",
    sujets: ['Modélisation numérique', 'Simulation physique', 'Analyse prédictive', 'Validation de modèles'],
  },
};

const PAR_DEFAUT: CategoryConfig = {
  titre: 'Catégorie', description: 'Articles de cette catégorie',
  icone: 'article', accent: '#4ECDC4', accent2: '#45B7AF',
  intro: '', sujets: [],
};

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    '[style.--cat-accent]': 'config.accent',
    '[style.--cat-accent-2]': 'config.accent2',
  },
  template: `
    <div class="category-page">
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="material-icons">{{ config.icone }}</i>
          </div>
          <div class="header-text">
            <h1>{{ config.titre }}</h1>
            <p class="page-description">{{ config.description }}</p>
          </div>
        </div>
      </header>

      <main class="page-content">
        <div class="content-grid">
          @if (config.intro) {
            <div class="info-card">
              <h2>À propos de cette section</h2>
              <p>{{ config.intro }}</p>
              @if (config.sujets.length) {
                <h3>Sujets abordés :</h3>
                <ul>
                  @for (sujet of config.sujets; track sujet) {
                    <li>{{ sujet }}</li>
                  }
                </ul>
              }
            </div>
          }

          <div class="articles-preview">
            <h2>Articles ({{ articles().length }})</h2>
            @if (articles().length) {
              <div class="article-grid">
                @for (article of articles(); track article.slug) {
                  <a class="article-card" [routerLink]="['/article', categorie, article.slug]">
                    <h3>{{ article.title }}</h3>
                    <p>{{ article.summary }}</p>
                    <span class="article-tag">{{ article.readTimeMinutes }} min de lecture</span>
                  </a>
                }
              </div>
            } @else {
              <p>Aucun article publié dans cette catégorie pour l'instant.</p>
            }
          </div>
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './category-page.component.scss',
})
export class CategoryPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);
  private readonly seo = inject(SeoService);

  /** Lue dans les `data` de la route, pas dans l'URL : le prérendu ne passe pas
   *  par le navigateur et une lecture de `location` y serait vide. */
  readonly categorie: string = this.route.snapshot.data['category'] ?? '';
  readonly config: CategoryConfig = CATEGORIES[this.categorie] ?? PAR_DEFAUT;

  /** `toSignal` plutôt que le pipe `async` : le rendu devient piloté par signal,
   *  ce qui fonctionne par construction en mode zoneless. */
  readonly articles = toSignal(
    this.categorie
      ? this.articleService.getArticlesByCategory(this.categorie as CategoryType)
      : of([]),
    { initialValue: [] },
  );

  ngOnInit(): void {
    if (!this.categorie) return;
    this.seo.updateCategorySEO(
      this.categorie as CategoryType,
      this.config.titre,
      this.config.description,
    );
  }
}
