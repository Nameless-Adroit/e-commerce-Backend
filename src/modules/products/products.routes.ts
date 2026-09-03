import { Router } from 'express';
import { ProductsController } from './products.controller.js';
import { ProductQueryDto, CreateProductDto } from './products.dto.js';
import { validateQuery, validateBody } from '../../middlewares/validation.middleware.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();
const productsController = new ProductsController();

router.get('/', validateQuery(ProductQueryDto), productsController.getProducts);
router.get('/categories', productsController.getCategories);
router.get('/brands', productsController.getBrands);
router.get('/:identifier', productsController.getProduct);
router.post('/', authenticate, requireRole('ADMIN'), validateBody(CreateProductDto), productsController.createProduct);

export default router;
