
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
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  categoryId?: string;  // Compatibility field for frontend
  category?: Category;
  outOfStock?: boolean;
  available?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  themeColor?: string;
  useTables: boolean;
  paymentMethods: {
    pix: boolean;
    creditCard: boolean;
    cash: boolean;
    payLater: boolean;
  };
  paymentTiming: 'before' | 'after';
}

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
