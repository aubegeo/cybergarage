import { TestBed } from '@angular/core/testing';

import { Sitemap } from './sitemap';

describe('Sitemap', () => {
  let service: Sitemap;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sitemap);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
