import { useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { CategorySelector } from "@/components/CategorySelector";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderSuccess } from "@/components/OrderSuccess";
import { WelcomeTotem } from "@/components/WelcomeTotem";
import { CATEGORIES, PRODUCTS, RESTAURANT } from "@/data/mockData";
import { CartItem, Product } from "@/types";

type TotemState = "welcome" | "menu" | "checkout" | "success";

const TotemMenu = () => {
  const [totemState, setTotemState] = useState<TotemState>("welcome");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  
  const filteredProducts = selectedCategory 
    ? PRODUCTS.filter(product => product.categoryId === selectedCategory)
    : PRODUCTS;
  
  const handleAddToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevItems, { product, quantity: 1 }];
    });
  };
  
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  const handleRemoveItem = (productId: string) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item.product.id !== productId)
    );
  };
  
  const handleCheckout = () => {
    setIsCartOpen(false);
    setTotemState("checkout");
  };
  
  const handleCompleteOrder = (customerName: string, paymentMethod: string, tableId?: string) => {
    // Aqui poderia ter uma integração com o Supabase para salvar o pedido
    // Por enquanto apenas simularemos o sucesso do pedido
    
    const randomOrderNumber = Math.floor(1000 + Math.random() * 9000).toString();
    setOrderNumber(randomOrderNumber);
    setTotemState("success");
  };
  
  const handleNewOrder = () => {
    setCartItems([]);
    setSelectedCategory(null);
    setTotemState("welcome");
  };
  
  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
  
  return (
    <>
      {totemState === "welcome" && (
        <WelcomeTotem 
          restaurantName={RESTAURANT.name}
          logo={RESTAURANT.logo}
          onStart={() => setTotemState("menu")}
        />
      )}
      
      {totemState === "menu" && (
        <div className="min-h-screen flex flex-col">
          <Header 
            restaurant={RESTAURANT}
            cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onCartClick={() => setIsCartOpen(true)}
          />
          
          <CategorySelector 
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          <ProductGrid 
            products={filteredProducts}
            onAddToCart={handleAddToCart}
          />
          
          <CartDrawer 
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
          />
        </div>
      )}
      
      {totemState === "checkout" && (
        <div className="min-h-screen flex flex-col">
          <Header 
            restaurant={RESTAURANT}
            cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onCartClick={() => setTotemState("menu")}
          />
          
          <CheckoutForm 
            total={total}
            restaurant={RESTAURANT}
            onCancel={() => setTotemState("menu")}
            onComplete={handleCompleteOrder}
          />
        </div>
      )}
      
      {totemState === "success" && (
        <OrderSuccess 
          orderNumber={orderNumber}
          onNewOrder={handleNewOrder}
        />
      )}
    </>
  );
};

export default TotemMenu;
