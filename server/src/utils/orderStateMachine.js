const AppError = require('./AppError');

/**
 * Strict Order Workflow State Machine Map
 */
const ORDER_WORKFLOW_STEPS = [
  'Order Placed',
  'Payment Verified',
  'Design Approved',
  'Printing In Progress',
  'Quality Check',
  'Packed',
  'Shipment Created',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const ALLOWED_TRANSITIONS = {
  'Order Placed': ['Payment Verified', 'Cancelled'],
  'Payment Verified': ['Design Approved', 'Cancelled'],
  'Design Approved': ['Printing In Progress', 'Cancelled'],
  'Printing In Progress': ['Quality Check'],
  'Quality Check': ['Packed'],
  'Packed': ['Shipment Created'],
  'Shipment Created': ['Shipped'],
  'Shipped': ['Out for Delivery'],
  'Out for Delivery': ['Delivered'],
  'Delivered': [],
  'Cancelled': [],
};

/**
 * Validate if a status transition is allowed
 */
const canTransition = (currentStatus, nextStatus) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
};

/**
 * Get next valid status options for a given status
 */
const getNextValidStatuses = (currentStatus) => {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
};

/**
 * Enforce state machine transition or throw AppError
 */
const transitionOrderStatus = (order, nextStatus, note = '') => {
  const currentStatus = order.status;

  if (currentStatus === nextStatus) {
    throw new AppError(`Order is already in "${currentStatus}" status`, 400);
  }

  if (!canTransition(currentStatus, nextStatus)) {
    const validNext = getNextValidStatuses(currentStatus);
    const validMsg = validNext.length > 0 ? validNext.join(' or ') : 'None (Terminal state)';
    throw new AppError(
      `Invalid status transition from "${currentStatus}" to "${nextStatus}". Next valid step must be: ${validMsg}`,
      400
    );
  }

  order.status = nextStatus;
  order.statusHistory.push({
    status: nextStatus,
    timestamp: new Date(),
    note: note || `Order status updated to ${nextStatus}`,
  });

  return order;
};

module.exports = {
  ORDER_WORKFLOW_STEPS,
  ALLOWED_TRANSITIONS,
  canTransition,
  getNextValidStatuses,
  transitionOrderStatus,
};
