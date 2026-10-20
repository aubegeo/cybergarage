import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ArticlesService, ArticleLocal, Category } from '../../shared/services/articles.service';
import { SeoService } from '../../shared/services/seo';
import { CategoryType } from '../../shared/models/article';

/**
 * Page de catégorie, unique pour les 11 catégories.
 *
 * POURQUOI ce composant existe. Avant lui, 6 catégories avaient un composant
 * dédié dont les « articles à la une » étaient écrits EN DUR dans le template,
 * donc figés et déjà faux, et 5 n'avaient aucun composant : leur route faisait
 * un loadChildren vers un @NgModule vide issu d'un ng generate module jamais
 * terminé. Résultat mesuré le 2026-10-20 : les 11 pages ne contenaient AUCUN
 * lien d'article dans leur HTML prérendu, alors que /blog en contient 19. Un
 * robot explorant /pragmatic voyait une page sans issue.
 *
 * SOURCE DE VÉRITÉ : ArticlesService, qui lit les fichiers Markdown via
 * ARTICLE_CATALOG. Surtout PAS ArticleService (singulier), dont
 * loadSampleArticles() ne contient que 3 articles de démonstration codés en
 * dur — une première version de ce composant l'utilisait, et les pages
 * affichaient « Articles (0) » partout sauf sur les 3 catégories de ces
 * exemples. La page d'article documente déjà cette distinction.
 *
 * Les textes de catégorie (nom, description, icône, couleur) viennent du
 * categoryConfig du service, qui couvre les 11, plutôt que d'être dupliqués
 * ici. Seuls l'introduction et la liste de sujets sont éditoriaux et locaux.
 */
interface Editorial {
  readonly intro: string;
  readonly sujets: readonly string[];
}

const EDITORIAL: Readonly<Record<string, Editorial>> = {
  'automobile': {
    intro: "Motorisations, électrification et aides à la conduite, vus du côté de ce qui est mesurable plutôt que de ce qui est annoncé.",
    sujets: ['Véhicules électriques et hybrides', 'Diagnostic et codes défaut', 'Entretien et pannes courantes', 'Aides à la conduite'],
  },
  'dev-info': {
    intro: "Le développement n'est pas qu'écrire du code, c'est un artisanat. Conception de systèmes robustes, code propre, et les pratiques qui séparent « ça marche » de « ça tient dans le temps ».",
    sujets: ['System Design (scalabilité, cache, files, bases)', 'Clean Code & Clean Architecture', 'Design patterns & refactoring', 'Microservices & architecture hexagonale', 'Tests et qualité logicielle'],
  },
  'ia-master': {
    intro: "Ce que les modèles de langage changent réellement au métier, et ce qu'ils cassent. Harnais d'agents, limites mesurées, lecture critique des annonces.",
    sujets: ["Harnais et outillage d'agents", 'Modèles locaux et coûts réels', 'IA générative et emploi', 'Lecture critique des études'],
  },
  'cybersecurity': {
    intro: "La sécurité telle que les spécifications la définissent, pas telle que les tutoriels la résument. Ce que disent vraiment les RFC et les référentiels.",
    sujets: ['OWASP Top 10', 'OAuth 2.0 et OpenID Connect', 'JSON Web Tokens (RFC 7519)', 'Architecture Zero Trust'],
  },
  'fpga': {
    intro: "Les contraintes de l'embarqué, mémoire finie et temps borné, produisent des réflexes dont le développement applicatif aurait besoin.",
    sujets: ['Conception de circuits FPGA', 'RTOS et ordonnancement temps réel', 'Traitement vidéo temps réel', "Leçons de l'embarqué pour l'applicatif"],
  },
  'mechanical': {
    intro: "Les normes spatiales chiffrent ce que le logiciel laisse implicite : marges, vérification, qualification. Des référentiels transposables bien au-delà de la mécanique.",
    sujets: ['Ingénierie système (NASA SE Handbook)', 'Vérification, qualification, certification', 'Matériaux et corrosion (ECSS)', 'Marges de sécurité structurale'],
  },
  'electronics': {
    intro: "Ce que les spécifications matérielles garantissent réellement, et les pièges de conception que les vérificateurs automatiques attrapent, ou pas.",
    sujets: ['USB4 et USB Power Delivery', 'Bluetooth et mesure de distance', 'Conception et vérification de PCB', 'Circuits de puissance'],
  },
  'pragmatic': {
    intro: "Les conventions qui font gagner du temps à l'échelle d'une équipe, et les constats de terrain sur l'évolution du métier. Rien qui ne soit vérifiable.",
    sujets: ['Semantic Versioning', 'Conventional Commits', 'Outillage et harnais de développement', "Ce que la GenAI change pour les devs"],
  },
  'hpc': {
    intro: "Où passe réellement le temps d'un calcul, et pourquoi la bande passante mémoire décide plus souvent que la puissance brute.",
    sujets: ['Optimisation GPU', 'Calcul parallèle', 'Bande passante et goulots', 'Architectures haute performance'],
  },
  'telecom': {
    intro: "Les protocoles qui portent les réseaux modernes, lus dans leurs spécifications plutôt que dans les communiqués des équipementiers.",
    sujets: ['5G et 6G', 'Objets connectés', 'Protocoles de communication', 'Réseaux avancés'],
  },
  'simulation': {
    intro: "Ce qu'un modèle numérique garantit et ce qu'il suppose, parce qu'une simulation convaincante dont une hypothèse est fausse coûte plus cher que pas de simulation.",
    sujets: ['Modélisation numérique', 'Simulation physique', 'Analyse prédictive', 'Validation de modèles'],
  },
};

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    '[style.--cat-accent]': 'couleur',
    '[style.--cat-accent-2]': 'couleur',
  },
  template: `
    <div class="category-page">
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="material-icons">{{ info?.icon || 'article' }}</i>
          </div>
          <div class="header-text">
            <h1>{{ info?.name || 'Catégorie' }}</h1>
            <p class="page-description">{{ info?.description }}</p>
          </div>
        </div>
      </header>

      <main class="page-content">
        <div class="content-grid">
          <div class="info-card" *ngIf="editorial">
            <h2>À propos de cette section</h2>
            <p>{{ editorial.intro }}</p>
            <h3>Sujets abordés :</h3>
            <ul>
              <li *ngFor="let sujet of editorial.sujets">{{ sujet }}</li>
            </ul>
          </div>

          <div class="articles-preview">
            <h2>Articles ({{ articles.length }})</h2>
            <div class="article-grid" *ngIf="articles.length; else vide">
              <a class="article-card" *ngFor="let article of articles"
                 [routerLink]="['/article', categorie, article.slug]">
                <h3>{{ article.title }}</h3>
                <p>{{ article.summary }}</p>
                <span class="article-tag">{{ article.readTime }} min de lecture</span>
              </a>
            </div>
            <ng-template #vide>
              <p>Aucun article publié dans cette catégorie pour l'instant.</p>
            </ng-template>
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
  private readonly articlesService = inject(ArticlesService);
  private readonly seo = inject(SeoService);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Lue dans les `data` de la route et non dans l'URL : le prérendu ne passe
   *  pas par le navigateur, où `location` serait la seule autre source. */
  readonly categorie: string = this.route.snapshot.data['category'] ?? '';
  readonly editorial: Editorial | undefined = EDITORIAL[this.categorie];

  articles: ArticleLocal[] = [];
  info?: Category;
  couleur = '#4ECDC4';

  ngOnInit(): void {
    if (!this.categorie) return;

    this.articlesService.getCategoryById(this.categorie).subscribe(cat => {
      if (cat) {
        this.info = cat;
        // Category.color est optionnel dans le service : on garde le repli.
        this.couleur = cat.color ?? this.couleur;
        this.seo.updateCategorySEO(this.categorie as CategoryType, cat.name, cat.description);
      }
      // markForCheck() est indispensable : l'application tourne SANS zone.js,
      // donc une affectation de champ dans un callback asynchrone ne déclenche
      // aucun rendu. Même raison que dans blog.component.ts.
      this.cdr.markForCheck();
    });

    this.articlesService.getArticlesByCategory(this.categorie).subscribe(list => {
      this.articles = [...list].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      this.cdr.markForCheck();
    });
  }
}
