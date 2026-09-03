import { Request, Response, NextFunction } from 'express';
import { ReviewsService } from './reviews.service.js';
import { sendSuccess } from '../../utils/response.js';

export class ReviewsController {
  constructor(private reviewsService = new ReviewsService()) {}

  getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviews = await this.reviewsService.getProductReviews(req.params.productId);
      sendSuccess(res, reviews, 'Product reviews retrieved');
    } catch (err: any) {
      next(err);
    }
  };

  addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await this.reviewsService.addReview(req.user!.userId, {
        productId: req.params.productId,
        ...req.body,
      });
      sendSuccess(res, review, 'Review submitted successfully', 201);
    } catch (err: any) {
      next(err);
    }
  };
}
