import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ia-master',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-page">
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="material-icons">smart_toy</i>
          </div>
          <div class="header-text">
            <h1>IA Master</h1>
            <p class="page-description">Intelligence artificielle, LLM et IA générative appliquée au développement</p>
          </div>
        </div>
      </header>

      <main class="page-content">
        <div class="content-grid">
          <div class="info-card">
            <h2>À propos de cette section</h2>
            <p>Cette section explore l'intelligence artificielle moderne, des grands modèles de langage (LLM) à l'IA générative, en passant par leur intégration concrète dans les applications.</p>

            <h3>Sujets abordés :</h3>
            <ul>
              <li>Grands modèles de langage (LLM) et prompt engineering</li>
              <li>IA générative (texte, image, code)</li>
              <li>RAG et bases vectorielles</li>
              <li>Agents IA et orchestration</li>
              <li>Fine-tuning et déploiement de modèles</li>
              <li>MLOps et mise en production</li>
            </ul>
          </div>

          <div class="articles-preview">
            <h2>Articles récents</h2>
            <div class="article-grid">
              <div class="article-card">
                <h3>Bientôt disponible</h3>
                <p>Les premiers articles de cette catégorie arrivent prochainement.</p>
                <span class="article-tag">IA</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './ia-master.component.scss'
})
export class IaMasterComponent {
  constructor() {}
}
