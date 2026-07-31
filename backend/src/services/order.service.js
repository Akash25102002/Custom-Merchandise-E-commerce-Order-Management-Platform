const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const ApiError = require('../utils/ApiError');

class OrderService {
  async createOrder(userId, payload) {
    const { items, shippingAddress, shippingMethod = 'Standard', paymentInfo = {} } = payload;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Order must contain at least one item');
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      throw new ApiError(400, 'Complete shipping address is required');
    }

    // Process & calculate prices server-side
    let calculatedSubtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await productRepository.findById(item.product?._id || item.product);
      if (!product) {
        throw new ApiError(404, `Product '${item.name || 'item'}' no longer exists`);
      }

      const basePrice = Number(product.price);
      const qty = Math.max(1, Number(item.quantity) || 1);
      const customization = item.customization || {};

      // Size addon
      let sizeAddon = 0;
      if (customization.size === '2XL') sizeAddon = 3.0;
      if (customization.size === '3XL') sizeAddon = 5.0;

      // Print location addon
      let printAreaAddon = 0;
      if (customization.printArea === 'both') printAreaAddon = 6.0;
      else if (customization.printArea === 'back') printAreaAddon = 2.0;

      // Custom text / logo add-ons
      const textAddon = customization.customText?.trim().length > 0 ? 3.0 : 0;
      const logoAddon = customization.logoUrl ? 5.0 : 0;

      const unitPrice = Number((basePrice + sizeAddon + printAreaAddon + textAddon + logoAddon).toFixed(2));
      const totalPrice = Number((unitPrice * qty).toFixed(2));

      calculatedSubtotal += totalPrice;

      processedItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || item.image || '',
        customization: {
          color: customization.color || 'Default',
          colorHex: customization.colorHex || '#FFFFFF',
          size: customization.size || 'M',
          printArea: customization.printArea || 'front',
          customText: customization.customText || '',
          textFont: customization.textFont || 'sans-serif',
          textColor: customization.textColor || '#000000',
          logoUrl: customization.logoUrl || null,
        },
        unitPrice,
        quantity: qty,
        totalPrice,
      });
    }

    // Calculate shipping rates
    let shippingFee = 5.0; // Standard
    if (shippingMethod === 'Express') shippingFee = 15.0;
    if (shippingMethod === 'Overnight') shippingFee = 25.0;

    // Free shipping threshold for orders over $100
    if (calculatedSubtotal >= 100 && shippingMethod === 'Standard') {
      shippingFee = 0;
    }

    const subtotal = Number(calculatedSubtotal.toFixed(2));
    const taxFee = Number((subtotal * 0.08).toFixed(2)); // 8% sales tax
    const totalAmount = Number((subtotal + shippingFee + taxFee).toFixed(2));

    // Unique Order Number & Tracking ID
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `ORD-${Date.now().toString().slice(-4)}-${randomSuffix}`;
    const trackingId = `TRK-MS-${randomSuffix}`;

    const isPaid = paymentInfo.status === 'Paid' || paymentInfo.provider === 'COD';
    const initialStatus = isPaid ? 'Payment Confirmed' : 'Pending';

    const orderData = {
      orderNumber,
      customer: userId,
      items: processedItems,
      shippingAddress,
      shippingMethod,
      shippingFee,
      subtotal,
      taxFee,
      totalAmount,
      paymentInfo: {
        provider: paymentInfo.provider || 'Mock Gateway',
        status: isPaid ? 'Paid' : 'Pending',
        transactionId: paymentInfo.transactionId || `TXN-${randomSuffix}`,
        paidAt: isPaid ? new Date() : null,
      },
      orderStatus: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          note: isPaid ? 'Order placed and payment successfully authorized.' : 'Order submitted, awaiting payment authorization.',
          updatedAt: new Date(),
        },
      ],
      trackingId,
      carrier: 'MerchStudio Express',
    };

    return await orderRepository.create(orderData);
  }

  async getCustomerOrders(userId) {
    return await orderRepository.findByCustomer(userId);
  }

  async getOrderById(orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }
    return order;
  }

  async getAllOrders(filters) {
    return await orderRepository.findAll(filters);
  }

  async updateOrderStatus(orderId, newStatus, note = '') {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Workflow state machine validation rules
    const VALID_TRANSITIONS = {
      'Pending': ['Payment Confirmed', 'Cancelled'],
      'Payment Confirmed': ['Production', 'Cancelled'],
      'Production': ['Quality Check', 'Cancelled'],
      'Quality Check': ['Shipped', 'Production'],
      'Shipped': ['Out for Delivery'],
      'Out for Delivery': ['Delivered'],
      'Delivered': [],
      'Cancelled': [],
    };

    const allowed = VALID_TRANSITIONS[order.orderStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new ApiError(
        400,
        `Invalid status transition from '${order.orderStatus}' to '${newStatus}'. Allowed steps: [${allowed.join(', ')}]`
      );
    }

    return await orderRepository.updateStatus(orderId, newStatus, note);
  }
}

module.exports = new OrderService();
