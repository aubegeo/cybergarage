import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../shared/services/seo';

interface Project {
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  status: 'En production' | 'Actif' | 'En développement';
  icon: string;
  color: string;
}

@Component({
  selector: 'app-projets',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projets.component.html',
  styleUrl: './projets.component.scss'
})
export class ProjetsComponent implements OnInit {
  // Projets personnels = preuves concrètes de savoir-faire bout-en-bout.
  // À enrichir : liens (GitHub / démo), captures, métriques de résultats.
  projects: Project[] = [
    {
      name: 'tablet-app',
      tagline: 'Génération d\'articles par IA',
      description: 'Plateforme de génération automatique d\'articles avec un LLM local (Ollama / Mistral 7B), pour alimenter un site d\'affiliation. Pipeline complet de la génération à la publication.',
      stack: ['Node.js', 'TypeScript', 'Ollama / Mistral 7B', 'Nuxt 3', 'Firebase'],
      status: 'En production',
      icon: 'auto_stories',
      color: '#6C5CE7'
    },
    {
      name: 'musicVideoYt',
      tagline: 'Vidéos YouTube automatisées',
      description: 'Génération de vidéos musicales et de Shorts « podcast IA » (TTS + b-roll) à partir d\'articles existants, avec ffmpeg. Pattern réutilisable entre projets de contenu.',
      stack: ['Node.js', 'TypeScript', 'ffmpeg', 'TTS'],
      status: 'Actif',
      icon: 'movie',
      color: '#E74C3C'
    },
    {
      name: 'parisSportif',
      tagline: 'Gestion de bankroll & tactique de pari',
      description: 'Outil de gestion de trésorerie et d\'aide à la décision pour les paris sportifs, avec un dashboard de suivi des performances.',
      stack: ['Node.js', 'TypeScript', 'PostgreSQL 12', 'Nuxt 3'],
      status: 'Actif',
      icon: 'trending_up',
      color: '#2ECC71'
    },
    {
      name: 'suivi-vehicule',
      tagline: 'SaaS avec abonnement',
      description: 'Application SaaS complète de suivi de véhicule avec gestion d\'abonnements. Conception produit, architecture et facturation récurrente de bout en bout.',
      stack: ['Node.js', 'TypeScript', 'SaaS', 'Stripe'],
      status: 'En développement',
      icon: 'directions_car',
      color: '#FF6B35'
    },
    {
      name: 'automotocool',
      tagline: 'Site d\'affiliation auto / moto',
      description: 'Site de contenu auto/moto monétisé par affiliation Amazon, alimenté par le pipeline de génération de contenu.',
      stack: ['Nuxt 3', 'Node.js', 'Markdown', 'SEO'],
      status: 'En production',
      icon: 'two_wheeler',
      color: '#F39C12'
    },
    {
      name: 'amazokdp',
      tagline: 'Édition de livres sur Amazon KDP',
      description: 'Production et publication de livres (cours, formats variés) sur Amazon KDP, de la rédaction assistée par IA à la mise en forme.',
      stack: ['IA générative', 'Édition', 'Amazon KDP'],
      status: 'Actif',
      icon: 'menu_book',
      color: '#3498DB'
    }
  ];

  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.updateSEO({
      title: 'Geoffrey Aubert — Réalisations & Projets',
      description: 'Projets et réalisations de Geoffrey Aubert : IA générative, automatisation, SaaS, data — preuves concrètes de savoir-faire full-stack (Node.js, TypeScript, Nuxt, IA locale).',
      keywords: [
        'Geoffrey Aubert', 'projets', 'portfolio', 'réalisations', 'SaaS',
        'IA générative', 'Ollama', 'Node.js', 'TypeScript', 'full-stack'
      ],
      type: 'website'
    });
  }
}
