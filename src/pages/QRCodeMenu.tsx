import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CartDrawer } from "@/components/CartDrawer";
import { CategorySelector } from "@/components/CategorySelector";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderSuccess } from "@/components/OrderSuccess";
import { CATEGORIES, PRODUCTS, RESTAURANT } from "@/data/mockData";
import { CartItem, Product } from "@/types";

type MenuState = "menu" | "checkout" | "success";

const QRCodeMenu = () => {
  const [menuState, setMenuState] = useState<MenuState>("menu");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [tableId, setTableId] = useState<string | undefined>();
  
  const location = useLocation();
  
  useEffect(() => {
    // Parse table ID from URL query params
    // Format: /qrcode?e={establishment_id}&m={mesa_id}
    const params = new URLSearchParams(location.search);
    const mesa = params.get("m");
    if (mesa) {
      setTableId(mesa);
    }
  }, [location]);
  
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
    setMenuState("checkout");
  };
  
  const handleCompleteOrder = (customerName: string, paymentMethod: string, tableIdInput?: string) => {
    // Aqui poderia ter uma integração com o Supabase para salvar o pedido
    // Por enquanto apenas simularemos o sucesso do pedido
    
    // Use o tableId da URL ou o informado no checkout
    const finalTableId = tableId || tableIdInput;
    
    const randomOrderNumber = Math.floor(1000 + Math.random() * 9000).toString();
    setOrderNumber(randomOrderNumber);
    setMenuState("success");
  };
  
  const handleNewOrder = () => {
    setCartItems([]);
    setSelectedCategory(null);
    setMenuState("menu");
  };
  
  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
  
  return (
    <>
      {menuState === "menu" && (
        <div className="min-h-screen flex flex-col">
          <Header 
            restaurant={RESTAURANT}
            cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onCartClick={() => setIsCartOpen(true)}
          />
          
          {tableId && (
            <div className="bg-primary/10 px-4 py-2 text-center">
              <p className="text-sm font-medium">Mesa: {tableId}</p>
            </div>
          )}
          
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
      
      {menuState === "checkout" && (
        <div className="min-h-screen flex flex-col">
          <Header 
            restaurant={RESTAURANT}
            cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            onCartClick={() => setMenuState("menu")}
          />
          
          <CheckoutForm 
            total={total}
            restaurant={RESTAURANT}
            onCancel={() => setMenuState("menu")}
            onComplete={handleCompleteOrder}
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
