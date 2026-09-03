import { Request, Response, NextFunction } from 'express';
import { CartService } from './cart.service.js';
import { sendSuccess } from '../../utils/response.js';

export class CartController {
  constructor(private cartService = new CartService()) {}

  getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = (req.headers['x-session-token'] as string) || (req.query.sessionToken as string);
      const cart = await this.cartService.getCart(req.user?.userId, sessionToken);
      sendSuccess(res, cart, 'Shopping cart retrieved');
    } catch (err: any) {
      next(err);
    }
  };

  addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = (req.headers['x-session-token'] as string) || req.body.sessionToken;
      const cart = await this.cartService.addToCart({ ...req.body, sessionToken }, req.user?.userId);
      sendSuccess(res, cart, 'Item added to cart');
    } catch (err: any) {
      next(err);
    }
  };

  updateQuantity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = (req.headers['x-session-token'] as string) || (req.query.sessionToken as string);
      const cart = await this.cartService.updateItemQuantity(
        req.params.itemId,
        req.body.quantity,
        req.user?.userId,
        sessionToken
      );
      sendSuccess(res, cart, 'Cart updated');
    } catch (err: any) {
      next(err);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = (req.headers['x-session-token'] as string) || (req.query.sessionToken as string);
      const cart = await this.cartService.removeItem(req.params.itemId, req.user?.userId, sessionToken);
      sendSuccess(res, cart, 'Item removed from cart');
    } catch (err: any) {
      next(err);
    }
  };

  syncCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await this.cartService.syncGuestCart(req.body.sessionToken, req.user!.userId);
      sendSuccess(res, cart, 'Guest cart merged successfully');
    } catch (err: any) {
      next(err);
    }
  };
}
