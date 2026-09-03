import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
const paymentsController = new PaymentsController();

router.get('/order/:orderId', authenticate, paymentsController.getPayment);
router.post('/create-intent', authenticate, paymentsController.createIntent);
router.post('/webhook', paymentsController.webhook);

export default router;
