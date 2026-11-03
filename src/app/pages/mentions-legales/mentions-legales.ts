import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

/**
 * Mentions légales exigées par l'article 1-1 de la LCEN (loi n° 2004-575).
 *
 * Site édité à titre non professionnel (choix de Geoffrey du 2026-11-03) : le II
 * de l'article 1-1 permet alors de ne publier que l'identité de l'hébergeur. Si le
 * site devient professionnel (publicité, affiliation, vente de prestations), il
 * faut afficher l'identité complète, comme sur automotocool, tabletteprix et
 * allgamerules (nom, adresse, téléphone, SIREN, directeur de la publication).
 */
@Component({
  selector: 'app-mentions-legales',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mentions-legales.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './mentions-legales.scss',
})
export class MentionsLegalesComponent implements OnInit {
  constructor(private meta: Meta, private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Mentions légales — CyberGarage');
    this.meta.updateTag({
      name: 'description',
      content: 'Mentions légales du site CyberGarage : éditeur et hébergeur.',
    });
  }
}
