import api from "@/utils/api";

export const productsApi = {
  getProducts(params = {}) {
    return api.get("/api/products", { params });
  },
  getProductBySlug(slug) {
    return api.get(`/api/products/slug/${slug}`);
  },
  getProductById(id) {
    return api.get(`/api/products/${id}`);
  },
  getFeaturedProducts(limit = 10) {
    return api.get("/api/products/featured", { params: { limit } });
  },
  searchProducts(query, params = {}) {
    return api.get(`/api/products/search/${query}`, { params });
  },
  getSearchSuggestions(query) {
    return api.get("/api/products/suggestions", { params: { q: query } });
  },
  getBrands() {
    return api.get("/api/brands");
  },
  getCollections() {
    return api.get("/api/collections");
  },
};
