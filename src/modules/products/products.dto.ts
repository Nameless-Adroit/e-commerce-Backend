import { z } from 'zod';

export const ProductQueryDto = z.object({
  page: z.string().optional().transform(v => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform(v => (v ? parseInt(v, 10) : 20)),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().optional().transform(v => (v ? parseFloat(v) : undefined)),
  maxPrice: z.string().optional().transform(v => (v ? parseFloat(v) : undefined)),
  search: z.string().optional(),
  featured: z.string().optional().transform(v => v === 'true'),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'rating']).optional(),
});

export const CreateProductDto = z.object({
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().optional(),
  sku: z.string().min(2, 'SKU is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  stockQuantity: z.number().int().nonnegative('Stock cannot be negative').default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.object({
    imageUrl: z.string().url(),
    altText: z.string().optional(),
    isThumbnail: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
  })).optional(),
  metadata: z.record(z.any()).optional(),
});

export type ProductQueryParams = z.infer<typeof ProductQueryDto>;
export type CreateProductInput = z.infer<typeof CreateProductDto>;
