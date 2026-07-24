import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CompetencesComponent } from './competences.component';

describe('CompetencesComponent', () => {
  let component: CompetencesComponent;
  let fixture: ComponentFixture<CompetencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetencesComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CompetencesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose non-empty savoirFaire and savoirEtre lists', () => {
    expect(component.savoirFaire.length).toBeGreaterThan(0);
    expect(component.savoirEtre.length).toBeGreaterThan(0);
  });
});
