import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service.js';
import { sendSuccess } from '../../utils/response.js';

export class PaymentsController {
  constructor(private paymentsService = new PaymentsService()) {}

  getPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await this.paymentsService.getPaymentByOrderId(req.params.orderId);
      sendSuccess(res, payment, 'Payment record retrieved');
    } catch (err: any) {
      next(err);
    }
  };

  createIntent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const intent = await this.paymentsService.processPaymentIntent(req.body.orderId, req.body.paymentMethod);
      sendSuccess(res, intent, 'Payment intent created');
    } catch (err: any) {
      next(err);
    }
  };

  webhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.paymentsService.handleWebhook(req.body);
      sendSuccess(res, result, 'Webhook processed');
    } catch (err: any) {
      next(err);
    }
  };
}
