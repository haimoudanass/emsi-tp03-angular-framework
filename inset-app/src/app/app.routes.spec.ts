import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { routes } from './app.routes';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';

@Component({
  standalone: true,
  template: '<router-outlet></router-outlet>',
  imports: [RouterOutlet]
})
class RoutingHostComponent {}

describe('App routes', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutingHostComponent],
      providers: [provideRouter(routes)]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    TestBed.createComponent(RoutingHostComponent);
  });

  it('should define home and products routes', () => {
    const homeRoute = routes.find((route) => route.path === 'home');
    const productsRoute = routes.find((route) => route.path === 'products');
    expect(homeRoute?.component).toBe(HomeComponent);
    expect(productsRoute?.component).toBe(ProductsComponent);
  });

  it('should redirect / to /home', async () => {
    await router.navigateByUrl('/');
    expect(location.path()).toBe('/home');
  });

  it('should navigate to /products', async () => {
    await router.navigateByUrl('/products');
    expect(location.path()).toBe('/products');
  });

  it('should navigate to /home', async () => {
    await router.navigateByUrl('/home');
    expect(location.path()).toBe('/home');
  });
});
