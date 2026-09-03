import { v4 as uuidv4 } from 'uuid';
import { CartRepository } from './cart.repository.js';
import { ProductsRepository } from '../products/products.repository.js';
import { AddToCartInput } from './cart.dto.js';

export class CartService {
  constructor(
    private cartRepo = new CartRepository(),
    private productsRepo = new ProductsRepository()
  ) {}

  async getCart(userId?: string, sessionToken?: string) {
    let cart = await this.cartRepo.findActiveCart(userId, sessionToken);
    if (!cart) {
      cart = await this.cartRepo.createCart({
        id: 'cart-' + uuidv4(),
        user_id: userId || null,
        session_token: sessionToken || (userId ? null : uuidv4()),
        status: 'ACTIVE',
      });
    }
    return cart;
  }

  async addToCart(input: AddToCartInput, userId?: string) {
    const product = await this.productsRepo.getProductBySlugOrId(input.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock_quantity < input.quantity) {
      throw new Error('Insufficient stock. Only ' + product.stock_quantity + ' available');
    }

    const cart = await this.getCart(userId, input.sessionToken);

    await this.cartRepo.addItem({
      id: 'ci-' + uuidv4(),
      cart_id: cart.id,
      product_id: product.id,
      quantity: input.quantity,
      unit_price: product.price,
    });

    return this.getCart(userId, input.sessionToken);
  }

  async updateItemQuantity(itemId: string, quantity: number, userId?: string, sessionToken?: string) {
    await this.cartRepo.updateItemQuantity(itemId, quantity);
    return this.getCart(userId, sessionToken);
  }

  async removeItem(itemId: string, userId?: string, sessionToken?: string) {
    await this.cartRepo.removeItem(itemId);
    return this.getCart(userId, sessionToken);
  }

  async syncGuestCart(sessionToken: string, userId: string) {
    await this.cartRepo.mergeGuestCart(sessionToken, userId);
    return this.getCart(userId);
  }
}
