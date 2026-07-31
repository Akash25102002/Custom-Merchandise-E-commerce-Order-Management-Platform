const Order = require('../models/order.model');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/orders.json');

const ensureDataFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
};

const getJSONOrders = () => {
  ensureDataFile();
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(content || '[]');
};

const writeJSONOrders = (orders) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
};

class OrderRepository {
  async create(orderData) {
    if (process.env.DB_MODE === 'json') {
      const orders = getJSONOrders();
      const newOrder = {
        _id: 'ord_' + Math.random().toString(36).substring(2, 11),
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      orders.unshift(newOrder);
      writeJSONOrders(orders);
      return newOrder;
    }
    const order = await Order.create(orderData);
    return await Order.findById(order._id).populate('customer', 'name email').populate('items.product');
  }

  async findById(id) {
    if (process.env.DB_MODE === 'json') {
      const orders = getJSONOrders();
      return orders.find((o) => o._id === id || o.orderNumber === id) || null;
    }
    return await Order.findById(id).populate('customer', 'name email').populate('items.product');
  }

  async findByCustomer(userId) {
    if (process.env.DB_MODE === 'json') {
      const orders = getJSONOrders();
      return orders.filter((o) => o.customer === userId || o.customer?._id === userId);
    }
    return await Order.find({ customer: userId }).sort({ createdAt: -1 }).populate('items.product');
  }

  async findAll(filters = {}) {
    if (process.env.DB_MODE === 'json') {
      const orders = getJSONOrders();
      let result = [...orders];
      if (filters.status) {
        result = result.filter((o) => o.orderStatus === filters.status);
      }
      return result;
    }
    const query = {};
    if (filters.status) {
      query.orderStatus = filters.status;
    }
    return await Order.find(query).sort({ createdAt: -1 }).populate('customer', 'name email').populate('items.product');
  }

  async updateStatus(id, newStatus, note = '') {
    if (process.env.DB_MODE === 'json') {
      const orders = getJSONOrders();
      const index = orders.findIndex((o) => o._id === id);
      if (index === -1) return null;

      const order = orders[index];
      order.orderStatus = newStatus;
      order.statusHistory.push({
        status: newStatus,
        note,
        updatedAt: new Date().toISOString(),
      });
      order.updatedAt = new Date().toISOString();

      orders[index] = order;
      writeJSONOrders(orders);
      return order;
    }

    const order = await Order.findById(id);
    if (!order) return null;

    order.orderStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      note,
      updatedAt: new Date(),
    });

    await order.save();
    return await Order.findById(id).populate('customer', 'name email').populate('items.product');
  }
}

module.exports = new OrderRepository();
