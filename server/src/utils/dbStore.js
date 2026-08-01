const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

class DBStore {
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.initDefaultData();
  }

  isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  async initDefaultData() {
    const hashedAdminPass = await bcrypt.hash('Admin@123456', 12);
    const hashedCustPass = await bcrypt.hash('Customer@123456', 12);

    const memoryAdmin = {
      _id: 'usr_admin_demo',
      id: 'usr_admin_demo',
      name: 'ThreadCraft Admin',
      email: 'admin@threadcraft.com',
      password: hashedAdminPass,
      role: 'admin',
      phone: '+919876543210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      createdAt: new Date(),
    };

    const memoryCustomer = {
      _id: 'usr_cust_demo',
      id: 'usr_cust_demo',
      name: 'Demo Customer',
      email: 'customer@threadcraft.com',
      password: hashedCustPass,
      role: 'customer',
      phone: '+919123456789',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
      createdAt: new Date(),
    };

    this.users.set(memoryAdmin.id, memoryAdmin);
    this.users.set(memoryCustomer.id, memoryCustomer);
  }
}

const dbStore = new DBStore();
module.exports = dbStore;
