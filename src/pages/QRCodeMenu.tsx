
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CartDrawer } from "@/components/CartDrawer";
import { CategorySelector } from "@/components/CategorySelector";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderSuccess } from "@/components/OrderSuccess";
import { CartItem, Product } from "@/types";
import { useCategories, useProducts, useRestaurant } from "@/hooks/useData";
import { createOrder } from "@/services/orderService";
import { toast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";

type MenuState = "menu" | "checkout" | "success";

const QRCodeMenu = () => {
  const [menuState, setMenuState] = useState<MenuState>("menu");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [tableId, setTableId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const location = useLocation();
  const { categories, loading: loadingCategories } = useCategories();
  const { products, loading: loadingProducts } = useProducts(selectedCategory || undefined);
  const { restaurant, loading: loadingRestaurant } = useRestaurant();
  
  // Apply theme color from restaurant settings if available
  useEffect(() => {
    if (restaurant?.themeColor) {
      document.documentElement.style.setProperty('--primary', restaurant.themeColor);
    }
  }, [restaurant]);
  
  // Parse table ID from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mesa = params.get("m");
    if (mesa) {
      setTableId(mesa);
    }
  }, [location]);
  
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
      
      // Convert Product to CartItem.product format
      return [...prevItems, { 
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          categoryId: product.categoryId || product.category_id
        }, 
        quantity: 1 
      }];
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
    setMenuState("checkout");
  };
  
  const handleCompleteOrder = async (customerName: string, paymentMethod: string, tableIdInput?: string) => {
    if (!restaurant) return;
    
    try {
      setIsSubmitting(true);
      
      // The tableId from URL takes precedence over the input
      const finalTableId = tableId || tableIdInput;
      
      const total = cartItems.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      // Save order to Supabase
      const order = await createOrder(cartItems, total, paymentMethod, customerName, finalTableId);
      
      if (order) {
        setOrderNumber(order.id.slice(-4));
        setMenuState("success");
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
    setMenuState("menu");
  };
  
  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  // Show loading state
  if (loadingRestaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }
  
  return (
    <>
      {menuState === "menu" && restaurant && (
        <div className="min-h-screen flex flex-col">
          <Header 
            restaurant={restaurant}
            cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onCartClick={() => setIsCartOpen(true)}
          />
          
          {tableId && (
            <div className="bg-primary/10 px-4 py-2 text-center">
              <p className="text-sm font-medium">Mesa: {tableId}</p>
            </div>
          )}
          
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
      
      {menuState === "checkout" && restaurant && (
        <div className="min-h-screen flex flex-col">
          <Header 
            restaurant={restaurant}
            cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onCartClick={() => setMenuState("menu")}
          />
          
          <CheckoutForm 
            total={total}
            restaurant={restaurant}
            onCancel={() => setMenuState("menu")}
            onComplete={handleCompleteOrder}
            isSubmitting={isSubmitting}
            tableId={tableId} // Pass the tableId from URL to the CheckoutForm
          />
        </div>
      )}
      
      {menuState === "success" && (
        <OrderSuccess 
          orderNumber={orderNumber}
          onNewOrder={handleNewOrder}
        />
      )}
    </>
  );
};

export default QRCodeMenu;
