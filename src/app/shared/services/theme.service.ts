import { Injectable, Renderer2, RendererFactory2, Inject, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export enum Theme {
  LIGHT = 'light-theme',
  DARK = 'dark-theme'
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentThemeSubject: BehaviorSubject<Theme>;
  public currentTheme$: Observable<Theme>;
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    
    // Initialiser avec le thème sauvegardé ou le thème par défaut
    const savedTheme = this.getSavedTheme() || Theme.LIGHT;
    this.currentThemeSubject = new BehaviorSubject<Theme>(savedTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
    
    // Appliquer le thème initial
    this.applyTheme(savedTheme);
  }

  /**
   * Basculer entre thème clair et sombre
   */
  toggleTheme(): void {
    const currentTheme = this.currentThemeSubject.value;
    const newTheme = currentTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    this.setTheme(newTheme);
  }

  /**
   * Définir un thème spécifique
   */
  setTheme(theme: Theme): void {
    this.applyTheme(theme);
    this.saveTheme(theme);
    this.currentThemeSubject.next(theme);
  }

  /**
   * Obtenir le thème actuel
   */
  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  /**
   * Vérifier si le thème sombre est activé
   */
  isDarkMode(): boolean {
    return this.currentThemeSubject.value === Theme.DARK;
  }

  /**
   * Appliquer le thème au document
   */
  private applyTheme(theme: Theme): void {
    // Supprimer toutes les classes de thème existantes
    this.renderer.removeClass(this.document.body, Theme.LIGHT);
    this.renderer.removeClass(this.document.body, Theme.DARK);
    
    // Ajouter la nouvelle classe de thème
    this.renderer.addClass(this.document.body, theme);
    
    // Mettre à jour l'attribut data-theme pour compatibilité
    this.renderer.setAttribute(this.document.body, 'data-theme', theme);
  }

  /**
   * Sauvegarder le thème dans localStorage
   */
  private saveTheme(theme: Theme): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('cybergarage-theme', theme);
      } catch (error) {
        console.warn('Unable to save theme to localStorage:', error);
      }
    }
  }

  /**
   * Récupérer le thème sauvegardé
   */
  private getSavedTheme(): Theme | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const savedTheme = localStorage.getItem('cybergarage-theme');
        return savedTheme as Theme | null;
      } catch (error) {
        console.warn('Unable to retrieve theme from localStorage:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Détecter automatiquement la préférence du système
   */
  detectSystemTheme(): Theme {
    if (isPlatformBrowser(this.platformId) && window.matchMedia) {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDarkMode ? Theme.DARK : Theme.LIGHT;
    }
    return Theme.LIGHT;
  }

  /**
   * Utiliser la préférence du système si aucun thème n'est sauvegardé
   */
  initializeWithSystemPreference(): void {
    const savedTheme = this.getSavedTheme();
    if (!savedTheme) {
      const systemTheme = this.detectSystemTheme();
      this.setTheme(systemTheme);
    }
  }

  /**
   * Écouter les changements de préférence du système
   */
  listenToSystemThemeChanges(): void {
    if (isPlatformBrowser(this.platformId) && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (event) => {
        // Seulement si aucun thème n'est explicitement sauvegardé
        if (!this.getSavedTheme()) {
          const newTheme = event.matches ? Theme.DARK : Theme.LIGHT;
          this.setTheme(newTheme);
        }
      });
    }
  }
}