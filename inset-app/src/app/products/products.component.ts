import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewProductRequest, Product, ProductFilter } from '../models/product';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-products',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] | undefined;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  filter: ProductFilter = 'all';
  submitting = false;

  newProduct: NewProductRequest = {
    name: '',
    price: 0,
    selected: false
  };

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.getProducts();
  }

  get filteredProducts(): Product[] {
    if (!this.products) {
      return [];
    }

    switch (this.filter) {
      case 'selected':
        return this.products.filter((product) => product.selected);
      case 'unselected':
        return this.products.filter((product) => !product.selected);
      default:
        return this.products;
    }
  }

  getProducts(): void {
    this.errorMessage = null;
    this.products = undefined;

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: () => {
        this.products = [];
        this.errorMessage = 'Impossible de charger le catalogue de produits. Vérifiez que l’API Spring Boot est démarrée sur le port 8083.';
      }
    });
  }

  handleAddProduct(): void {
    if (this.submitting) {
      return;
    }

    const name = this.newProduct.name.trim();
    const price = Number(this.newProduct.price);

    if (!name || !(price > 0)) {
      this.successMessage = null;
      this.errorMessage = 'Veuillez saisir un nom et un prix strictement positif.';
      return;
    }

    const payload: NewProductRequest = {
      name,
      price,
      selected: this.newProduct.selected
    };

    this.submitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.productService.addProduct(payload).subscribe({
      next: (created) => {
        this.successMessage = `Produit « ${created.name} » ajouté avec succès.`;
        this.resetForm();
        this.submitting = false;
        this.getProducts();
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'L’ajout du produit a échoué. Vérifiez les données saisies.';
      }
    });
  }

  handleToggleSelected(product: Product): void {
    this.errorMessage = null;
    this.successMessage = null;

    this.productService.toggleSelected(product.id).subscribe({
      next: () => {
        this.getProducts();
      },
      error: () => {
        this.errorMessage = `Impossible de modifier le statut de « ${product.name} ».`;
      }
    });
  }

  handleDelete(product: Product): void {
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer le produit ${product.name} ?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;

    this.productService.deleteProduct(product).subscribe({
      next: () => {
        this.getProducts();
      },
      error: () => {
        this.errorMessage = `La suppression du produit ${product.name} a échoué.`;
      }
    });
  }

  private resetForm(): void {
    this.newProduct = {
      name: '',
      price: 0,
      selected: false
    };
  }
}
