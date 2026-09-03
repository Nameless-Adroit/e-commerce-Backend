import { db } from '../../database/db.js';
import { Order, OrderItem, OrderStatus } from '../../types/index.js';

export class OrdersRepository {
  async getOrders(userId?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    let query = db<Order>('orders').orderBy('placed_at', 'desc');
    let countQuery = db('orders');

    if (userId) {
      query = query.where({ user_id: userId });
      countQuery = countQuery.where({ user_id: userId });
    }

    const [orders, totalResult] = await Promise.all([
      query.limit(limit).offset(offset),
      countQuery.count<{ count: string | number }>('id as count').first(),
    ]);

    const total = Number(totalResult?.count || 0);

    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const items = await db<OrderItem>('order_items').whereIn('order_id', orderIds);
      const itemsMap = items.reduce((acc, it) => {
        acc[it.order_id] = acc[it.order_id] || [];
        acc[it.order_id].push(it);
        return acc;
      }, {} as Record<string, OrderItem[]>);

      orders.forEach((o) => {
        o.items = itemsMap[o.id] || [];
      });
    }

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string, userId?: string): Promise<Order | null> {
    let query = db<Order>('orders').where({ id: orderId });
    if (userId) {
      query = query.where({ user_id: userId });
    }
    const order = await query.first();
    if (!order) return null;

    const items = await db<OrderItem>('order_items').where({ order_id: order.id });
    order.items = items;
    return order;
  }

  async createOrder(order: Partial<Order>, items: Partial<OrderItem>[]): Promise<Order> {
    const trx = await db.transaction();
    try {
      await trx('orders').insert(order);
      await trx('order_items').insert(items);
      
      for (const it of items) {
        await trx('products')
          .where({ id: it.product_id })
          .decrement('stock_quantity', it.quantity!);
      }

      await trx.commit();
      return (await this.getOrderById(order.id!))!;
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    await db('orders').where({ id: orderId }).update({ status });
    return this.getOrderById(orderId);
  }
}
