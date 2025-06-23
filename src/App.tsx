import React, { useState, useMemo } from 'react';
import Header from './components/Layout/Header';
import Categories from './components/Layout/Categories';
import ProductGrid from './components/Products/ProductGrid';
import CartSidebar from './components/Cart/CartSidebar';
import { useCart } from './hooks/useCart';
import { categories, products, deliverySlots } from './data/mockData';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const cart = useCart();

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === '' || 
        categories.find(cat => cat.id === selectedCategory)?.name === product.category;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartItemsCount={cart.getTotalItems()}
        onCartClick={cart.toggleCart}
      />
      
      <Categories
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {searchQuery === '' && selectedCategory === '' && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 mb-8 text-white">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold mb-4">
                Fresh Groceries Delivered in 10 Minutes
              </h1>
              <p className="text-green-100 mb-6">
                Get fresh fruits, vegetables, and daily essentials delivered to your doorstep in just 10 minutes.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span>10-minute delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span>Fresh & Quality products</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span>Best prices guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div>
          {searchQuery || selectedCategory ? (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery ? `Search results for "${searchQuery}"` : 
                 categories.find(cat => cat.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Products</h2>
              <p className="text-gray-600">Fresh picks just for you</p>
            </div>
          )}

          <ProductGrid
            products={filteredProducts}
            getItemQuantity={cart.getItemQuantity}
            onAddToCart={cart.addToCart}
            onUpdateQuantity={cart.updateQuantity}
          />
        </div>
      </main>

      <CartSidebar
        isOpen={cart.isCartOpen}
        onClose={() => cart.setIsCartOpen(false)}
        cartItems={cart.cartItems}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeFromCart}
        totalPrice={cart.getTotalPrice()}
        deliverySlots={deliverySlots}
      />
    </div>
  );
}

export default App;