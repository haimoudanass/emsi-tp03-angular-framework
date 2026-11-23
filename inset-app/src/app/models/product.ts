export interface Product {
  id: number;
  name: string;
  price: number;
  selected: boolean;
}

export type NewProductRequest = Omit<Product, 'id'>;

export type ProductFilter = 'all' | 'selected' | 'unselected';
