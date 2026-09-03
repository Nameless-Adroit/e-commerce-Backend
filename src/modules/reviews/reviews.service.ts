import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';

export class ReviewsService {
  async getProductReviews(productId: string) {
    const reviews = await db('reviews')
      .join('users', 'reviews.user_id', 'users.id')
      .select(
        'reviews.*',
        db.raw("CONCAT(users.first_name, ' ', SUBSTRING(users.last_name, 1, 1), '.') as user_name")
      )
      .where('reviews.product_id', productId)
      .orderBy('reviews.created_at', 'desc');

    return reviews;
  }

  async addReview(userId: string, data: { productId: string; rating: number; title?: string; comment?: string }) {
    const existing = await db('reviews').where({ user_id: userId, product_id: data.productId }).first();
    if (existing) {
      throw new Error('You have already reviewed this product');
    }

    const order = await db('orders')
      .join('order_items', 'orders.id', 'order_items.order_id')
      .where({ 'orders.user_id': userId, 'order_items.product_id': data.productId, 'orders.status': 'DELIVERED' })
      .first();

    const isVerifiedPurchase = !!order;
    const reviewId = 'rev-' + uuidv4();

    await db('reviews').insert({
      id: reviewId,
      product_id: data.productId,
      user_id: userId,
      rating: data.rating,
      title: data.title || null,
      comment: data.comment || null,
      is_verified_purchase: isVerifiedPurchase,
    });

    const stats: any = await db('reviews')
      .where({ product_id: data.productId })
      .avg('rating as avg_rating')
      .count('id as review_count')
      .first();

    const avgRating = Math.round(Number(stats?.avg_rating || 0) * 10) / 10;
    const count = Number(stats?.review_count || 0);

    await db('products').where({ id: data.productId }).update({
      rating_average: avgRating,
      review_count: count,
    });

    return db('reviews').where({ id: reviewId }).first();
  }
}
