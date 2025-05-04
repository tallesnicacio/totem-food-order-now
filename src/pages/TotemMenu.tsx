
import { useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { CategorySelector } from "@/components/CategorySelector";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderSuccess } from "@/components/OrderSuccess";
import { WelcomeTotem } from "@/components/WelcomeTotem";
import { CartItem, Product } from "@/types";
import { useCategories, useProducts, useRestaurant } from "@/hooks/useData";
import { createOrder } from "@/services/orderService";
import { toast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";

type TotemState = "welcome" | "menu" | "checkout" | "success";

const TotemMenu = () => {
  const [totemState, setTotemState] = useState<TotemState>("welcome");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { categories, loading: loadingCategories } = useCategories();
  const { products, loading: loadingProducts } = useProducts(selectedCategory || undefined);
  const { restaurant, loading: loadingRestaurant } = useRestaurant();
  
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
  
  const handleCompleteOrder = async (customerName: string, paymentMethod: string, tableId?: string) => {
    if (!restaurant) return;
    
    try {
      setIsSubmitting(true);
      const total = cartItems.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);
      
      // Save order to Supabase
      const order = await createOrder(cartItems, total, paymentMethod, customerName, tableId);
      
      if (order) {
        setOrderNumber(order.id.slice(-4));
        setTotemState("success");
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Erro",
        description: "Houve um problema ao finalizar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleNewOrder = () => {
    setCartItems([]);
    setSelectedCategory(null);
    setTotemState("welcome");
  };
  
  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  // Show loading state
  if (loadingRestaurant && totemState !== "welcome") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }
  
  return (
    <>
      {totemState === "welcome" && restaurant && (
        <WelcomeTotem 
          restaurantName={restaurant.name}
          logo={restaurant.logo}
          onStart={() => setTotemState("menu")}
        />
      )}
      
      {totemState === "menu" && restaurant && (
        <div className="min-h-screen flex flex-col">
          <Header 
            restaurant={restaurant}
            cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onCartClick={() => setIsCartOpen(true)}
          />
          
          <CategorySelector 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            loading={loadingCategories}
          />
          
          <ProductGrid 
            products={products}
            onAddToCart={handleAddToCart}
            loading={loadingProducts} 
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
      
      {totemState === "checkout" && restaurant && (
        <div className="min-h-screen flex flex-col">
          <Header 
            restaurant={restaurant}
            cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onCartClick={() => setTotemState("menu")}
          />
          
          <CheckoutForm 
            total={total}
            restaurant={restaurant}
            onCancel={() => setTotemState("menu")}
            onComplete={handleCompleteOrder}
            isSubmitting={isSubmitting}
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
