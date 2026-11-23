package com.inset.productbackend.config;

import com.inset.productbackend.model.Product;
import com.inset.productbackend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

  @Bean
  CommandLineRunner initProducts(ProductRepository productRepository) {
    return args -> {
      if (productRepository.count() == 0) {
        productRepository.save(new Product("Ordinateur Portable", 1300, true));
        productRepository.save(new Product("Imprimante Multifonction", 300, false));
        productRepository.save(new Product("Smartphone 5G", 800, true));
      }
    };
  }
}
