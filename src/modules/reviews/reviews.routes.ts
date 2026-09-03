import { Router } from 'express';
import { ReviewsController } from './reviews.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });
const reviewsController = new ReviewsController();

router.get('/', reviewsController.getProductReviews);
router.post('/', authenticate, reviewsController.addReview);

export default router;
