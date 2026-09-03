import { z } from 'zod';

export const AddToCartDto = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1').default(1),
  sessionToken: z.string().optional(),
});

export const UpdateCartItemDto = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});

export const SyncCartDto = z.object({
  sessionToken: z.string().min(1, 'Session token is required'),
});

export type AddToCartInput = z.infer<typeof AddToCartDto>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemDto>;
export type SyncCartInput = z.infer<typeof SyncCartDto>;
