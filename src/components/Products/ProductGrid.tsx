import React from 'react';
import { Product } from '../../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  getItemQuantity: (productId: string) => number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  getItemQuantity,
  onAddToCart,
  onUpdateQuantity
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          quantity={getItemQuantity(product.id)}
          onAddToCart={() => onAddToCart(product)}
          onUpdateQuantity={(quantity) => onUpdateQuantity(product.id, quantity)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;