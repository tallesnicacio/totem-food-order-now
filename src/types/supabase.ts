
import { Tables } from '@/integrations/supabase/types';

// Re-export types from Supabase schema to use in our app
export type CategoryRow = Tables<'categories'>;
export type ProductRow = Tables<'products'>;
export type OrderRow = Tables<'orders'>;
export type OrderItemRow = Tables<'order_items'>;
export type RestaurantRow = Tables<'restaurant'>;

// Map Supabase database types to our application domain types
export const mapCategoryFromDB = (category: CategoryRow): Category => ({
  id: category.id,
  name: category.name,
  icon: category.icon || undefined,
});

export const mapProductFromDB = (product: ProductRow): Product => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: Number(product.price),
  image: product.image,
  category_id: product.category_id,
  categoryId: product.category_id, // Add this for frontend compatibility
  outOfStock: product.out_of_stock || false,
  available: product.available !== undefined ? product.available : true,
});

export const mapOrderFromDB = (order: OrderRow): OrderSummary => ({
  id: order.id,
  items: [], // This will be filled separately with order items
  total: Number(order.total),
  tableId: order.table_id || undefined,
  customerName: order.customer_name || undefined,
  status: order.status as 'new' | 'preparing' | 'ready' | 'delivered',
  dayOrderNumber: order.day_order_number,
  createdAt: order.created_at,
});

export const mapRestaurantFromDB = (restaurant: RestaurantRow): Restaurant => ({
  id: restaurant.id,
  name: restaurant.name,
  logo: restaurant.logo || undefined,
  themeColor: restaurant.theme_color || undefined,
  useTables: restaurant.use_tables,
  paymentMethods: {
    pix: restaurant.payment_pix,
    creditCard: restaurant.payment_credit_card,
    cash: restaurant.payment_cash,
    payLater: restaurant.payment_later,
  },
  paymentTiming: restaurant.payment_timing as 'before' | 'after',
});

// Import existing types to ensure compatibility
import { Category, Product, OrderSummary, Restaurant } from '@/types';
