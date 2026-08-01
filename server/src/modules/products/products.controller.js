const Product = require('../../models/Product');
const Category = require('../../models/Category');
const dbStore = require('../../utils/dbStore');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');

// Default initial sample products for in-memory fallback
const initialMockCategories = [
  { _id: 'cat_tshirts', id: 'cat_tshirts', name: 'Apparel & T-Shirts', slug: 'apparel-t-shirts', description: 'Custom printed T-shirts, tops and cotton tees', isActive: true },
  { _id: 'cat_hoodies', id: 'cat_hoodies', name: 'Hoodies & Sweatshirts', slug: 'hoodies-sweatshirts', description: 'Heavyweight winter hoodies and pullovers', isActive: true },
  { _id: 'cat_drinkware', id: 'cat_drinkware', name: 'Mugs & Drinkware', slug: 'mugs-drinkware', description: 'Ceramic mugs, travel flasks and tumblers', isActive: true },
  { _id: 'cat_wallart', id: 'cat_wallart', name: 'Canvas & Wall Art', slug: 'canvas-wall-art', description: 'Mounted canvas prints and poster frames', isActive: true },
];

const initialMockProducts = [
  {
    _id: 'prod_1',
    id: 'prod_1',
    name: 'Premium Unisex Cotton Crewneck T-Shirt',
    slug: 'premium-unisex-cotton-tshirt',
    sku: 'TEE-COT-001',
    category: 'cat_tshirts',
    categoryName: 'Apparel & T-Shirts',
    description: '100% Ring-spun combed cotton, lightweight 180 GSM fabric. Perfect for direct-to-garment (DTG) artwork printing.',
    basePrice: 499,
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    availableColors: [
      { name: 'White', hex: '#FFFFFF', mockupUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800' },
      { name: 'Charcoal Black', hex: '#1E1E1E', mockupUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800' },
    ],
    stockQuantity: 250,
    printTypes: ['DTF', 'Screen Printing', 'Embroidery'],
    isActive: true,
    ratingsAverage: 4.8,
    ratingsCount: 42,
    createdAt: new Date(),
  },
  {
    _id: 'prod_2',
    id: 'prod_2',
    name: 'Heavyweight Fleece Pullover Hoodie',
    slug: 'heavyweight-fleece-pullover-hoodie',
    sku: 'HD-FLE-002',
    category: 'cat_hoodies',
    categoryName: 'Hoodies & Sweatshirts',
    description: '350 GSM premium cotton-poly blend with soft brushed fleece interior, double-lined hood.',
    basePrice: 1299,
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'],
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    availableColors: [
      { name: 'Pitch Black', hex: '#111111', mockupUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800' },
    ],
    stockQuantity: 180,
    printTypes: ['DTF', 'Embroidery'],
    isActive: true,
    ratingsAverage: 4.9,
    ratingsCount: 28,
    createdAt: new Date(),
  },
  {
    _id: 'prod_3',
    id: 'prod_3',
    name: 'Custom Matte Ceramic Coffee Mug (11oz)',
    slug: 'custom-matte-ceramic-coffee-mug-11oz',
    sku: 'MUG-CER-003',
    category: 'cat_drinkware',
    categoryName: 'Mugs & Drinkware',
    description: 'Durable 11oz ceramic mug with vibrant sublimation print wrap area.',
    basePrice: 299,
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800'],
    availableSizes: ['Standard'],
    availableColors: [
      { name: 'Pure White', hex: '#FFFFFF', mockupUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800' },
    ],
    stockQuantity: 500,
    printTypes: ['Sublimation', 'UV Printing'],
    isActive: true,
    ratingsAverage: 4.7,
    ratingsCount: 65,
    createdAt: new Date(),
  },
];

// Initialize in-memory fallback stores if not already populated
if (dbStore.products.size === 0) {
  initialMockProducts.forEach((p) => dbStore.products.set(p.id, p));
}

// ------------------------------------------------------------------------------
// ATOMIC STOCK DECREMENT HOOK (FOR ORDER FULFILLMENT)
// ------------------------------------------------------------------------------
/**
 * Atomic stock decrement helper function
 * Ensures thread-safe stock reduction preventing race conditions & negative stock
 */
const decrementProductStockAtomic = async (productId, quantity) => {
  if (dbStore.isMongoConnected()) {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, stockQuantity: { $gte: quantity }, isActive: true },
      { $inc: { stockQuantity: -quantity } },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      throw new AppError(`Insufficient stock for product ID: ${productId}`, 400);
    }
    return updatedProduct;
  } else {
    // In-memory atomic fallback
    const product = dbStore.products.get(productId);
    if (!product || product.stockQuantity < quantity) {
      throw new AppError(`Insufficient stock quantity for product: ${product?.name || productId}`, 400);
    }
    product.stockQuantity -= quantity;
    dbStore.products.set(productId, product);
    return product;
  }
};

// ------------------------------------------------------------------------------
// PRODUCT CONTROLLERS
// ------------------------------------------------------------------------------

const getProducts = catchAsync(async (req, res, next) => {
  const { category, minPrice, maxPrice, printType, search, sortBy, page = 1, limit = 12 } = req.query;

  if (dbStore.isMongoConnected()) {
    const query = { isActive: true };

    if (category) query.category = category;
    if (printType) query.printTypes = printType;
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    if (sortBy === 'price_asc') sortOptions.basePrice = 1;
    else if (sortBy === 'price_desc') sortOptions.basePrice = -1;
    else if (sortBy === 'rating') sortOptions.ratingsAverage = -1;
    else sortOptions.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    return res.status(200).json({
      status: 'success',
      results: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: { products },
    });
  } else {
    // In-memory Filter, Search, Sort & Paginate
    let list = Array.from(dbStore.products.values()).filter((p) => p.isActive !== false);

    if (category) {
      list = list.filter((p) => p.category === category || p.categoryName === category);
    }
    if (printType) {
      list = list.filter((p) => p.printTypes && p.printTypes.includes(printType));
    }
    if (minPrice) {
      list = list.filter((p) => p.basePrice >= Number(minPrice));
    }
    if (maxPrice) {
      list = list.filter((p) => p.basePrice <= Number(maxPrice));
    }
    if (search) {
      const term = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
    }

    if (sortBy === 'price_asc') list.sort((a, b) => a.basePrice - b.basePrice);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.basePrice - a.basePrice);
    else if (sortBy === 'rating') list.sort((a, b) => b.ratingsAverage - a.ratingsAverage);

    const total = list.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedProducts = list.slice(startIndex, startIndex + Number(limit));

    return res.status(200).json({
      status: 'success',
      results: paginatedProducts.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: { products: paginatedProducts },
    });
  }
});

const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  let product = null;
  if (dbStore.isMongoConnected()) {
    product = await Product.findById(id).populate('category', 'name slug');
  } else {
    product = dbStore.products.get(id) || Array.from(dbStore.products.values()).find((p) => p.slug === id);
  }

  if (!product) {
    return next(new AppError('Product not found with specified ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

const createProduct = catchAsync(async (req, res, next) => {
  const body = { ...req.body };

  // Handle uploaded images via Multer
  if (req.files && req.files.length > 0) {
    body.images = req.files.map((file) => `/uploads/${file.filename}`);
  } else if (req.file) {
    body.images = [`/uploads/${req.file.filename}`];
  } else if (typeof body.images === 'string') {
    body.images = [body.images];
  }

  if (!body.slug && body.name) {
    body.slug = body.name.toLowerCase().replace(/[^a-z0-0]/g, '-');
  }

  let newProduct;
  if (dbStore.isMongoConnected()) {
    newProduct = await Product.create(body);
  } else {
    const mockId = 'prod_' + Date.now();
    newProduct = {
      _id: mockId,
      id: mockId,
      ...body,
      slug: body.slug || 'product-' + Date.now(),
      images: body.images || ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'],
      isActive: true,
      ratingsAverage: 4.5,
      ratingsCount: 0,
      createdAt: new Date(),
    };
    dbStore.products.set(mockId, newProduct);
  }

  res.status(201).json({
    status: 'success',
    data: { product: newProduct },
  });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  let updatedProduct;
  if (dbStore.isMongoConnected()) {
    updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
  } else {
    const existing = dbStore.products.get(id);
    if (existing) {
      updatedProduct = { ...existing, ...req.body };
      dbStore.products.set(id, updatedProduct);
    }
  }

  if (!updatedProduct) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product: updatedProduct },
  });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Soft delete: set isActive to false
  if (dbStore.isMongoConnected()) {
    await Product.findByIdAndUpdate(id, { isActive: false });
  } else {
    const existing = dbStore.products.get(id);
    if (existing) {
      existing.isActive = false;
      dbStore.products.set(id, existing);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Product deactivated (soft deleted) successfully',
  });
});

// ------------------------------------------------------------------------------
// CATEGORY CONTROLLERS
// ------------------------------------------------------------------------------

const getCategories = catchAsync(async (req, res, next) => {
  let categories = [];
  if (dbStore.isMongoConnected()) {
    categories = await Category.find({ isActive: true });
  } else {
    categories = initialMockCategories;
  }

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories },
  });
});

const createCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  let category;
  if (dbStore.isMongoConnected()) {
    category = await Category.create({ name, slug, description });
  } else {
    category = { id: 'cat_' + Date.now(), name, slug, description, isActive: true };
  }

  res.status(201).json({
    status: 'success',
    data: { category },
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  decrementProductStockAtomic,
};
