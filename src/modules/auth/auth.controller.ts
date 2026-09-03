import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';

export class AuthController {
  constructor(private authService = new AuthService()) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      sendSuccess(res, result, 'Registration successful', 201);
    } catch (err: any) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (err: any) {
      next(err);
    }
  };

  profile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.getProfile(req.user!.userId);
      sendSuccess(res, result, 'User profile retrieved');
    } catch (err: any) {
      next(err);
    }
  };
}
