
import { CartItem } from "@/types";
import { formatCurrency } from "@/utils/format";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) => {
  
  const total = items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
  
  return (
    <div 
      className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className={`absolute right-0 top-0 h-full bg-background shadow-xl 
          transition-transform w-full max-w-md sm:max-w-lg ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <h2 className="font-bold text-xl">Seu Pedido</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted"
              aria-label="Fechar carrinho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Cart items */}
          <div className="flex-grow overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Seu carrinho está vazio.</p>
                <button 
                  onClick={onClose}
                  className="mt-4 totem-button-secondary px-4 py-2"
                >
                  Ver cardápio
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex border-b pb-4">
                    <div className="w-20 h-20 rounded-md overflow-hidden mr-4">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <p className="font-semibold">
                          {formatCurrency(item.product.price)}
                        </p>
                        <div className="flex items-center">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 rounded-full hover:bg-muted disabled:opacity-50"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-muted"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1 ml-2 text-red-500 rounded-full hover:bg-muted"
                            aria-label="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t bg-card">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg">{formatCurrency(total)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full totem-button-primary py-3 text-lg font-semibold"
              >
                Finalizar pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
