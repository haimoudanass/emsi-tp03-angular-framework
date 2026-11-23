package com.inset.productbackend.config;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

  /**
   * Pedagogical note: the course support shows {@code @CrossOrigin("*")}.
   * This TP uses a more restrictive local configuration that only allows the
   * Angular origins {@code http://localhost:4200} and {@code http://127.0.0.1:4200}.
   */
  @Bean
  CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "http://localhost:4200",
        "http://127.0.0.1:4200"
    ));
    config.setAllowedMethods(List.of("GET", "POST", "DELETE", "PATCH", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(false);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
  }
}
