const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const sampleProducts = [
  {
    name: 'Premium Unisex Cotton Crewneck T-Shirt',
    slug: 'premium-unisex-cotton-tshirt',
    category: 't-shirt',
    description: '100% Ring-spun combed cotton, lightweight 180 GSM fabric with side seams. Perfect for direct-to-garment (DTG) artwork printing.',
    basePrice: 499,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
    ],
    colors: [
      { name: 'White', hex: '#FFFFFF', mockupUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800' },
      { name: 'Charcoal Black', hex: '#1E1E1E', mockupUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800' },
      { name: 'Navy Blue', hex: '#1B2A4A', mockupUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800' },
      { name: 'Heather Gray', hex: '#9E9E9E', mockupUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    printAreas: [
      { name: 'front', label: 'Front Chest', widthPercent: 65, heightPercent: 65, topPercent: 20, leftPercent: 17.5 },
      { name: 'back', label: 'Back Center', widthPercent: 65, heightPercent: 65, topPercent: 20, leftPercent: 17.5 },
    ],
    stock: 250,
    isFeatured: true,
  },
  {
    name: 'Heavyweight Fleece Pullover Hoodie',
    slug: 'heavyweight-fleece-pullover-hoodie',
    category: 'hoodie',
    description: '350 GSM premium cotton-poly blend with soft brushed fleece interior, double-lined hood, and matching drawstrings.',
    basePrice: 1299,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800',
    ],
    colors: [
      { name: 'Pitch Black', hex: '#111111', mockupUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800' },
      { name: 'Oatmeal Beige', hex: '#E6DFD5', mockupUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800' },
      { name: 'Forest Green', hex: '#1C3A27', mockupUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    printAreas: [
      { name: 'front', label: 'Front Chest', widthPercent: 55, heightPercent: 45, topPercent: 25, leftPercent: 22.5 },
      { name: 'back', label: 'Back Center', widthPercent: 65, heightPercent: 65, topPercent: 18, leftPercent: 17.5 },
    ],
    stock: 180,
    isFeatured: true,
  },
  {
    name: 'Custom Matte Ceramic Coffee Mug (11oz)',
    slug: 'custom-matte-ceramic-coffee-mug-11oz',
    category: 'mug',
    description: 'Durable 11oz ceramic mug with vibrant sublimation print area. Microwave & dishwasher safe.',
    basePrice: 299,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=800',
    ],
    colors: [
      { name: 'Pure White', hex: '#FFFFFF', mockupUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800' },
      { name: 'Midnight Black', hex: '#181818', mockupUrl: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=800' },
    ],
    sizes: ['Standard'],
    printAreas: [
      { name: 'wrap', label: 'Full Wrap Area', widthPercent: 80, heightPercent: 65, topPercent: 17.5, leftPercent: 10 },
    ],
    stock: 500,
    isFeatured: true,
  },
  {
    name: 'Gallery Framed Canvas Wall Art (12x16")',
    slug: 'gallery-framed-canvas-wall-art',
    category: 'canvas',
    description: 'Museum-quality 380 GSM textured poly-cotton canvas mounted on solid pine stretcher bars.',
    basePrice: 899,
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800',
    ],
    colors: [
      { name: 'Natural White', hex: '#FAFAFA', mockupUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800' },
    ],
    sizes: ['Standard'],
    printAreas: [
      { name: 'center', label: 'Full Canvas Print Surface', widthPercent: 90, heightPercent: 90, topPercent: 5, leftPercent: 5 },
    ],
    stock: 120,
    isFeatured: false,
  },
];

const seedDB = async () => {
  try {
    const DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/custom_merchandise';
    await mongoose.connect(DB);
    console.log('Database connected for seeding...');

    await Product.deleteMany({});
    console.log('Existing products cleared.');

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${createdProducts.length} customizable merchandise products! 🌱`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = sampleProducts;
