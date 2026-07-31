const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');

// Category Controller Handlers
const createCategory = asyncHandler(async (req, res) => {
  const category = await productService.createCategory(req.body);
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: { category }
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getAllCategories();
  res.status(200).json({
    success: true,
    message: "Categories retrieved successfully",
    data: { categories }
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await productService.deleteCategory(req.params.id);
  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: { category }
  });
});

// Product Controller Handlers
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.file);
  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: { product }
  });
});

const getProducts = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const products = await productService.getAllProducts({ category, search });
  res.status(200).json({
    success: true,
    message: "Products retrieved successfully",
    data: { products }
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Product details retrieved successfully",
    data: { product }
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.file);
  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: { product }
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: { product }
  });
});

module.exports = {
  createCategory,
  getCategories,
  deleteCategory,
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
};
