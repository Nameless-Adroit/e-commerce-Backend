import { db } from '../../database/db.js';
import { Product, ProductImage, Category, Brand } from '../../types/index.js';
import { ProductQueryParams } from './products.dto.js';

export class ProductsRepository {
  async getProducts(params: ProductQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = db('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .leftJoin('brands', 'products.brand_id', 'brands.id')
      .select(
        'products.*',
        'categories.name as category_name',
        'categories.slug as category_slug',
        'brands.name as brand_name',
        'brands.slug as brand_slug'
      )
      .where('products.is_active', true);

    let countQuery = db('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .leftJoin('brands', 'products.brand_id', 'brands.id')
      .where('products.is_active', true);

    if (params.category) {
      query = query.where((builder) => {
        builder.where('categories.slug', params.category).orWhere('categories.id', params.category);
      });
      countQuery = countQuery.where((builder) => {
        builder.where('categories.slug', params.category).orWhere('categories.id', params.category);
      });
    }

    if (params.brand) {
      query = query.where((builder) => {
        builder.where('brands.slug', params.brand).orWhere('brands.id', params.brand);
      });
      countQuery = countQuery.where((builder) => {
        builder.where('brands.slug', params.brand).orWhere('brands.id', params.brand);
      });
    }

    if (params.minPrice !== undefined) {
      query = query.where('products.price', '>=', params.minPrice);
      countQuery = countQuery.where('products.price', '>=', params.minPrice);
    }

    if (params.maxPrice !== undefined) {
      query = query.where('products.price', '<=', params.maxPrice);
      countQuery = countQuery.where('products.price', '<=', params.maxPrice);
    }

    if (params.featured !== undefined) {
      query = query.where('products.is_featured', params.featured);
      countQuery = countQuery.where('products.is_featured', params.featured);
    }

    if (params.search) {
      const s = '%' + params.search.toLowerCase() + '%';
      query = query.where((builder) => {
        builder.whereILike('products.title', s).orWhereILike('products.description', s);
      });
      countQuery = countQuery.where((builder) => {
        builder.whereILike('products.title', s).orWhereILike('products.description', s);
      });
    }

    switch (params.sortBy) {
      case 'price_asc':
        query = query.orderBy('products.price', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('products.price', 'desc');
        break;
      case 'rating':
        query = query.orderBy('products.rating_average', 'desc');
        break;
      default:
        query = query.orderBy('products.created_at', 'desc');
    }

    const [products, totalResult] = await Promise.all([
      query.limit(limit).offset(offset),
      countQuery.count<{ count: string | number }>('products.id as count').first(),
    ]);

    const total = Number(totalResult?.count || 0);

    if (products.length > 0) {
      const productIds = products.map((p: any) => p.id);
      const images = await db<ProductImage>('product_images')
        .whereIn('product_id', productIds)
        .orderBy('sort_order', 'asc');

      const imageMap = images.reduce((acc, img) => {
        acc[img.product_id] = acc[img.product_id] || [];
        acc[img.product_id].push(img);
        return acc;
      }, {} as Record<string, ProductImage[]>);

      products.forEach((p: any) => {
        p.images = imageMap[p.id] || [];
      });
    }

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductBySlugOrId(identifier: string): Promise<Product | null> {
    const product = await db('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .leftJoin('brands', 'products.brand_id', 'brands.id')
      .select(
        'products.*',
        'categories.name as category_name',
        'categories.slug as category_slug',
        'brands.name as brand_name',
        'brands.slug as brand_slug'
      )
      .where('products.id', identifier)
      .orWhere('products.slug', identifier)
      .first();

    if (!product) return null;

    const images = await db<ProductImage>('product_images')
      .where({ product_id: product.id })
      .orderBy('sort_order', 'asc');

    product.images = images;
    return product;
  }

  async createProduct(productData: any, images?: any[]): Promise<Product> {
    await db('products').insert(productData);
    if (images && images.length > 0) {
      await db('product_images').insert(images);
    }
    return (await this.getProductBySlugOrId(productData.id))!;
  }

  async getCategories(): Promise<Category[]> {
    return db<Category>('categories').where({ is_active: true }).orderBy('name', 'asc');
  }

  async getBrands(): Promise<Brand[]> {
    return db<Brand>('brands').orderBy('name', 'asc');
  }
}
