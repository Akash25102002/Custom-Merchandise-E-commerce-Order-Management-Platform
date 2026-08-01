/**
 * Mock Courier Shipping Service
 * Structured cleanly so a real Shiprocket / Delhivery / Shippo SDK can be swapped in
 */
class CourierService {
  constructor() {
    this.couriers = [
      'Delhivery Surface Express',
      'Shiprocket Air Express',
      'BlueDart Direct',
      'DTDC Air Cargo',
    ];
    this.hubs = ['Bengaluru Sortation Center', 'Mumbai Gateway Hub', 'Delhi Fulfillment Center'];
  }

  generateTrackingNumber(courierName) {
    const prefix = courierName.split(' ')[0].toUpperCase();
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    return `${prefix}${randomDigits}`;
  }

  generateShipmentId() {
    return `SHIP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  }

  calculateEstimatedDelivery() {
    const daysToAdd = Math.floor(Math.random() * 3) + 3; // +3 to +5 days out
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
    return deliveryDate;
  }

  async createShipment(order, address) {
    const courierName = this.couriers[Math.floor(Math.random() * this.couriers.length)];
    const trackingNumber = this.generateTrackingNumber(courierName);
    const shipmentId = this.generateShipmentId();
    const estimatedDeliveryDate = this.calculateEstimatedDelivery();
    const originHub = this.hubs[Math.floor(Math.random() * this.hubs.length)];

    const initialTimeline = [
      {
        status: 'Manifested',
        location: originHub,
        timestamp: new Date(),
        description: `Shipment booked via ${courierName}. Package ready for pickup at fulfillment center.`,
      },
    ];

    // Return response shape mimicking Shiprocket/Delhivery API
    return {
      success: true,
      shipmentId,
      trackingNumber,
      courierName,
      estimatedDeliveryDate,
      status: 'Manifested',
      trackingTimeline: initialTimeline,
      rawCourierResponse: {
        provider: 'Delhivery_Mock_v2',
        status_code: 200,
        pickup_location: originHub,
        destination_pin: address.postalCode,
      },
    };
  }
}

module.exports = new CourierService();
