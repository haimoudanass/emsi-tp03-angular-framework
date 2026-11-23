import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ProductService } from './product.service';
import { NewProductRequest, Product } from '../models/product';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8083/products';

  const sampleProducts: Product[] = [
    { id: 1, name: 'Ordinateur Portable', price: 1300, selected: true },
    { id: 2, name: 'Imprimante Multifonction', price: 300, selected: false },
    { id: 3, name: 'Smartphone 5G', price: 800, selected: true }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET all products from the API', () => {
    let result: Product[] | undefined;

    service.getAllProducts().subscribe((products) => {
      result = products;
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(sampleProducts);

    expect(result).toEqual(sampleProducts);
  });

  it('should map the Observable to Product[]', () => {
    service.getAllProducts().subscribe((products) => {
      expect(products.length).toBe(3);
      expect(products[0].name).toBe('Ordinateur Portable');
    });

    httpMock.expectOne(apiUrl).flush(sampleProducts);
  });

  it('should POST a new product', () => {
    const payload: NewProductRequest = {
      name: 'Clavier',
      price: 100,
      selected: true
    };
    let created: Product | undefined;

    service.addProduct(payload).subscribe((product) => {
      created = product;
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 4, ...payload });

    expect(created).toEqual({ id: 4, ...payload });
  });

  it('should PATCH selected state', () => {
    let updated: Product | undefined;

    service.toggleSelected(2).subscribe((product) => {
      updated = product;
    });

    const req = httpMock.expectOne(`${apiUrl}/2/selected`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 2, name: 'Imprimante Multifonction', price: 300, selected: true });

    expect(updated?.selected).toBeTrue();
  });

  it('should DELETE a product by id', () => {
    let completed = false;

    service.deleteProduct(sampleProducts[0]).subscribe({
      next: () => {
        completed = true;
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBeTrue();
  });
});
