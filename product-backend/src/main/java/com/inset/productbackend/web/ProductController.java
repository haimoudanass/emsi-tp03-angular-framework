package com.inset.productbackend.web;

import com.inset.productbackend.model.Product;
import com.inset.productbackend.repository.ProductRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
public class ProductController {

  private final ProductRepository productRepository;

  public ProductController(ProductRepository productRepository) {
    this.productRepository = productRepository;
  }

  @GetMapping
  public List<Product> getAllProducts() {
    return productRepository.findAll();
  }

  @PostMapping
  public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
    Optional<String> validationError = validate(request);
    if (validationError.isPresent()) {
      return ResponseEntity.badRequest().body(validationError.get());
    }

    Product product = new Product(
        request.getName().trim(),
        request.getPrice(),
        Boolean.TRUE.equals(request.getSelected())
    );
    Product saved = productRepository.save(product);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  @PatchMapping("/{id}/selected")
  public ResponseEntity<Product> toggleSelected(@PathVariable Long id) {
    Optional<Product> optionalProduct = productRepository.findById(id);
    if (optionalProduct.isEmpty()) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    Product product = optionalProduct.get();
    product.setSelected(!product.isSelected());
    Product saved = productRepository.save(product);
    return ResponseEntity.ok(saved);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
    if (!productRepository.existsById(id)) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    productRepository.deleteById(id);
    return ResponseEntity.noContent().build();
  }

  private Optional<String> validate(ProductRequest request) {
    if (request.getName() == null || request.getName().trim().isEmpty()) {
      return Optional.of("Le nom du produit est obligatoire.");
    }
    if (request.getPrice() == null || request.getPrice() <= 0) {
      return Optional.of("Le prix doit être strictement positif.");
    }
    if (request.getSelected() == null) {
      return Optional.of("Le champ selected est obligatoire.");
    }
    return Optional.empty();
  }
}
