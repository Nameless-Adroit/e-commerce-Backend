import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { RegisterDto, LoginDto } from './auth.dto.js';
import { validateBody } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
const authController = new AuthController();

router.post('/register', validateBody(RegisterDto), authController.register);
router.post('/login', validateBody(LoginDto), authController.login);
router.get('/profile', authenticate, authController.profile);

export default router;
