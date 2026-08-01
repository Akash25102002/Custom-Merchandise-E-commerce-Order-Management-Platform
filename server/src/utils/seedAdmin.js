const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const dbStore = require('./dbStore');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedUsers = async () => {
  const adminData = {
    name: 'ThreadCraft Admin',
    email: 'admin@threadcraft.com',
    password: 'Admin@123456',
    role: 'admin',
    phone: '+919876543210',
    addresses: [
      {
        street: 'HQ Studio Tower 4, Tech Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India',
        isDefault: true,
      },
    ],
  };

  const customerData = {
    name: 'Demo Customer',
    email: 'customer@threadcraft.com',
    password: 'Customer@123456',
    role: 'customer',
    phone: '+919123456789',
    addresses: [
      {
        street: '12 Rosewood Apartments',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        isDefault: true,
      },
    ],
  };

  try {
    const DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/custom_merchandise';
    await mongoose.connect(DB, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to MongoDB for user seeding...');

    // Upsert Admin User
    await User.deleteOne({ email: adminData.email });
    const admin = await User.create(adminData);
    console.log(`✅ Demo Admin User created: ${admin.email} (Role: ${admin.role})`);

    // Upsert Customer User
    await User.deleteOne({ email: customerData.email });
    const customer = await User.create(customerData);
    console.log(`✅ Demo Customer User created: ${customer.email} (Role: ${customer.role})`);

    process.exit(0);
  } catch (error) {
    console.warn('MongoDB seeding skipped (Offline/Unavailable):', error.message);
    console.log('⚡ Populating in-memory dbStore with demo users for local dev...');

    const hashedAdminPass = await bcrypt.hash(adminData.password, 12);
    const hashedCustPass = await bcrypt.hash(customerData.password, 12);

    const memoryAdmin = {
      _id: 'usr_admin_demo',
      id: 'usr_admin_demo',
      name: adminData.name,
      email: adminData.email.toLowerCase(),
      password: hashedAdminPass,
      role: 'admin',
      phone: adminData.phone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      createdAt: new Date(),
    };

    const memoryCustomer = {
      _id: 'usr_cust_demo',
      id: 'usr_cust_demo',
      name: customerData.name,
      email: customerData.email.toLowerCase(),
      password: hashedCustPass,
      role: 'customer',
      phone: customerData.phone,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
      createdAt: new Date(),
    };

    dbStore.users.set(memoryAdmin.id, memoryAdmin);
    dbStore.users.set(memoryCustomer.id, memoryCustomer);

    console.log('✅ Demo Admin User added to dbStore: admin@threadcraft.com / Admin@123456');
    console.log('✅ Demo Customer User added to dbStore: customer@threadcraft.com / Customer@123456');
    process.exit(0);
  }
};

if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
