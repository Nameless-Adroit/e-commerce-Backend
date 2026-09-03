import { z } from 'zod';

export const CheckoutDto = z.object({
  shippingRecipient: z.string().min(1, 'Recipient name is required'),
  shippingStreet: z.string().min(1, 'Street address is required'),
  shippingCity: z.string().min(1, 'City is required'),
  shippingState: z.string().min(1, 'State is required'),
  shippingPostalCode: z.string().min(1, 'Postal code is required'),
  shippingCountry: z.string().default('United States'),
  paymentMethod: z.enum(['CREDIT_CARD', 'PAYPAL', 'STRIPE', 'CASH_ON_DELIVERY']),
  notes: z.string().optional(),
});

export const UpdateOrderStatusDto = z.object({
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
});

export type CheckoutInput = z.infer<typeof CheckoutDto>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusDto>;
