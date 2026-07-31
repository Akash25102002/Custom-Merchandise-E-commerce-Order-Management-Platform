const productRepository = require('../repositories/product.repository');
const categoryRepository = require('../repositories/category.repository');
const ApiError = require('../utils/ApiError');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if keys are supplied in the env configuration
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

class ProductService {
  async uploadImage(localFilePath) {
    if (!localFilePath) return null;

    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const response = await cloudinary.uploader.upload(localFilePath, {
          folder: 'custom_merchandise_products',
        });
        // Clear local temporary file after successful Cloudinary upload
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
        return response.secure_url;
      } else {
        // Return local relative server access URL
        const filename = localFilePath.split(/[\\/]/).pop();
        return `/uploads/${filename}`;
      }
    } catch (error) {
      // Clean up temp file on failure
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      throw new ApiError(500, `Image upload failed: ${error.message}`);
    }
  }

  // Category Actions
  async createCategory(categoryData) {
    const existing = await categoryRepository.findByName(categoryData.name);
    if (existing) {
      throw new ApiError(400, `Category with name '${categoryData.name}' already exists.`);
    }
    return await categoryRepository.create(categoryData);
  }

  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async deleteCategory(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    
    // Fail if there are active products inside this category
    const products = await productRepository.findAll({ category: id });
    if (products.length > 0) {
      throw new ApiError(400, 'Cannot delete category. There are active products linked to it.');
    }

    return await categoryRepository.delete(id);
  }

  // Product Actions
  async createProduct(productData, imageFile) {
    // Validate SKU uniqueness
    const existingSku = await productRepository.findBySKU(productData.SKU);
    if (existingSku) {
      throw new ApiError(400, `SKU '${productData.SKU}' is already linked to another product.`);
    }

    // Verify category presence
    const category = await categoryRepository.findById(productData.category);
    if (!category) {
      throw new ApiError(400, 'Selected category does not exist.');
    }

    let imageUrl = '';
    if (imageFile) {
      imageUrl = await this.uploadImage(imageFile.path);
    }

    // Parse array variables if they are sent as JSON strings from frontend formData
    const availableSizes = typeof productData.availableSizes === 'string'
      ? JSON.parse(productData.availableSizes)
      : productData.availableSizes;

    const availableColors = typeof productData.availableColors === 'string'
      ? JSON.parse(productData.availableColors)
      : productData.availableColors;

    const printType = typeof productData.printType === 'string'
      ? JSON.parse(productData.printType)
      : productData.printType;

    const newProductData = {
      ...productData,
      availableSizes: availableSizes || [],
      availableColors: availableColors || [],
      printType: printType || [],
      images: imageUrl ? [imageUrl] : (productData.images || [])
    };

    return await productRepository.create(newProductData);
  }

  async getAllProducts(query) {
    return await productRepository.findAll(query);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  }

  async updateProduct(id, productData, imageFile) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (productData.SKU && productData.SKU !== product.SKU) {
      const existingSku = await productRepository.findBySKU(productData.SKU);
      if (existingSku) {
        throw new ApiError(400, `SKU '${productData.SKU}' is already in use by another product.`);
      }
    }

    if (productData.category) {
      const category = await categoryRepository.findById(productData.category);
      if (!category) {
        throw new ApiError(400, 'Selected category does not exist.');
      }
    }

    let imageUrl = '';
    if (imageFile) {
      imageUrl = await this.uploadImage(imageFile.path);
    }

    // Parse arrays if they are sent as JSON strings
    const availableSizes = typeof productData.availableSizes === 'string'
      ? JSON.parse(productData.availableSizes)
      : productData.availableSizes;

    const availableColors = typeof productData.availableColors === 'string'
      ? JSON.parse(productData.availableColors)
      : productData.availableColors;

    const printType = typeof productData.printType === 'string'
      ? JSON.parse(productData.printType)
      : productData.printType;

    const updatedData = {
      ...productData,
    };

    if (availableSizes) updatedData.availableSizes = availableSizes;
    if (availableColors) updatedData.availableColors = availableColors;
    if (printType) updatedData.printType = printType;

    if (imageUrl) {
      updatedData.images = [imageUrl];
    }

    return await productRepository.update(id, updatedData);
  }

  async deleteProduct(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return await productRepository.delete(id);
  }
}

module.exports = new ProductService();
