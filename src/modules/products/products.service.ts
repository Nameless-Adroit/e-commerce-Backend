import { v4 as uuidv4 } from 'uuid';
import { ProductsRepository } from './products.repository.js';
import { ProductQueryParams, CreateProductInput } from './products.dto.js';

export class ProductsService {
  constructor(private productsRepo = new ProductsRepository()) {}

  async getProducts(params: ProductQueryParams) {
    return this.productsRepo.getProducts(params);
  }

  async getProduct(identifier: string) {
    const product = await this.productsRepo.getProductBySlugOrId(identifier);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(input: CreateProductInput) {
    const productId = `p-${uuidv4()}`;
    const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9+]/g, '-').replace(/(^-|-$)/g, '');

    const productData = {
      id: productId,
      category_id: input.categoryId || null,
      brand_id: input.brandId || null,
      title: input.title,
      slug,
      sku: input.sku,
      description: input.description || null,
      price: input.price,
      compare_at_price: input.compareAtPrice || null,
      cost_price: input.costPrice || null,
      stock_quantity: input.stockQuantity,
      is_active: input.isActive,
      is_featured: input.isFeatured,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    };

    const images = input.images?.map(img => ({
      id: `img-${uuidv4()}`,
      product_id: productId,
      image_url: img.imageUrl,
      alt_text: img.altText || null,
      is_thumbnail: img.isThumbnail,
      sort_order: img.sortOrder,
    }));

    return this.productsRepo.createProduct(productData, images);
  }

  async getCategories() {
    return this.productsRepo.getCategories();
  }

  async getBrands() {
    return this.productsRepo.getBrands();
  }
}
