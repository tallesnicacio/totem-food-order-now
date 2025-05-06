
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  outOfStock?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface OrderSummary {
  id: string;
  items: CartItem[];
  total: number;
  tableId?: string;
  customerName?: string;
  status: 'new' | 'preparing' | 'ready' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
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
