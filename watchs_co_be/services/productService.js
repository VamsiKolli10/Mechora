const productRepository = require("../repositories/productRepository");

const reserveInventory = (items, client) =>
  productRepository.reserveInventory(items, client);

const createProduct = (productData) => productRepository.insertWatch(productData);

const getAllProducts = async (options) => {
  const result = await productRepository.findAll(options);
  await productRepository.ensureSlugs(result.watches);
  return {
    products: result.watches,
    pagination: result.pagination,
  };
};

const getProductById = async (id, assetRepository) => {
  const result = await productRepository.findById(id);
  if (result.rows.length === 0) {
    return null;
  }

  await productRepository.ensureSlugs(result.rows);
  const assetsResult = await assetRepository.getAssetsByWatchId(id);

  return {
    ...result.rows[0],
    assets: assetsResult.rows,
  };
};

const getProductBySlug = async (slug, assetRepository) => {
  const result = await productRepository.findBySlug(slug);
  if (result.rows.length === 0) {
    return null;
  }

  const product = result.rows[0];
  await productRepository.ensureSlugs([product]);

  const assetsResult = await assetRepository.getAssetsByWatchId(product.id);
  product.assets = assetsResult.rows;

  const recommendedResult = await productRepository.getRecommendedWatches(
    product.id,
    6
  );
  await productRepository.ensureSlugs(recommendedResult.rows);
  product.recommended = recommendedResult.rows;

  return product;
};

const updateProduct = (id, productData) =>
  productRepository.updateById(id, productData);

const deleteProduct = (id) => productRepository.deleteById(id);

const searchProducts = async (searchTerm, { page = 1, limit = 20 } = {}) => {
  const result = await productRepository.fullTextSearch(searchTerm, {
    page,
    limit,
  });
  await productRepository.ensureSlugs(result.rows);

  return {
    products: result.rows,
    pagination: {
      page,
      limit,
      total: result.rows.length,
    },
  };
};

const getFeaturedProducts = async (limit = 10) => {
  const result = await productRepository.getFeaturedWatches(limit);
  await productRepository.ensureSlugs(result.rows);
  return result.rows;
};

const getProductSuggestions = async (query, limit = 10) => {
  const result = await productRepository.getSearchSuggestions(query, limit);
  return result.rows;
};

module.exports = {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  getProductSuggestions,
  searchProducts,
  updateProduct,
  reserveInventory,
};
