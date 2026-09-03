import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service.js';
import { sendSuccess } from '../../utils/response.js';

export class UsersController {
  constructor(private usersService = new UsersService()) {}

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await this.usersService.getUsers(page, limit);
      sendSuccess(res, result.users, 'Users retrieved', 200, result.pagination);
    } catch (err: any) {
      next(err);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.usersService.getUserById(req.params.id);
      sendSuccess(res, result, 'User details retrieved');
    } catch (err: any) {
      next(err);
    }
  };

  getAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const addresses = await this.usersService.getAddresses(req.user!.userId);
      sendSuccess(res, addresses, 'User addresses retrieved');
    } catch (err: any) {
      next(err);
    }
  };

  addAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const address = await this.usersService.addAddress(req.user!.userId, req.body);
      sendSuccess(res, address, 'Address added successfully', 201);
    } catch (err: any) {
      next(err);
    }
  };

  deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.usersService.deleteAddress(req.params.id, req.user!.userId);
      sendSuccess(res, null, 'Address deleted successfully');
    } catch (err: any) {
      next(err);
    }
  };
}
