import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Article } from '../../models/article';
import { ArticleService } from '../../services/article';

declare global {
  interface Window {
    katex: any;
    Prism: any;
  }
}

@Component({
  selector: 'app-article-viewer',
  imports: [CommonModule],
  templateUrl: './article-viewer.html',
  styleUrl: './article-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleViewerComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() article: Article | null = null;
  @ViewChild('contentContainer') contentContainer!: ElementRef;
  
  renderedContent: string = '';
  isLoading: boolean = false;

  constructor(
    private articleService: ArticleService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Volontairement SANS garde navigateur : le Markdown doit etre converti au
    // prerendu aussi, sinon la page generee ne contient que les metadonnees et un
    // robot d'indexation ne voit jamais le texte de l'article.
    if (changes['article'] && this.article) {
      this.renderArticle();
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDependencies();
    }
  }

  ngAfterViewInit(): void {
    // Le rendu est maintenant géré par ngOnChanges
  }

  ngOnDestroy(): void {
    // Cleanup si nécessaire
  }

  private async loadDependencies(): Promise<void> {
    try {
      // Chargement de KaTeX pour les équations
      if (!window.katex) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.js');
        await this.loadCSS('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css');
      }

      // Chargement de Prism pour le syntax highlighting
      if (!window.Prism) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js');
        await this.loadCSS('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css');
        
        // Langages supplémentaires
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js');
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js');
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js');
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dépendances:', error);
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      this.document.head.appendChild(script);
    });
  }

  private loadCSS(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = this.document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
      this.document.head.appendChild(link);
    });
  }

  private async renderArticle(): Promise<void> {
    if (!this.article) return;

    // Commencer le loading de manière synchrone
    this.isLoading = true;
    this.cdr.markForCheck();
    
    try {
      // Parse le markdown
      let content = this.articleService.parseMarkdown(this.article.content);
      
      // Traite les équations LaTeX
      content = this.processLatex(content);
      
      this.renderedContent = content;

      // La coloration syntaxique et le rendu des formules manipulent le DOM, donc
      // uniquement dans le navigateur. Au prerendu on s'arrete apres la
      // conversion Markdown, ce qui suffit a produire le texte complet.
      if (!isPlatformBrowser(this.platformId)) {
        this.isLoading = false;
        this.cdr.markForCheck();
        return;
      }

      // Utiliser setTimeout pour s'assurer que la vue est mise à jour
      setTimeout(() => {
        this.highlightCode();
        this.renderMath();
        
        // Finir le loading de manière asynchrone
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 0);
      }, 100);
      
    } catch (error) {
      console.error('Erreur lors du rendu de l\'article:', error);
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private processLatex(content: string): string {
    // Traite les équations inline $...$
    content = content.replace(/\$([^$]+)\$/g, (match, equation) => {
      return `<span class="math-inline">${equation}</span>`;
    });

    // Traite les équations block $$...$$
    content = content.replace(/\$\$([^$]+)\$\$/g, (match, equation) => {
      return `<div class="math-block">${equation}</div>`;
    });

    return content;
  }

  private highlightCode(): void {
    if (isPlatformBrowser(this.platformId) && window.Prism && this.contentContainer) {
      const codeBlocks = this.contentContainer.nativeElement.querySelectorAll('pre code');
      codeBlocks.forEach((block: HTMLElement) => {
        window.Prism.highlightElement(block);
      });
    }
  }

  private renderMath(): void {
    if (isPlatformBrowser(this.platformId) && window.katex && this.contentContainer) {
      // Rendu des équations inline
      const inlineMath = this.contentContainer.nativeElement.querySelectorAll('.math-inline');
      inlineMath.forEach((element: HTMLElement) => {
        try {
          const math = element.textContent || '';
          element.innerHTML = window.katex.renderToString(math, {
            displayMode: false,
            throwOnError: false
          });
        } catch (error) {
          console.error('Erreur rendu équation inline:', error);
        }
      });

      // Rendu des équations block
      const blockMath = this.contentContainer.nativeElement.querySelectorAll('.math-block');
      blockMath.forEach((element: HTMLElement) => {
        try {
          const math = element.textContent || '';
          element.innerHTML = window.katex.renderToString(math, {
            displayMode: true,
            throwOnError: false
          });
        } catch (error) {
          console.error('Erreur rendu équation block:', error);
        }
      });
    }
  }

  getReadTime(): string {
    return this.article ? `${this.article.readTimeMinutes} min de lecture` : '';
  }

  getFormattedDate(): string {
    return this.article ? 
      new Intl.DateTimeFormat('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(this.article.publishedDate) : '';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.jpg';
  }
}
