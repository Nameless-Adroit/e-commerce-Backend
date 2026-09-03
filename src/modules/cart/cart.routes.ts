import { Router } from 'express';
import { CartController } from './cart.controller.js';
import { AddToCartDto, UpdateCartItemDto, SyncCartDto } from './cart.dto.js';
import { validateBody } from '../../middlewares/validation.middleware.js';
import { optionalAuth, authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
const cartController = new CartController();

router.get('/', optionalAuth, cartController.getCart);
router.post('/items', optionalAuth, validateBody(AddToCartDto), cartController.addToCart);
router.put('/items/:itemId', optionalAuth, validateBody(UpdateCartItemDto), cartController.updateQuantity);
router.delete('/items/:itemId', optionalAuth, cartController.removeItem);
router.post('/sync', authenticate, validateBody(SyncCartDto), cartController.syncCart);

export default router;
