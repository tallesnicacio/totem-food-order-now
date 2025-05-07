export interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    categoryId: string;
  };
  quantity: number;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  category?: Category;
}

// Add OrderSummary if it doesn't exist
export interface OrderSummary {
  id: string;
  dayOrderNumber?: number;
  createdAt: string;
  status: 'new' | 'preparing' | 'ready' | 'delivered';
  total: number;
  paymentMethod: string;
  tableId?: string;
  customerName?: string;
  items: {
    id: string;
    quantity: number;
    notes?: string;
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
      description: string;
      categoryId: string;
    };
  }[];
}
