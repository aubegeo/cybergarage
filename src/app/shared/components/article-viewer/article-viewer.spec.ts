import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleViewerComponent } from './article-viewer';

describe('ArticleViewerComponent', () => {
  let component: ArticleViewerComponent;
  let fixture: ComponentFixture<ArticleViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleViewerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
