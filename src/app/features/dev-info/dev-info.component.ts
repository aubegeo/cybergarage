import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dev-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-page">
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="material-icons">code</i>
          </div>
          <div class="header-text">
            <h1>Artisan Développeur</h1>
            <p class="page-description">Craftsmanship logiciel, System Design, bonnes pratiques et soft skills du développeur</p>
          </div>
        </div>
      </header>

      <main class="page-content">
        <div class="content-grid">
          <div class="info-card">
            <h2>À propos de cette section</h2>
            <p>Le développement n'est pas qu'écrire du code : c'est un artisanat. Cette section couvre la conception de systèmes robustes, le code propre et les pratiques qui font la différence entre « ça marche » et « ça tient dans le temps ».</p>

            <h3>Sujets abordés :</h3>
            <ul>
              <li>System Design (scalabilité, cache, files, bases de données)</li>
              <li>Clean Code &amp; Clean Architecture</li>
              <li>Design patterns &amp; refactoring</li>
              <li>Microservices &amp; architecture hexagonale</li>
              <li>Tests et qualité logicielle</li>
              <li>Soft skills du développeur (revue de code, collaboration)</li>
            </ul>
          </div>

          <div class="articles-preview">
            <h2>À la une : System Design</h2>
            <div class="article-grid">
              <div class="article-card featured">
                <h3>System Design — concevoir des systèmes qui passent à l'échelle</h3>
                <p>Load balancing, mise en cache, sharding, files de messages, CAP theorem : les briques pour dimensionner une architecture, dans l'esprit ByteByteGo.</p>
                <span class="article-tag">System Design</span>
              </div>
              <div class="article-card">
                <h3>Microservices : Docker &amp; Kubernetes</h3>
                <p>Découpage, communication et déploiement d'une architecture microservices.</p>
                <span class="article-tag">Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dev-info.component.scss'
})
export class DevInfoComponent {
  constructor() {}
}
