import { Product, Category, DeliverySlot } from '../types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Vegetables & Fruits',
    icon: '🥬',
    image: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=300',
    itemCount: 150
  },
  {
    id: '2',
    name: 'Dairy & Bakery',
    icon: '🥛',
    image: 'https://images.pexels.com/photos/416607/pexels-photo-416607.jpeg?auto=compress&cs=tinysrgb&w=300',
    itemCount: 85
  },
  {
    id: '3',
    name: 'Meat & Seafood',
    icon: '🐟',
    image: 'https://images.pexels.com/photos/3297882/pexels-photo-3297882.jpeg?auto=compress&cs=tinysrgb&w=300',
    itemCount: 45
  },
  {
    id: '4',
    name: 'Beverages',
    icon: '🥤',
    image: 'https://images.pexels.com/photos/544961/pexels-photo-544961.jpeg?auto=compress&cs=tinysrgb&w=300',
    itemCount: 120
  },
  {
    id: '5',
    name: 'Snacks & Packaged',
    icon: '🍿',
    image: 'https://images.pexels.com/photos/4963439/pexels-photo-4963439.jpeg?auto=compress&cs=tinysrgb&w=300',
    itemCount: 200
  },
  {
    id: '6',
    name: 'Personal Care',
    icon: '🧴',
    image: 'https://images.pexels.com/photos/3735170/pexels-photo-3735170.jpeg?auto=compress&cs=tinysrgb&w=300',
    itemCount: 75
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Fresh Bananas',
    price: 40,
    originalPrice: 50,
    image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Vegetables & Fruits',
    unit: '1 dozen',
    inStock: true,
    discount: 20,
    rating: 4.5,
    deliveryTime: '10 mins'
  },
  {
    id: '2',
    name: 'Organic Milk',
    price: 65,
    image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Dairy & Bakery',
    unit: '1L',
    inStock: true,
    rating: 4.8,
    deliveryTime: '10 mins'
  },
  {
    id: '3',
    name: 'Fresh Bread',
    price: 35,
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Dairy & Bakery',
    unit: '400g',
    inStock: true,
    rating: 4.3,
    deliveryTime: '10 mins'
  },
  {
    id: '4',
    name: 'Red Apples',
    price: 120,
    originalPrice: 140,
    image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Vegetables & Fruits',
    unit: '1kg',
    inStock: true,
    discount: 14,
    rating: 4.6,
    deliveryTime: '10 mins'
  },
  {
    id: '5',
    name: 'Coca Cola',
    price: 45,
    image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Beverages',
    unit: '300ml',
    inStock: true,
    rating: 4.2,
    deliveryTime: '10 mins'
  },
  {
    id: '6',
    name: 'Potato Chips',
    price: 25,
    image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Snacks & Packaged',
    unit: '50g',
    inStock: true,
    rating: 4.1,
    deliveryTime: '10 mins'
  },
  {
    id: '7',
    name: 'Fresh Carrots',
    price: 55,
    image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Vegetables & Fruits',
    unit: '500g',
    inStock: true,
    rating: 4.4,
    deliveryTime: '10 mins'
  },
  {
    id: '8',
    name: 'Yogurt Cup',
    price: 30,
    image: 'https://images.pexels.com/photos/1143754/pexels-photo-1143754.jpeg?auto=compress&cs=tinysrgb&w=300',
    category: 'Dairy & Bakery',
    unit: '200g',
    inStock: true,
    rating: 4.7,
    deliveryTime: '10 mins'
  }
];

export const deliverySlots: DeliverySlot[] = [
  { id: '1', time: '10-15 mins', price: 0, available: true },
  { id: '2', time: '15-20 mins', price: 0, available: true },
  { id: '3', time: '20-30 mins', price: 5, available: true },
  { id: '4', time: '30-45 mins', price: 0, available: false }
];