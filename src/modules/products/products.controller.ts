import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service.js';
import { sendSuccess } from '../../utils/response.js';

export class ProductsController {
  constructor(private productsService = new ProductsService()) {}

  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productsService.getProducts(req.query as any);
      sendSuccess(res, result.products, 'Products retrieved successfully', 200, result.pagination);
    } catch (err: any) {
      next(err);
    }
  };

  getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productsService.getProduct(req.params.identifier);
      sendSuccess(res, product, 'Product details retrieved');
    } catch (err: any) {
      next(err);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productsService.createProduct(req.body);
      sendSuccess(res, product, 'Product created successfully', 201);
    } catch (err: any) {
      next(err);
    }
  };

  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.productsService.getCategories();
      sendSuccess(res, categories, 'Categories retrieved');
    } catch (err: any) {
      next(err);
    }
  };

  getBrands = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const brands = await this.productsService.getBrands();
      sendSuccess(res, brands, 'Brands retrieved');
    } catch (err: any) {
      next(err);
    }
  };
}
