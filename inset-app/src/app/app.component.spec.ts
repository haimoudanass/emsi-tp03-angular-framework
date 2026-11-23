import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'inset-app' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('inset-app');
  });

  it('should render the Bootstrap navbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav.navbar')).toBeTruthy();
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Angular 19 App');
  });

  it('should render Home and Products navigation controls', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(compiled.querySelectorAll('button.btn'));
    const labels = buttons.map((button) => button.textContent?.replace(/\s+/g, ' ').trim());
    expect(labels.some((label) => label?.includes('Home'))).toBeTrue();
    expect(labels.some((label) => label?.includes('Products'))).toBeTrue();
    expect(compiled.querySelector('.bi-house-door')).toBeTruthy();
    expect(compiled.querySelector('.bi-box-seam')).toBeTruthy();
  });

  it('should contain a router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
