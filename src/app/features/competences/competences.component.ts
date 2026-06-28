import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../shared/services/seo';

/** Une compétence technique avec son niveau (0-100) et une preuve optionnelle. */
interface Skill {
  name: string;
  /** Libellé du niveau affiché (Expert, Confirmé, En progression…). */
  level: string;
  /** Pourcentage pour la barre de progression. À ajuster honnêtement. */
  pct: number;
  /** Lien de preuve : une catégorie ou un article qui démontre la compétence. */
  proof?: { label: string; route: string };
}

interface SkillGroup {
  title: string;
  icon: string;
  color: string;
  skills: Skill[];
}

interface SoftSkill {
  icon: string;
  title: string;
  /** Le savoir-être se PROUVE : une situation concrète, pas un adjectif. */
  text: string;
}

@Component({
  selector: 'app-competences',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './competences.component.html',
  styleUrl: './competences.component.scss'
})
export class CompetencesComponent implements OnInit {
  // === SAVOIR-FAIRE (hard skills) ===
  // Les niveaux sont des estimations à ajuster selon ta réalité.
  savoirFaire: SkillGroup[] = [
    {
      title: 'Backend Java',
      icon: 'coffee',
      color: '#E76F00',
      skills: [
        { name: 'Java 17 / 21', level: 'Expert', pct: 90 },
        { name: 'Spring Boot / Spring', level: 'Expert', pct: 90 },
        { name: 'Concurrence, JVM & GC tuning', level: 'En progression', pct: 65 },
        { name: 'CQRS / Event Sourcing', level: 'Intermédiaire', pct: 60 },
        { name: 'Tests (JUnit, Mockito)', level: 'Confirmé', pct: 85 }
      ]
    },
    {
      title: 'Frontend Angular',
      icon: 'web',
      color: '#DD0031',
      skills: [
        { name: 'Angular (standalone, signals)', level: 'Expert', pct: 90 },
        { name: 'TypeScript', level: 'Expert', pct: 90 },
        { name: 'RxJS', level: 'Confirmé', pct: 80 },
        { name: 'NgRx / state management', level: 'En progression', pct: 65 },
        { name: 'Performance & micro-frontends', level: 'Intermédiaire', pct: 55 }
      ]
    },
    {
      title: 'Architecture & Conception',
      icon: 'architecture',
      color: '#3498DB',
      skills: [
        { name: 'System Design (scalabilité, cache, files)', level: 'En progression', pct: 70, proof: { label: 'Artisan Développeur', route: '/dev-info' } },
        { name: 'Clean / Architecture hexagonale', level: 'En progression', pct: 70, proof: { label: 'Pragmatic Engineer', route: '/pragmatic' } },
        { name: 'Domain-Driven Design (DDD)', level: 'En progression', pct: 65 },
        { name: 'Microservices', level: 'Confirmé', pct: 70, proof: { label: 'Artisan Développeur', route: '/dev-info' } },
        { name: 'API design (REST)', level: 'Confirmé', pct: 85 },
        { name: 'Design patterns', level: 'Confirmé', pct: 85 }
      ]
    },
    {
      title: 'DevOps & Cloud',
      icon: 'cloud',
      color: '#2ECC71',
      skills: [
        { name: 'Docker', level: 'Confirmé', pct: 80 },
        { name: 'CI/CD', level: 'Confirmé', pct: 75 },
        { name: 'Kubernetes', level: 'Intermédiaire', pct: 55 },
        { name: 'AWS / GCP', level: 'En progression', pct: 50 },
        { name: 'Linux / Bash', level: 'Confirmé', pct: 80 }
      ]
    },
    {
      title: 'IA appliquée',
      icon: 'smart_toy',
      color: '#6C5CE7',
      skills: [
        { name: 'Intégration LLM (Ollama, Claude API)', level: 'Confirmé', pct: 80, proof: { label: 'IA Master', route: '/ia-master' } },
        { name: 'Prompt engineering', level: 'Confirmé', pct: 80 },
        { name: 'RAG & bases vectorielles', level: 'Intermédiaire', pct: 60 },
        { name: 'Automatisation IA (génération de contenu)', level: 'Confirmé', pct: 75 }
      ]
    },
    {
      title: 'Données',
      icon: 'storage',
      color: '#F39C12',
      skills: [
        { name: 'PostgreSQL', level: 'Confirmé', pct: 80 },
        { name: 'MySQL', level: 'Confirmé', pct: 80 },
        { name: 'Modélisation de données', level: 'Confirmé', pct: 75 },
        { name: 'SQL avancé', level: 'Confirmé', pct: 75 }
      ]
    }
  ];

  // === SAVOIR-ÊTRE (soft skills) — démontrés par des situations concrètes ===
  savoirEtre: SoftSkill[] = [
    {
      icon: 'groups',
      title: 'Leadership technique',
      text: 'Je cadre les choix d\'architecture, j\'arbitre les compromis (dette technique vs delivery) et j\'embarque l\'équipe derrière une décision argumentée plutôt qu\'imposée.'
    },
    {
      icon: 'school',
      title: 'Mentoring & code review',
      text: 'Je fais monter en compétence les profils juniors via des revues de code bienveillantes et exigeantes : j\'explique le pourquoi, pas seulement le quoi.'
    },
    {
      icon: 'forum',
      title: 'Communication & vulgarisation',
      text: 'Je rends accessible le complexe — c\'est tout l\'esprit de ce blog. Je traduis le technique pour le métier et inversement, sans perdre personne.'
    },
    {
      icon: 'rocket_launch',
      title: 'Pragmatisme & sens du delivery',
      text: 'Je vise la valeur livrée, pas la perfection théorique. Je sais quand un « assez bon » qui sort vaut mieux qu\'un « parfait » qui traîne.'
    },
    {
      icon: 'explore',
      title: 'Autonomie & curiosité',
      text: 'Je mène des projets perso variés (IA générative, data, SaaS) de bout en bout : preuve d\'apprentissage continu et d\'autonomie sur toute la chaîne.'
    },
    {
      icon: 'insights',
      title: 'Estimation & vision',
      text: 'Je découpe, j\'estime et je communique les risques tôt. Je pense au-delà du ticket : maintenabilité, évolutivité, coût total.'
    }
  ];

  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.updateSEO({
      title: 'Geoffrey Aubert — Compétences | Développeur Senior Java / Angular',
      description: 'Savoir-faire et savoir-être de Geoffrey Aubert, développeur senior Java/Angular en route vers Lead Dev & Architecte : backend Java, Angular, architecture, DevOps, IA appliquée, leadership technique.',
      keywords: [
        'Geoffrey Aubert', 'développeur senior', 'lead developer', 'architecte logiciel',
        'Java', 'Angular', 'Spring Boot', 'architecture', 'DevOps', 'IA', 'soft skills'
      ],
      type: 'profile'
    });
  }
}
