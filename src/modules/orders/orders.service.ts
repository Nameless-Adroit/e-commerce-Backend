import { v4 as uuidv4 } from 'uuid';
import { OrdersRepository } from './orders.repository.js';
import { CartRepository } from '../cart/cart.repository.js';
import { CheckoutInput } from './orders.dto.js';
import { OrderStatus } from '../../types/index.js';
import { db } from '../../database/db.js';

export class OrdersService {
  constructor(
    private ordersRepo = new OrdersRepository(),
    private cartRepo = new CartRepository()
  ) {}

  async getOrders(userId?: string, page = 1, limit = 20) {
    return this.ordersRepo.getOrders(userId, page, limit);
  }

  async getOrderById(orderId: string, userId?: string) {
    const order = await this.ordersRepo.getOrderById(orderId, userId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async checkout(userId: string, input: CheckoutInput) {
    const cart = await this.cartRepo.findActiveCart(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cannot checkout an empty cart');
    }

    for (const item of cart.items) {
      const p = await db('products').where({ id: item.product_id }).first();
      if (!p || p.stock_quantity < item.quantity) {
        throw new Error('Item ' + (p?.title || item.product_id) + ' is out of stock');
      }
    }

    const orderId = 'ord-' + uuidv4();
    const orderNumber = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000);

    const subtotal = cart.total_amount;
    const taxAmount = Math.round(subtotal * 0.08 * 100) / 100;
    const shippingFee = subtotal > 100 ? 0 : 9.99;
    const discountAmount = 0;
    const totalAmount = Math.round((subtotal + taxAmount + shippingFee - discountAmount) * 100) / 100;

    const orderData = {
      id: orderId,
      user_id: userId,
      order_number: orderNumber,
      status: 'PENDING' as OrderStatus,
      subtotal,
      tax_amount: taxAmount,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      shipping_recipient: input.shippingRecipient,
      shipping_street: input.shippingStreet,
      shipping_city: input.shippingCity,
      shipping_state: input.shippingState,
      shipping_postal_code: input.shippingPostalCode,
      shipping_country: input.shippingCountry,
      notes: input.notes || null,
    };

    const orderItems = cart.items.map((item) => ({
      id: 'oi-' + uuidv4(),
      order_id: orderId,
      product_id: item.product_id,
      product_title: item.product_title || 'Product',
      product_sku: 'SKU-' + item.product_id.substring(0, 6),
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.subtotal || Number(item.unit_price) * item.quantity,
    }));

    const createdOrder = await this.ordersRepo.createOrder(orderData, orderItems);

    await db('payments').insert({
      id: 'pay-' + uuidv4(),
      order_id: orderId,
      payment_method: input.paymentMethod,
      transaction_reference: 'TXN-' + uuidv4().substring(0, 12).toUpperCase(),
      status: input.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'COMPLETED',
      amount: totalAmount,
      currency: 'USD',
      paid_at: input.paymentMethod === 'CASH_ON_DELIVERY' ? null : new Date(),
    });

    if (input.paymentMethod !== 'CASH_ON_DELIVERY') {
      await this.ordersRepo.updateOrderStatus(orderId, 'PAID');
      createdOrder.status = 'PAID';
    }

    await db('carts').where({ id: cart.id }).update({ status: 'CONVERTED' });

    return createdOrder;
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    return this.ordersRepo.updateOrderStatus(orderId, status);
  }
}
