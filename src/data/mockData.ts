
import { Category, Product, Restaurant } from '../types';

// Restaurante vazio para novos estabelecimentos
export const RESTAURANT: Restaurant = {
  id: '',
  name: '',
  logo: '/placeholder.svg',
  themeColor: '#4CAF50',
  useTables: true,
  paymentMethods: {
    pix: true,
    creditCard: true,
    cash: true,
    payLater: false
  },
  paymentTiming: 'before'
};

// Categorias básicas para iniciar (podem ser editadas ou removidas)
export const CATEGORIES: Category[] = [];

// Nenhum produto pré-cadastrado
export const PRODUCTS: Product[] = [];
