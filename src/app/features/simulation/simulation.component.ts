import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-page">
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="material-icons">timeline</i>
          </div>
          <div class="header-text">
            <h1>Simulation & Modélisation</h1>
            <p class="page-description">Modélisation numérique, simulation physique et analyse prédictive</p>
          </div>
        </div>
      </header>

      <main class="page-content">
        <div class="content-grid">
          <div class="info-card">
            <h2>À propos de cette section</h2>
            <p>Cette section couvre les techniques de modélisation et simulation numérique, des méthodes d'éléments finis aux simulations Monte Carlo en passant par l'analyse prédictive.</p>
            
            <h3>Sujets abordés :</h3>
            <ul>
              <li>Méthodes d'éléments finis (FEM)</li>
              <li>Simulation Monte Carlo</li>
              <li>Dynamique des fluides (CFD)</li>
              <li>Modélisation multiphysique</li>
              <li>Machine learning prédictif</li>
              <li>Optimisation multi-objective</li>
            </ul>
          </div>

          <div class="articles-preview">
            <h2>Articles récents</h2>
            <div class="article-grid">
              <div class="article-card">
                <h3>Simulation physique temps réel</h3>
                <p>Techniques de simulation physique pour applications interactives et temps réel.</p>
                <span class="article-tag">CFD</span>
              </div>
              <!-- Plus d'articles seront ajoutés ici -->
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrl: './simulation.component.scss'
})
export class SimulationComponent {
  constructor() {}
}
