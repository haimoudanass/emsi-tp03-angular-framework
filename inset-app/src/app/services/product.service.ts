import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NewProductRequest, Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:8083/products';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  addProduct(product: NewProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  toggleSelected(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/selected`, {});
  }

  deleteProduct(product: Product): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${product.id}`);
  }
}
