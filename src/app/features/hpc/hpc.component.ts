import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hpc',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-page">
      <header class="page-header">
        <div class="header-content">
          <div class="header-icon" style="color: #8E44AD;">
            <i class="material-icons">speed</i>
          </div>
          <div class="header-text">
            <h1>Calcul Haute Performance (HPC)</h1>
            <p class="page-description">Optimisation GPU, calcul parallèle et architectures haute performance</p>
          </div>
        </div>
      </header>

      <main class="page-content">
        <div class="content-grid">
          <div class="info-card">
            <h2>À propos de cette section</h2>
            <p>Cette section couvre les technologies de calcul haute performance, l'optimisation GPU avec CUDA et OpenCL, les architectures parallèles et distribuées.</p>
            
            <h3>Sujets abordés :</h3>
            <ul>
              <li>Optimisation GPU et CUDA</li>
              <li>Calcul parallèle et distribué</li>
              <li>Architectures HPC</li>
              <li>Profiling et optimisation de performance</li>
              <li>Frameworks de calcul scientifique</li>
            </ul>
          </div>

          <div class="articles-preview">
            <h2>Articles récents</h2>
            <div class="article-grid">
              <div class="article-card">
                <h3>Optimisation GPU avec CUDA</h3>
                <p>Techniques avancées d'optimisation pour le calcul parallèle sur GPU.</p>
                <span class="article-tag">GPU</span>
              </div>
              <!-- Plus d'articles seront ajoutés ici -->
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrl: './hpc.component.scss'
})
export class HpcComponent {
  constructor() {}
}
