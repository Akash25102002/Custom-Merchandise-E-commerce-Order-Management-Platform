const Category = require('../models/category.model');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/categories.json');

const ensureDataFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
};

const getJSONCategories = () => {
  ensureDataFile();
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(content || '[]');
};

const writeJSONCategories = (categories) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(categories, null, 2));
};

class CategoryRepository {
  async findAll() {
    if (process.env.DB_MODE === 'json') {
      return getJSONCategories();
    }
    return await Category.find({});
  }

  async findById(id) {
    if (process.env.DB_MODE === 'json') {
      const categories = getJSONCategories();
      return categories.find(c => c._id === id) || null;
    }
    return await Category.findById(id);
  }

  async findByName(name) {
    if (process.env.DB_MODE === 'json') {
      const categories = getJSONCategories();
      return categories.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
    }
    return await Category.findOne({ name });
  }

  async create(categoryData) {
    if (process.env.DB_MODE === 'json') {
      const categories = getJSONCategories();
      const newCategory = {
        _id: 'cat_' + Math.random().toString(36).substring(2, 11),
        name: categoryData.name,
        description: categoryData.description || '',
        slug: categoryData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      categories.push(newCategory);
      writeJSONCategories(categories);
      return newCategory;
    }
    return await Category.create(categoryData);
  }

  async update(id, categoryData) {
    if (process.env.DB_MODE === 'json') {
      const categories = getJSONCategories();
      const index = categories.findIndex(c => c._id === id);
      if (index === -1) return null;
      
      const updated = {
        ...categories[index],
        name: categoryData.name ?? categories[index].name,
        description: categoryData.description ?? categories[index].description,
        slug: (categoryData.name ?? categories[index].name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
        updatedAt: new Date().toISOString()
      };
      categories[index] = updated;
      writeJSONCategories(categories);
      return updated;
    }
    return await Category.findByIdAndUpdate(id, categoryData, { new: true });
  }

  async delete(id) {
    if (process.env.DB_MODE === 'json') {
      const categories = getJSONCategories();
      const index = categories.findIndex(c => c._id === id);
      if (index === -1) return null;
      const deleted = categories.splice(index, 1);
      writeJSONCategories(categories);
      return deleted[0];
    }
    return await Category.findByIdAndDelete(id);
  }
}

module.exports = new CategoryRepository();
