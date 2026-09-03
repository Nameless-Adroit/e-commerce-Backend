import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';
import { Payment } from '../../types/index.js';

export class PaymentsService {
  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    const payment = await db<Payment>('payments').where({ order_id: orderId }).first();
    return payment || null;
  }

  async processPaymentIntent(orderId: string, paymentMethod: string) {
    const order = await db('orders').where({ id: orderId }).first();
    if (!order) {
      throw new Error('Order not found');
    }

    const clientSecret = 'pi_' + uuidv4() + '_secret_' + uuidv4().substring(0, 8);
    return {
      orderId,
      amount: order.total_amount,
      currency: 'USD',
      paymentMethod,
      clientSecret,
      status: 'REQUIRES_PAYMENT_METHOD',
    };
  }

  async handleWebhook(event: { type: string; data: any }) {
    if (event.type === 'payment_intent.succeeded') {
      const { orderId, transactionId } = event.data;
      await db('payments').where({ order_id: orderId }).update({
        status: 'COMPLETED',
        transaction_reference: transactionId,
        paid_at: new Date(),
      });
      await db('orders').where({ id: orderId }).update({ status: 'PAID' });
      return { received: true, status: 'PAID' };
    }
    return { received: true };
  }
}
