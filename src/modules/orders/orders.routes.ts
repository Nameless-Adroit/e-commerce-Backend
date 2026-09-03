import { Router } from 'express';
import { OrdersController } from './orders.controller.js';
import { CheckoutDto, UpdateOrderStatusDto } from './orders.dto.js';
import { validateBody } from '../../middlewares/validation.middleware.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();
const ordersController = new OrdersController();

router.get('/my-orders', authenticate, ordersController.getMyOrders);
router.get('/', authenticate, requireRole('ADMIN'), ordersController.getAllOrders);
router.get('/:id', authenticate, ordersController.getOrderById);
router.post('/checkout', authenticate, validateBody(CheckoutDto), ordersController.checkout);
router.patch('/:id/status', authenticate, requireRole('ADMIN'), validateBody(UpdateOrderStatusDto), ordersController.updateStatus);

export default router;
