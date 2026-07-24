import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SITE } from '../site';

/**
 * Charge Plausible (analytics respectueux de la vie privée, sans cookie) si
 * `SITE.analytics.plausibleDomain` est renseigné. Ne fait rien sinon — et ne
 * s'exécute jamais côté serveur (SSR).
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {}

  init(): void {
    const domain = SITE.analytics.plausibleDomain;
    if (!domain || !isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.document.querySelector('script[data-domain]')) {
      return; // déjà injecté
    }

    const script = this.document.createElement('script');
    script.defer = true;
    script.dataset['domain'] = domain;
    script.src = 'https://plausible.io/js/script.js';
    this.document.head.appendChild(script);
  }
}
