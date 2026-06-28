import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Article, ArticleMetadata, CategoryType } from '../models/article';
import { marked } from 'marked';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private articlesSubject = new BehaviorSubject<Article[]>([]);
  public articles$ = this.articlesSubject.asObservable();

  constructor() {
    // Configuration de marked pour le parsing Markdown
    marked.setOptions({
      gfm: true,
      breaks: true
    });
    this.loadSampleArticles();
  }

  getArticles(): Observable<Article[]> {
    return this.articles$;
  }

  getArticlesByCategory(category: CategoryType): Observable<Article[]> {
    return this.articles$.pipe(
      map(articles => articles.filter(article => article.category === category))
    );
  }

  getArticleBySlug(slug: string): Observable<Article | undefined> {
    return this.articles$.pipe(
      map(articles => articles.find(article => article.slug === slug))
    );
  }

  getFeaturedArticles(limit: number = 6): Observable<Article[]> {
    return this.articles$.pipe(
      map(articles => articles.filter(article => article.featured).slice(0, limit))
    );
  }

  getLatestArticles(limit: number = 5): Observable<Article[]> {
    return this.articles$.pipe(
      map(articles => 
        articles
          .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
          .slice(0, limit)
      )
    );
  }

  getArticleMetadata(): Observable<ArticleMetadata> {
    return this.articles$.pipe(
      map(articles => {
        const categories = {} as { [key in CategoryType]: number };
        Object.values(CategoryType).forEach(category => {
          categories[category] = articles.filter(article => article.category === category).length;
        });

        return {
          totalCount: articles.length,
          categories,
          latestArticles: articles
            .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
            .slice(0, 3)
        };
      })
    );
  }

  searchArticles(query: string): Observable<Article[]> {
    const searchTerm = query.toLowerCase();
    return this.articles$.pipe(
      map(articles => 
        articles.filter(article => 
          article.title.toLowerCase().includes(searchTerm) ||
          article.summary.toLowerCase().includes(searchTerm) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      )
    );
  }

  parseMarkdown(content: string): string {
    const result = marked(content);
    return typeof result === 'string' ? result : '';
  }

  private loadSampleArticles(): void {
    // Articles d'exemple pour chaque catégorie
    const sampleArticles: Article[] = [
      {
        id: '1',
        title: 'Les véhicules électriques et l\'avenir de l\'automobile',
        slug: 'vehicules-electriques-avenir-automobile',
        summary: 'Exploration des technologies émergentes dans l\'industrie automobile électrique.',
        content: this.getSampleMarkdownContent('automobile'),
        author: 'CyberGarage Team',
        publishedDate: new Date('2024-12-01'),
        lastModified: new Date('2024-12-01'),
        category: CategoryType.AUTOMOBILE,
        tags: ['électrique', 'batterie', 'innovation'],
        readTimeMinutes: 8,
        featured: true,
        imageUrl: '/assets/images/electric-car.jpg',
        seoMetadata: {
          description: 'Découvrez les dernières innovations en matière de véhicules électriques',
          keywords: ['véhicule électrique', 'automobile', 'technologie']
        }
      },
      {
        id: '2',
        title: 'Architecture Microservices : Guide Complet',
        slug: 'architecture-microservices-guide-complet',
        summary: 'Tout ce qu\'il faut savoir sur l\'architecture microservices, style ByteByteGo.',
        content: this.getSampleMarkdownContent('dev-info'),
        author: 'CyberGarage Team',
        publishedDate: new Date('2024-11-28'),
        lastModified: new Date('2024-11-28'),
        category: CategoryType.DEV_INFO,
        tags: ['microservices', 'architecture', 'scalabilité'],
        readTimeMinutes: 12,
        featured: true,
        imageUrl: '/assets/images/microservices.jpg',
        seoMetadata: {
          description: 'Guide complet sur l\'architecture microservices',
          keywords: ['microservices', 'architecture', 'développement']
        }
      },
      {
        id: '3',
        title: 'Sécurité Zero Trust : Concepts et Implémentation',
        slug: 'securite-zero-trust-concepts-implementation',
        summary: 'Comprendre et implémenter une architecture de sécurité Zero Trust.',
        content: this.getSampleMarkdownContent('cybersecurity'),
        author: 'CyberGarage Team',
        publishedDate: new Date('2024-11-25'),
        lastModified: new Date('2024-11-25'),
        category: CategoryType.CYBERSECURITY,
        tags: ['zero trust', 'sécurité', 'réseau'],
        readTimeMinutes: 15,
        featured: true,
        imageUrl: '/assets/images/zero-trust.jpg',
        seoMetadata: {
          description: 'Tout savoir sur l\'architecture Zero Trust',
          keywords: ['zero trust', 'cybersécurité', 'sécurité réseau']
        }
      }
    ];

    this.articlesSubject.next(sampleArticles);
  }

  private getSampleMarkdownContent(category: string): string {
    switch (category) {
      case 'automobile':
        return `# Les Véhicules Électriques

## Introduction

L'industrie automobile traverse une révolution majeure avec l'émergence des véhicules électriques.

## Technologies Clés

### Batteries Lithium-Ion
- Densité énergétique élevée
- Durée de vie améliorée
- Temps de charge réduit

### Moteurs Électriques
\`\`\`javascript
// Calcul de l'efficacité moteur
function calculateEfficiency(powerOutput, powerInput) {
    return (powerOutput / powerInput) * 100;
}
\`\`\`

## Équations de Base

La puissance d'un moteur électrique est donnée par :

$$P = U \\times I \\times \\cos(\\phi)$$

Où :
- P = Puissance (W)
- U = Tension (V)  
- I = Courant (A)
- φ = Déphasage

## Conclusion

Les véhicules électriques représentent l'avenir de la mobilité durable.`;

      case 'dev-info':
        return `# Architecture Microservices

## Qu'est-ce que les Microservices ?

Les microservices sont une approche architecturale qui structure une application comme un ensemble de services faiblement couplés.

## Avantages

1. **Scalabilité** - Chaque service peut être mis à l'échelle indépendamment
2. **Flexibilité technologique** - Technologies différentes par service
3. **Déploiement indépendant** - Cycles de release séparés

## Exemple d'Architecture

\`\`\`typescript
// Service de gestion des utilisateurs
@Injectable()
export class UserService {
  async findUser(id: string): Promise<User> {
    // Logique métier
    return await this.userRepository.findById(id);
  }
}
\`\`\`

## Communication Inter-Services

### REST API
\`\`\`http
GET /api/users/123
Content-Type: application/json
\`\`\`

### Message Queues
- RabbitMQ
- Apache Kafka
- AWS SQS

## Défis

- Complexité réseau
- Gestion des transactions distribuées  
- Monitoring et debugging

## Conclusion

Les microservices offrent flexibilité et scalabilité au prix d'une complexité accrue.`;

      case 'cybersecurity':
        return `# Sécurité Zero Trust

## Principe Fondamental

> "Ne jamais faire confiance, toujours vérifier"

## Piliers du Zero Trust

### 1. Vérification de l'Identité
- Authentification multi-facteur (MFA)
- Gestion des identités et accès (IAM)
- Principe du moindre privilège

### 2. Sécurisation des Appareils
\`\`\`bash
# Vérification de l'intégrité d'un device
openssl dgst -sha256 device_certificate.crt
\`\`\`

### 3. Chiffrement des Données

#### En Transit
\`\`\`python
import ssl
import socket

# Configuration SSL/TLS
context = ssl.create_default_context()
context.check_hostname = False
context.verify_mode = ssl.CERT_REQUIRED
\`\`\`

#### Au Repos
Utilisation d'AES-256 pour le chiffrement :

$$C = E_K(P)$$

Où :
- C = Données chiffrées
- E = Fonction de chiffrement
- K = Clé de chiffrement
- P = Données en clair

## Architecture Réseau

### Micro-segmentation
- VLANs isolés
- Firewalls applicatifs
- Inspection du trafic

### Monitoring Continu
- SIEM (Security Information and Event Management)
- Analyse comportementale
- Détection d'anomalies

## Implémentation

1. **Phase 1** : Inventaire des assets
2. **Phase 2** : Classification des données
3. **Phase 3** : Mise en place des contrôles
4. **Phase 4** : Monitoring et amélioration

## Conclusion

Zero Trust est un framework essentiel pour la sécurité moderne des entreprises.`;

      default:
        return '# Article en cours de rédaction\n\nContenu à venir...';
    }
  }
}
