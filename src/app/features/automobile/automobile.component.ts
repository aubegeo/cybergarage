import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-automobile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-page">
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon">
            <i class="material-icons">directions_car</i>
          </div>
          <div class="header-text">
            <h1>Automobile & Mobilité</h1>
            <p class="page-description">Véhicules électriques, mobilité autonome et innovations automobiles</p>
          </div>
        </div>
      </header>

      <main class="page-content">
        <div class="content-grid">
          <div class="info-card">
            <h2>À propos de cette section</h2>
            <p>Cette section explore les dernières innovations dans l'industrie automobile, des véhicules électriques aux systèmes de conduite autonome.</p>
            
            <h3>Sujets abordés :</h3>
            <ul>
              <li>Véhicules électriques et hybrides</li>
              <li>Conduite autonome et ADAS</li>
              <li>Systèmes de freinage régénératif</li>
              <li>Batteries et gestion de l'énergie</li>
              <li>Connectivité véhiculaire (V2X)</li>
              <li>Simulation et tests virtuels</li>
            </ul>
          </div>

          <div class="articles-preview">
            <h2>Articles récents</h2>
            <div class="article-grid">
              <div class="article-card">
                <h3>Systèmes de freinage régénératif</h3>
                <p>Analyse technique des systèmes de freinage régénératif et leur impact sur l'autonomie des véhicules électriques.</p>
                <span class="article-tag">EV</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrl: './automobile.component.scss'
})
export class AutomobileComponent {
  constructor() {}
}
