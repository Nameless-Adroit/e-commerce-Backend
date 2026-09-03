import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();
const usersController = new UsersController();

router.get('/', authenticate, requireRole('ADMIN'), usersController.getUsers);
router.get('/addresses', authenticate, usersController.getAddresses);
router.post('/addresses', authenticate, usersController.addAddress);
router.delete('/addresses/:id', authenticate, usersController.deleteAddress);
router.get('/:id', authenticate, requireRole('ADMIN'), usersController.getUserById);

export default router;
