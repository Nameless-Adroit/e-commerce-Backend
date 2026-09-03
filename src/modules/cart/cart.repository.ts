import { db } from '../../database/db.js';
import { Cart, CartItem } from '../../types/index.js';

export class CartRepository {
  async findActiveCart(userId?: string, sessionToken?: string): Promise<Cart | null> {
    let query = db<Cart>('carts').where('status', 'ACTIVE');
    if (userId) {
      query = query.where('user_id', userId);
    } else if (sessionToken) {
      query = query.where('session_token', sessionToken);
    } else {
      return null;
    }

    const cart = await query.first();
    if (!cart) return null;

    const items = await db('cart_items')
      .join('products', 'cart_items.product_id', 'products.id')
      .leftJoin('product_images', function() {
        this.on('products.id', '=', 'product_images.product_id')
          .andOn('product_images.is_thumbnail', '=', db.raw('?', [true]));
      })
      .select(
        'cart_items.id',
        'cart_items.cart_id',
        'cart_items.product_id',
        'cart_items.quantity',
        'cart_items.unit_price',
        'products.title as product_title',
        'products.stock_quantity',
        'product_images.image_url as product_image'
      )
      .where('cart_items.cart_id', cart.id);

    const enrichedItems: CartItem[] = items.map((item: any) => ({
      ...item,
      subtotal: Number(item.unit_price) * item.quantity,
    }));

    const totalAmount = enrichedItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const totalItems = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      ...cart,
      items: enrichedItems,
      total_amount: Math.round(totalAmount * 100) / 100,
      total_items: totalItems,
    };
  }

  async createCart(cart: Partial<Cart>): Promise<Cart> {
    await db('carts').insert(cart);
    return (await this.findActiveCart(cart.user_id || undefined, cart.session_token || undefined))!;
  }

  async addItem(cartItem: Partial<CartItem>): Promise<void> {
    const existing = await db('cart_items')
      .where({ cart_id: cartItem.cart_id, product_id: cartItem.product_id })
      .first();

    if (existing) {
      await db('cart_items')
        .where({ id: existing.id })
        .update({
          quantity: existing.quantity + (cartItem.quantity || 1),
          unit_price: cartItem.unit_price,
        });
    } else {
      await db('cart_items').insert(cartItem);
    }
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await db('cart_items').where({ id: itemId }).del();
    } else {
      await db('cart_items').where({ id: itemId }).update({ quantity });
    }
  }

  async removeItem(itemId: string): Promise<void> {
    await db('cart_items').where({ id: itemId }).del();
  }

  async clearCart(cartId: string): Promise<void> {
    await db('cart_items').where({ cart_id: cartId }).del();
  }

  async mergeGuestCart(guestSessionToken: string, userId: string): Promise<void> {
    const guestCart = await this.findActiveCart(undefined, guestSessionToken);
    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await this.findActiveCart(userId);
    if (!userCart) {
      await db('carts').where({ id: guestCart.id }).update({ user_id: userId, session_token: null });
      return;
    }

    for (const item of guestCart.items) {
      await this.addItem({
        id: 'ci-' + Math.random().toString(36).substring(2, 9),
        cart_id: userCart.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      });
    }

    await db('carts').where({ id: guestCart.id }).update({ status: 'MERGED' });
  }
}
