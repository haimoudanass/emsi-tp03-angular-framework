import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the Accueil title and presentation text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Accueil');
    expect(compiled.textContent).toContain('Application de Gestion de Produits — Angular 19');
  });

  it('should expose a Bootstrap button linking to products', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button.btn.btn-primary');
    expect(button).toBeTruthy();
    expect(button?.getAttribute('ng-reflect-router-link') || button?.getAttribute('href') || button?.outerHTML)
      .toContain('/products');
  });
});
