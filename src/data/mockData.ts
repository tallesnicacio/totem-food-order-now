
import { Category, Product, Restaurant } from '../types';

export const RESTAURANT: Restaurant = {
  id: '1',
  name: 'FoodTruck Express',
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

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Lanches', icon: 'burger' },
  { id: '2', name: 'Bebidas', icon: 'coffee' },
  { id: '3', name: 'Combos', icon: 'package' },
  { id: '4', name: 'Sobremesas', icon: 'ice-cream' }
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Hambúrguer Clássico',
    description: 'Pão, hambúrguer, queijo, alface, tomate e molho especial',
    price: 25.9,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&h=200&q=80',
    category_id: '1',
    categoryId: '1'
  },
  {
    id: '2',
    name: 'X-Bacon',
    description: 'Pão, hambúrguer, queijo, bacon crocante, alface, tomate e molho barbecue',
    price: 29.9,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=300&h=200&q=80',
    category_id: '1',
    categoryId: '1'
  },
  {
    id: '3',
    name: 'Veggie Burger',
    description: 'Pão integral, burguer de grão de bico, queijo vegano, alface, tomate e molho especial',
    price: 27.9,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&h=200&q=80',
    category_id: '1',
    categoryId: '1'
  },
  {
    id: '4',
    name: 'Refrigerante',
    description: 'Lata 350ml. Temos Coca-Cola, Guaraná e Sprite',
    price: 6.9,
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=300&h=200&q=80',
    category_id: '2',
    categoryId: '2'
  },
  {
    id: '5',
    name: 'Suco Natural',
    description: 'Copo 400ml. Sabores: Laranja, Limão, Maracujá',
    price: 9.9,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=300&h=200&q=80',
    category_id: '2',
    categoryId: '2'
  },
  {
    id: '6',
    name: 'Combo Família',
    description: '4 hambúrgueres clássicos, 4 porções de batata e 4 refrigerantes',
    price: 109.9,
    image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&w=300&h=200&q=80',
    category_id: '3',
    categoryId: '3'
  },
  {
    id: '7',
    name: 'Combo Individual',
    description: '1 hambúrguer, 1 batata e 1 refrigerante',
    price: 35.9,
    image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&w=300&h=200&q=80',
    category_id: '3',
    categoryId: '3'
  },
  {
    id: '8',
    name: 'Sorvete',
    description: 'Casquinha ou copinho. Sabores: Chocolate, Baunilha, Morango',
    price: 8.9,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&h=200&q=80',
    category_id: '4',
    categoryId: '4'
  }
];
