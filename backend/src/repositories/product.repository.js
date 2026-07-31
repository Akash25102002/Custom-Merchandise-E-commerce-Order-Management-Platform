const Product = require('../models/product.model');
const categoryRepository = require('./category.repository');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/products.json');

const ensureDataFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
};

const getJSONProducts = () => {
  ensureDataFile();
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(content || '[]');
};

const writeJSONProducts = (products) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
};

class ProductRepository {
  async findAll(query = {}) {
    if (process.env.DB_MODE === 'json') {
      const products = getJSONProducts();
      let filtered = [...products];
      
      if (query.category) {
        filtered = filtered.filter(p => p.category === query.category);
      }
      
      if (query.search) {
        const s = query.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(s) || 
          p.description.toLowerCase().includes(s) ||
          p.SKU.toLowerCase().includes(s)
        );
      }
      
      const populated = [];
      for (const p of filtered) {
        const cat = await categoryRepository.findById(p.category);
        populated.push({
          ...p,
          category: cat || { _id: p.category, name: 'General' }
        });
      }
      return populated;
    }
    
    const dbQuery = {};
    if (query.category) {
      dbQuery.category = query.category;
    }
    if (query.search) {
      dbQuery.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { SKU: { $regex: query.search, $options: 'i' } }
      ];
    }
    return await Product.find(dbQuery).populate('category');
  }

  async findById(id) {
    if (process.env.DB_MODE === 'json') {
      const products = getJSONProducts();
      const p = products.find(prod => prod._id === id);
      if (!p) return null;
      const cat = await categoryRepository.findById(p.category);
      return {
        ...p,
        category: cat || { _id: p.category, name: 'General' }
      };
    }
    return await Product.findById(id).populate('category');
  }

  async findBySKU(SKU) {
    if (process.env.DB_MODE === 'json') {
      const products = getJSONProducts();
      return products.find(p => p.SKU.toLowerCase() === SKU.toLowerCase()) || null;
    }
    return await Product.findOne({ SKU });
  }

  async create(productData) {
    if (process.env.DB_MODE === 'json') {
      const products = getJSONProducts();
      const newProduct = {
        _id: 'prd_' + Math.random().toString(36).substring(2, 11),
        name: productData.name,
        description: productData.description,
        category: productData.category,
        images: productData.images || [],
        price: Number(productData.price),
        availableSizes: productData.availableSizes || [],
        availableColors: productData.availableColors || [],
        stockQuantity: Number(productData.stockQuantity || 0),
        SKU: productData.SKU,
        printType: productData.printType,
        productType: productData.productType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      products.push(newProduct);
      writeJSONProducts(products);
      
      const cat = await categoryRepository.findById(newProduct.category);
      return {
        ...newProduct,
        category: cat || { _id: newProduct.category, name: 'General' }
      };
    }
    const product = await Product.create(productData);
    return await Product.findById(product._id).populate('category');
  }

  async update(id, productData) {
    if (process.env.DB_MODE === 'json') {
      const products = getJSONProducts();
      const index = products.findIndex(p => p._id === id);
      if (index === -1) return null;
      
      const updated = {
        ...products[index],
        name: productData.name ?? products[index].name,
        description: productData.description ?? products[index].description,
        category: productData.category ?? products[index].category,
        images: productData.images ?? products[index].images,
        price: productData.price !== undefined ? Number(productData.price) : products[index].price,
        availableSizes: productData.availableSizes ?? products[index].availableSizes,
        availableColors: productData.availableColors ?? products[index].availableColors,
        stockQuantity: productData.stockQuantity !== undefined ? Number(productData.stockQuantity) : products[index].stockQuantity,
        SKU: productData.SKU ?? products[index].SKU,
        printType: productData.printType ?? products[index].printType,
        productType: productData.productType ?? products[index].productType,
        updatedAt: new Date().toISOString()
      };
      products[index] = updated;
      writeJSONProducts(products);
      
      const cat = await categoryRepository.findById(updated.category);
      return {
        ...updated,
        category: cat || { _id: updated.category, name: 'General' }
      };
    }
    return await Product.findByIdAndUpdate(id, productData, { new: true }).populate('category');
  }

  async delete(id) {
    if (process.env.DB_MODE === 'json') {
      const products = getJSONProducts();
      const index = products.findIndex(p => p._id === id);
      if (index === -1) return null;
      const deleted = products.splice(index, 1);
      writeJSONProducts(products);
      return deleted[0];
    }
    return await Product.findByIdAndDelete(id);
  }
}

module.exports = new ProductRepository();
