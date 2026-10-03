import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../shared/services/seo';
import { SITE } from '../../shared/site';

interface Opportunity {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './contact.scss',
})
export class ContactComponent implements OnInit {
  readonly site = SITE;

  opportunities: Opportunity[] = [
    {
      icon: 'badge',
      title: 'CDI — Lead Dev / Architecte',
      text: 'Une équipe à faire grandir, une architecture à porter sur le long terme.'
    },
    {
      icon: 'business_center',
      title: 'Prestation en ESN',
      text: 'Renfort senior Java/Angular sur vos projets, avec exigence et autonomie.'
    },
    {
      icon: 'rocket_launch',
      title: 'Mission freelance',
      text: 'Conception, développement full-stack, intégration d\'IA — du concret livré.'
    }
  ];

  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updateSEO({
      title: 'Contact — Geoffrey Aubert, Développeur Senior Java / Angular',
      description: 'Contactez Geoffrey Aubert, développeur senior Java/Angular. Recrutement (CDI Lead/Architecte), prestation en ESN ou mission freelance — échangeons sur votre besoin.',
      keywords: [
        'contact', 'Geoffrey Aubert', 'recrutement développeur', 'lead developer',
        'architecte', 'freelance', 'ESN', 'Java', 'Angular'
      ],
      type: 'website',
      url: '/contact'
    });
  }
}
