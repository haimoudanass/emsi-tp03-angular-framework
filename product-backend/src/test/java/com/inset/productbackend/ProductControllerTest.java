package com.inset.productbackend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inset.productbackend.model.Product;
import com.inset.productbackend.repository.ProductRepository;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ProductRepository productRepository;

  @Autowired
  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() {
    productRepository.deleteAll();
    productRepository.save(new Product("Ordinateur Portable", 1300, true));
    productRepository.save(new Product("Imprimante Multifonction", 300, false));
    productRepository.save(new Product("Smartphone 5G", 800, true));
  }

  @Test
  void getProducts_returnsHttp200() throws Exception {
    mockMvc.perform(get("/products"))
        .andExpect(status().isOk());
  }

  @Test
  void getProducts_containsThreeInitialProducts() throws Exception {
    mockMvc.perform(get("/products"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(3))
        .andExpect(jsonPath("$[0].name").value("Ordinateur Portable"))
        .andExpect(jsonPath("$[1].name").value("Imprimante Multifonction"))
        .andExpect(jsonPath("$[2].name").value("Smartphone 5G"));
  }

  @Test
  void getProducts_jsonFieldsAreCorrect() throws Exception {
    mockMvc.perform(get("/products"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").isNumber())
        .andExpect(jsonPath("$[0].name").value("Ordinateur Portable"))
        .andExpect(jsonPath("$[0].price").value(1300.0))
        .andExpect(jsonPath("$[0].selected").value(true))
        .andExpect(jsonPath("$[1].price").value(300.0))
        .andExpect(jsonPath("$[1].selected").value(false))
        .andExpect(jsonPath("$[2].price").value(800.0))
        .andExpect(jsonPath("$[2].selected").value(true));
  }

  @Test
  void deleteProduct_returns204() throws Exception {
    Long id = productRepository.findAll().get(0).getId();

    mockMvc.perform(delete("/products/{id}", id))
        .andExpect(status().isNoContent());
  }

  @Test
  void getAfterDelete_doesNotContainDeletedProduct() throws Exception {
    Long id = productRepository.findAll().get(0).getId();

    mockMvc.perform(delete("/products/{id}", id))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/products"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2));

    assertThat(productRepository.findById(id)).isEmpty();
  }

  @Test
  void deleteUnknownId_returns404() throws Exception {
    mockMvc.perform(delete("/products/{id}", 9999L))
        .andExpect(status().isNotFound());
  }

  @Test
  void postValidProduct_returns201() throws Exception {
    String body = objectMapper.writeValueAsString(Map.of(
        "name", "Clavier Mécanique",
        "price", 120,
        "selected", true
    ));

    mockMvc.perform(post("/products")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").isNumber())
        .andExpect(jsonPath("$.name").value("Clavier Mécanique"))
        .andExpect(jsonPath("$.price").value(120.0))
        .andExpect(jsonPath("$.selected").value(true));

    assertThat(productRepository.count()).isEqualTo(4);
  }

  @Test
  void postWithoutName_returns400() throws Exception {
    String body = objectMapper.writeValueAsString(Map.of(
        "name", "   ",
        "price", 50,
        "selected", false
    ));

    mockMvc.perform(post("/products")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isBadRequest());
  }

  @Test
  void postWithInvalidPrice_returns400() throws Exception {
    String body = objectMapper.writeValueAsString(Map.of(
        "name", "Souris",
        "price", 0,
        "selected", false
    ));

    mockMvc.perform(post("/products")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isBadRequest());
  }

  @Test
  void postWithClientProvidedId_ignoresClientId() throws Exception {
    String body = """
        {"id":999,"name":"Écran 27","price":450,"selected":false}
        """;

    mockMvc.perform(post("/products")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").isNumber())
        .andExpect(jsonPath("$.id").value(org.hamcrest.Matchers.not(999)))
        .andExpect(jsonPath("$.name").value("Écran 27"));
  }

  @Test
  void patchSelected_returns200AndTogglesValue() throws Exception {
    Product product = productRepository.findAll().stream()
        .filter(item -> !item.isSelected())
        .findFirst()
        .orElseThrow();

    mockMvc.perform(patch("/products/{id}/selected", product.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(product.getId()))
        .andExpect(jsonPath("$.selected").value(true))
        .andExpect(jsonPath("$.name").value(product.getName()))
        .andExpect(jsonPath("$.price").value(product.getPrice()));
  }

  @Test
  void patchSelectedUnknownId_returns404() throws Exception {
    mockMvc.perform(patch("/products/{id}/selected", 9999L))
        .andExpect(status().isNotFound());
  }

  @Test
  void patchSelected_doesNotChangeNameOrPrice() throws Exception {
    Product product = productRepository.findAll().get(0);
    String originalName = product.getName();
    double originalPrice = product.getPrice();

    mockMvc.perform(patch("/products/{id}/selected", product.getId()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value(originalName))
        .andExpect(jsonPath("$.price").value(originalPrice));

    Product reloaded = productRepository.findById(product.getId()).orElseThrow();
    assertThat(reloaded.getName()).isEqualTo(originalName);
    assertThat(reloaded.getPrice()).isEqualTo(originalPrice);
  }

  @Test
  void corsGetFromLocalhost4200_isAllowed() throws Exception {
    mockMvc.perform(get("/products")
            .header(HttpHeaders.ORIGIN, "http://localhost:4200"))
        .andExpect(status().isOk())
        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:4200"));
  }

  @Test
  void corsPreflightDelete_isAllowed() throws Exception {
    mockMvc.perform(options("/products/1")
            .header(HttpHeaders.ORIGIN, "http://127.0.0.1:4200")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "DELETE")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type"))
        .andExpect(status().isOk())
        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://127.0.0.1:4200"))
        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsString("DELETE")));
  }

  @Test
  void corsPostFromLocalhost4200_isAllowed() throws Exception {
    String body = objectMapper.writeValueAsString(Map.of(
        "name", "Casque Audio",
        "price", 90,
        "selected", false
    ));

    mockMvc.perform(post("/products")
            .header(HttpHeaders.ORIGIN, "http://localhost:4200")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isCreated())
        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:4200"));
  }

  @Test
  void corsPatchFromLocalhost4200_isAllowed() throws Exception {
    Long id = productRepository.findAll().get(0).getId();

    mockMvc.perform(patch("/products/{id}/selected", id)
            .header(HttpHeaders.ORIGIN, "http://localhost:4200"))
        .andExpect(status().isOk())
        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:4200"));
  }

  @Test
  void corsUnauthorizedOrigin_isNotAllowed() throws Exception {
    mockMvc.perform(get("/products")
            .header(HttpHeaders.ORIGIN, "http://evil.example"))
        .andExpect(status().isForbidden())
        .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
  }
}
