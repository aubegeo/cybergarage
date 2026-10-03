import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NavigationService } from '../../services/navigation';
import { ThemeService } from '../../services/theme.service';
import { Category, NavigationItem } from '../../models/category';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './navigation.scss',
})
export class NavigationComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  categories$: Observable<Category[]>;
  navigationItems: NavigationItem[] = [];
  isMobileMenuOpen = false;
  activeSubmenu: string | null = null;
  isDarkMode = false;

  constructor(
    private navigationService: NavigationService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.categories$ = this.navigationService.getCategories();
  }

  ngOnInit(): void {
    this.navigationItems = this.navigationService.getNavigationItems();
    
    // S'abonner aux changements de thème
    this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = this.themeService.isDarkMode();
    // markForCheck() est indispensable : l'application tourne SANS zone.js
    // (Angular 21, aucun polyfill déclaré dans angular.json), donc une
    // affectation de champ dans un callback asynchrone ne déclenche aucun
    // rendu. Sans cette ligne la vue reste vide en permanence.
      this.cdr.markForCheck();
    });
    
    // Initialiser avec la préférence système si nécessaire
    this.themeService.initializeWithSystemPreference();
    this.themeService.listenToSystemThemeChanges();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSearch(): void {
    // TODO: Implémenter la fonctionnalité de recherche
    console.log('Recherche non implémentée');
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleSubmenu(itemLabel: string): void {
    this.activeSubmenu = this.activeSubmenu === itemLabel ? null : itemLabel;
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.isMobileMenuOpen = false;
    this.activeSubmenu = null;
  }

  getCategoryIcon(category: Category): string {
    return category.icon || 'folder';
  }

  getCategoryColor(category: Category): string {
    return category.color;
  }

  onCategoryClick(category: Category): void {
    this.navigateTo(category.route);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.activeSubmenu = null;
  }
}
