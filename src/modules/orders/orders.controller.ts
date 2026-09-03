import { Request, Response, NextFunction } from 'express';
import { OrdersService } from './orders.service.js';
import { sendSuccess } from '../../utils/response.js';

export class OrdersController {
  constructor(private ordersService = new OrdersService()) {}

  getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await this.ordersService.getOrders(req.user!.userId, page, limit);
      sendSuccess(res, result.orders, 'My orders retrieved', 200, result.pagination);
    } catch (err: any) {
      next(err);
    }
  };

  getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await this.ordersService.getOrders(undefined, page, limit);
      sendSuccess(res, result.orders, 'All orders retrieved', 200, result.pagination);
    } catch (err: any) {
      next(err);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.role === 'ADMIN' ? undefined : req.user!.userId;
      const order = await this.ordersService.getOrderById(req.params.id, userId);
      sendSuccess(res, order, 'Order retrieved');
    } catch (err: any) {
      next(err);
    }
  };

  checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.ordersService.checkout(req.user!.userId, req.body);
      sendSuccess(res, order, 'Order placed successfully', 201);
    } catch (err: any) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.ordersService.updateStatus(req.params.id, req.body.status);
      sendSuccess(res, order, 'Order status updated');
    } catch (err: any) {
      next(err);
    }
  };
}
