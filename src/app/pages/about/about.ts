import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../shared/services/seo';
import { sameAs } from '../../shared/site';

interface TimelineStep {
  period: string;
  title: string;
  description: string;
  icon: string;
  state: 'done' | 'current' | 'goal';
}

interface Value {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutComponent implements OnInit {
  // Trajectoire professionnelle : le cœur du récit (savoir-être).
  timeline: TimelineStep[] = [
    {
      period: 'Aujourd\'hui',
      title: 'Développeur Senior Java / Angular',
      description: 'En ESN, je conçois et livre des applications full-stack robustes. Java/Spring côté serveur, Angular côté client, avec une exigence forte sur la qualité et la maintenabilité.',
      icon: 'code',
      state: 'current'
    },
    {
      period: 'En cours',
      title: 'Lead Developer',
      description: 'Je prends en charge les choix techniques, la revue de code et la montée en compétence de l\'équipe. Faire grandir les autres autant que le produit.',
      icon: 'groups',
      state: 'goal'
    },
    {
      period: 'Objectif',
      title: 'Architecte logiciel',
      description: 'Concevoir des systèmes qui passent à l\'échelle et durent : System Design, architecture hexagonale, DDD, microservices, cloud. Penser le long terme.',
      icon: 'architecture',
      state: 'goal'
    }
  ];

  // Façon de travailler : ce qui guide mes décisions au quotidien.
  values: Value[] = [
    {
      icon: 'handyman',
      title: 'Craftsmanship',
      text: 'Le code est un artisanat. Je vise la clarté, la testabilité et la maintenabilité — pas le « ça marche » jetable.'
    },
    {
      icon: 'rocket_launch',
      title: 'Pragmatisme',
      text: 'La valeur livrée prime sur la perfection théorique. Je choisis la bonne dose d\'ingénierie pour le bon contexte.'
    },
    {
      icon: 'school',
      title: 'Partage',
      text: 'Expliquer le POURQUOI, pas seulement le COMMENT. Vulgariser le complexe, dans l\'esprit ByteByteGo : c\'est la raison d\'être de ce blog.'
    },
    {
      icon: 'trending_up',
      title: 'Progression continue',
      text: 'JVM, architecture, DevOps, IA : j\'apprends en permanence et je le prouve par des projets concrets menés de bout en bout.'
    }
  ];

  // Domaines couverts par le blog (preuves de polyvalence technique).
  expertise: string[] = [
    'Java & Spring', 'Angular & TypeScript', 'System Design', 'Architecture logicielle',
    'Microservices', 'DevOps & Cloud', 'IA appliquée (LLM)', 'Cybersécurité',
    'FPGA & Embarqué', 'Électronique', 'Mécanique'
  ];

  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updateSEO({
      title: 'À propos — Geoffrey Aubert, Développeur Senior Java / Angular',
      description: 'Geoffrey Aubert, ingénieur mécanique devenu développeur senior Java/Angular, en route vers Lead Dev & Architecte. Mon parcours du cambouis au code, ma vision artisanale du développement et la genèse de CyberGarage.',
      keywords: [
        'Geoffrey Aubert', 'développeur senior', 'Java', 'Angular', 'lead developer',
        'architecte logiciel', 'ingénieur mécanique', 'artisan développeur', 'craftsmanship',
        'System Design', 'ByteByteGo'
      ],
      type: 'profile',
      url: '/about',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        dateModified: new Date().toISOString(),
        mainEntity: {
          '@type': 'Person',
          name: 'Geoffrey Aubert',
          jobTitle: 'Développeur Senior Java / Angular',
          description: 'Ingénieur en mécanique et systèmes industriels devenu développeur senior Java/Angular, en progression vers Lead Developer et Architecte logiciel. Une vision artisanale du développement.',
          alumniOf: 'DUT Informatique',
          url: 'https://cybergarage.tech/about',
          knowsAbout: [
            'Java', 'Spring Boot', 'Angular', 'TypeScript', 'System Design',
            'Architecture logicielle', 'Microservices', 'DevOps', 'Cloud',
            'Intelligence artificielle', 'Cybersécurité'
          ],
          ...(sameAs().length ? { sameAs: sameAs() } : {})
        }
      }
    });
  }
}
