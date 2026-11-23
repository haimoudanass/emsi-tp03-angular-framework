import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { ProductsComponent } from './products.component';
import { Product } from '../models/product';
import { routes } from '../app.routes';
import { AppComponent } from '../app.component';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8083/products';

  const sampleProducts: Product[] = [
    { id: 1, name: 'Ordinateur Portable', price: 1300, selected: true },
    { id: 2, name: 'Imprimante Multifonction', price: 300, selected: false },
    { id: 3, name: 'Smartphone 5G', price: 800, selected: true }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushProducts(products: Product[] = sampleProducts): void {
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(products);
    fixture.detectChanges();
  }

  it('should create', () => {
    fixture.detectChanges();
    flushProducts();
    expect(component).toBeTruthy();
  });

  it('should show loading state before the GET response', () => {
    fixture.detectChanges();
    expect(component.products).toBeUndefined();
    expect(fixture.nativeElement.textContent).toContain('Chargement du catalogue en cours...');
    flushProducts();
  });

  it('should load and display the three products from GET /products', () => {
    fixture.detectChanges();
    flushProducts();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(component.products?.length).toBe(3);
    expect(compiled.querySelectorAll('tbody tr').length).toBe(3);
    expect(compiled.textContent).toContain('Ordinateur Portable');
  });

  it('should display prices with CurrencyPipe EUR', () => {
    fixture.detectChanges();
    flushProducts();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('€1,300.00');
    expect(text).toContain('€300.00');
    expect(text).toContain('€800.00');
  });

  it('should render selected and non-selected badges correctly', () => {
    fixture.detectChanges();
    flushProducts();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.badge.text-bg-success').length).toBe(2);
    expect(compiled.querySelectorAll('.badge.text-bg-secondary').length).toBe(1);
  });

  it('should render enabled delete buttons', () => {
    fixture.detectChanges();
    flushProducts();
    const buttons = fixture.debugElement.queryAll(By.css('button.btn-outline-danger'));
    expect(buttons.length).toBe(3);
    buttons.forEach((button) => {
      expect(button.nativeElement.disabled).toBeFalse();
    });
  });

  it('should render a table with five columns', () => {
    fixture.detectChanges();
    flushProducts();
    const headers = fixture.nativeElement.querySelectorAll('thead th');
    expect(headers.length).toBe(5);
  });

  it('should show the empty state when API returns an empty array', () => {
    fixture.detectChanges();
    flushProducts([]);
    expect(fixture.nativeElement.textContent).toContain('Aucun produit disponible');
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('should handle GET errors without staying in loading state', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(apiUrl);
    req.flush({ message: 'down' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(component.products).toEqual([]);
    expect(component.errorMessage).toContain('Impossible de charger le catalogue');
    expect(fixture.nativeElement.querySelector('.alert-danger')).toBeTruthy();
  });

  it('should reject an invalid add form without sending POST', () => {
    fixture.detectChanges();
    flushProducts();
    component.newProduct = { name: '', price: 0, selected: false };

    component.handleAddProduct();
    fixture.detectChanges();

    httpMock.expectNone(apiUrl);
    expect(component.errorMessage).toContain('nom et un prix');
  });

  it('should accept a valid add form payload', () => {
    fixture.detectChanges();
    flushProducts();
    component.newProduct = { name: 'Clavier', price: 99, selected: true };

    component.handleAddProduct();

    const postReq = httpMock.expectOne(apiUrl);
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ name: 'Clavier', price: 99, selected: true });
    postReq.flush({ id: 4, name: 'Clavier', price: 99, selected: true });
    flushProducts([
      ...sampleProducts,
      { id: 4, name: 'Clavier', price: 99, selected: true }
    ]);
  });

  it('should prevent double submission while POST is in flight', () => {
    fixture.detectChanges();
    flushProducts();
    component.newProduct = { name: 'Souris', price: 40, selected: false };

    component.handleAddProduct();
    expect(component.submitting).toBeTrue();
    component.handleAddProduct();

    const requests = httpMock.match(apiUrl);
    expect(requests.length).toBe(1);
    expect(requests[0].request.method).toBe('POST');
    requests[0].flush({ id: 5, name: 'Souris', price: 40, selected: false });
    flushProducts();
  });

  it('should refresh after successful POST', () => {
    fixture.detectChanges();
    flushProducts();
    component.newProduct = { name: 'Casque', price: 75, selected: false };

    component.handleAddProduct();
    httpMock.expectOne(apiUrl).flush({ id: 6, name: 'Casque', price: 75, selected: false });
    flushProducts([
      ...sampleProducts,
      { id: 6, name: 'Casque', price: 75, selected: false }
    ]);

    expect(component.successMessage).toContain('Casque');
    expect(component.newProduct.name).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Casque');
  });

  it('should show an error when POST fails', () => {
    fixture.detectChanges();
    flushProducts();
    component.newProduct = { name: 'Tablette', price: 200, selected: true };

    component.handleAddProduct();
    httpMock.expectOne(apiUrl).flush({ message: 'bad' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(component.submitting).toBeFalse();
    expect(component.errorMessage).toContain('ajout du produit');
    expect(component.products?.length).toBe(3);
  });

  it('should PATCH selected then refresh GET', () => {
    fixture.detectChanges();
    flushProducts();

    component.handleToggleSelected(sampleProducts[1]);
    const patchReq = httpMock.expectOne(`${apiUrl}/2/selected`);
    expect(patchReq.request.method).toBe('PATCH');
    patchReq.flush({ id: 2, name: 'Imprimante Multifonction', price: 300, selected: true });

    flushProducts([
      sampleProducts[0],
      { id: 2, name: 'Imprimante Multifonction', price: 300, selected: true },
      sampleProducts[2]
    ]);

    expect(fixture.nativeElement.querySelectorAll('.badge.text-bg-success').length).toBe(3);
  });

  it('should show an error when PATCH fails', () => {
    fixture.detectChanges();
    flushProducts();

    component.handleToggleSelected(sampleProducts[0]);
    httpMock.expectOne(`${apiUrl}/1/selected`).flush({ message: 'fail' }, { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect(component.errorMessage).toContain('Ordinateur Portable');
    expect(component.products?.length).toBe(3);
  });

  it('should filter all products by default', () => {
    fixture.detectChanges();
    flushProducts();
    expect(component.filter).toBe('all');
    expect(component.filteredProducts.length).toBe(3);
  });

  it('should filter selected products only', () => {
    fixture.detectChanges();
    flushProducts();
    component.filter = 'selected';
    fixture.detectChanges();

    expect(component.filteredProducts.map((product) => product.name)).toEqual([
      'Ordinateur Portable',
      'Smartphone 5G'
    ]);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('should filter unselected products only', () => {
    fixture.detectChanges();
    flushProducts();
    component.filter = 'unselected';
    fixture.detectChanges();

    expect(component.filteredProducts.map((product) => product.name)).toEqual([
      'Imprimante Multifonction'
    ]);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('should show an empty filter state when no product matches', () => {
    fixture.detectChanges();
    flushProducts([
      { id: 1, name: 'Ordinateur Portable', price: 1300, selected: true },
      { id: 3, name: 'Smartphone 5G', price: 800, selected: true }
    ]);
    component.filter = 'unselected';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucun produit ne correspond au filtre');
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('should keep filter coherent after deletion', () => {
    fixture.detectChanges();
    flushProducts();
    component.filter = 'selected';
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(true);

    component.handleDelete(sampleProducts[0]);
    httpMock.expectOne(`${apiUrl}/1`).flush(null);
    flushProducts([sampleProducts[1], sampleProducts[2]]);

    expect(component.filteredProducts.map((product) => product.name)).toEqual(['Smartphone 5G']);
  });

  it('should keep filter coherent after addition', () => {
    fixture.detectChanges();
    flushProducts();
    component.filter = 'unselected';
    component.newProduct = { name: 'Webcam', price: 60, selected: false };

    component.handleAddProduct();
    httpMock.expectOne(apiUrl).flush({ id: 7, name: 'Webcam', price: 60, selected: false });
    flushProducts([
      ...sampleProducts,
      { id: 7, name: 'Webcam', price: 60, selected: false }
    ]);

    expect(component.filteredProducts.map((product) => product.name)).toEqual([
      'Imprimante Multifonction',
      'Webcam'
    ]);
  });

  it('should keep filter coherent after toggle', () => {
    fixture.detectChanges();
    flushProducts();
    component.filter = 'selected';

    component.handleToggleSelected(sampleProducts[1]);
    httpMock.expectOne(`${apiUrl}/2/selected`).flush({
      id: 2,
      name: 'Imprimante Multifonction',
      price: 300,
      selected: true
    });
    flushProducts([
      sampleProducts[0],
      { id: 2, name: 'Imprimante Multifonction', price: 300, selected: true },
      sampleProducts[2]
    ]);

    expect(component.filteredProducts.length).toBe(3);
  });

  it('should not send DELETE when confirm is cancelled', () => {
    fixture.detectChanges();
    flushProducts();
    spyOn(window, 'confirm').and.returnValue(false);

    component.handleDelete(sampleProducts[0]);
    fixture.detectChanges();

    httpMock.expectNone(`${apiUrl}/1`);
    expect(component.products?.length).toBe(3);
  });

  it('should DELETE then reload products when confirm is accepted', () => {
    fixture.detectChanges();
    flushProducts();
    spyOn(window, 'confirm').and.returnValue(true);

    component.handleDelete(sampleProducts[0]);

    const deleteReq = httpMock.expectOne(`${apiUrl}/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    flushProducts([sampleProducts[1], sampleProducts[2]]);
    expect(component.products?.length).toBe(2);
    expect(fixture.nativeElement.textContent).not.toContain('Ordinateur Portable');
  });

  it('should render the products title and catalog card', () => {
    fixture.detectChanges();
    flushProducts();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Liste des Produits');
    expect(fixture.nativeElement.querySelectorAll('.card').length).toBeGreaterThanOrEqual(2);
  });
});

describe('ProductsComponent routing compatibility', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should remain reachable through the products route with navbar', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await router.navigateByUrl('/products');
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8083/products');
    req.flush([
      { id: 1, name: 'Ordinateur Portable', price: 1300, selected: true }
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toBe('/products');
    expect(fixture.nativeElement.querySelector('nav.navbar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-products')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Liste des Produits');
  });
});
