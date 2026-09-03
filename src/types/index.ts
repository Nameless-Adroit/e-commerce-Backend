export type UserRole = 'ADMIN' | 'CUSTOMER' | 'MANAGER' | 'admin' | 'customer' | 'manager';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  street_address: string;
  unit_or_suite?: string;
  city: string;
  state_or_province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at?: Date;
}

export interface Category {
  id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
}

export interface Product {
  id: string;
  category_id?: string | null;
  brand_id?: string | null;
  title: string;
  slug: string;
  sku: string;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  rating_average: number;
  review_count: number;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
  images?: ProductImage[];
  category_name?: string;
  brand_name?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  is_thumbnail: boolean;
  sort_order: number;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_title?: string;
  product_image?: string;
  stock_quantity?: number;
  subtotal?: number;
}

export interface Cart {
  id: string;
  user_id?: string | null;
  session_token?: string | null;
  status: 'ACTIVE' | 'CONVERTED' | 'ABANDONED' | 'MERGED';
  created_at?: Date;
  updated_at?: Date;
  items: CartItem[];
  total_amount: number;
  total_items: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  shipping_recipient: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  notes?: string | null;
  placed_at?: Date;
  items?: OrderItem[];
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  transaction_reference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: string;
  paid_at?: Date | null;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  is_verified_purchase: boolean;
  created_at?: Date;
  user_name?: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  error?: any;
}
