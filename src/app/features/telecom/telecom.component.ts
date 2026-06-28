import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-telecom',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-page">
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="material-icons">signal_cellular_alt</i>
          </div>
          <div class="header-text">
            <h1>Télécommunications</h1>
            <p class="page-description">Réseaux avancés, 5G/6G, IoT et protocoles de communication</p>
          </div>
        </div>
      </header>

      <main class="page-content">
        <div class="content-grid">
          <div class="info-card">
            <h2>À propos de cette section</h2>
            <p>Cette section explore les technologies de télécommunications modernes, des réseaux cellulaires aux protocoles IoT en passant par les infrastructures edge computing.</p>
            
            <h3>Sujets abordés :</h3>
            <ul>
              <li>Technologies 5G et 6G</li>
              <li>Réseaux IoT et protocoles</li>
              <li>Edge computing et fog networking</li>
              <li>Sécurité des communications</li>
              <li>Optimisation de réseau</li>
              <li>SDN et virtualisation réseau</li>
            </ul>
          </div>

          <div class="articles-preview">
            <h2>Articles récents</h2>
            <div class="article-grid">
              <div class="article-card">
                <h3>Réseaux intelligents et Edge Computing</h3>
                <p>Architecture et déploiement de réseaux intelligents pour l'IoT industriel.</p>
                <span class="article-tag">5G</span>
              </div>
              <!-- Plus d'articles seront ajoutés ici -->
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrl: './telecom.component.scss'
})
export class TelecomComponent {
  constructor() {}
}
