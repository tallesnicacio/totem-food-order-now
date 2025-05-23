
import { Restaurant } from "@/types";
import { useState } from "react";
import { Button } from "./ui/button";
import { formatCurrency } from "@/utils/format";
import { Loader } from "lucide-react";

interface CheckoutFormProps {
  total: number;
  restaurant: Restaurant;
  onCancel: () => void;
  onComplete: (customerName: string, paymentMethod: string, tableId?: string) => void;
  isSubmitting?: boolean;
  tableId?: string; // Add tableId as a prop
}

export const CheckoutForm = ({ 
  total, 
  restaurant,
  onCancel,
  onComplete,
  isSubmitting = false,
  tableId = '' // Default to empty string
}: CheckoutFormProps) => {
  const [customerName, setCustomerName] = useState("");
  const [localTableId, setLocalTableId] = useState(tableId); // Use provided tableId or empty string
  const [paymentMethod, setPaymentMethod] = useState(restaurant.paymentMethods.pix ? "pix" : "creditCard");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the provided tableId from props if available, otherwise use the localTableId
    onComplete(customerName, paymentMethod, tableId || localTableId);
  };
  
  return (
    <div className="p-4">
      <div className="totem-card p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Finalizar Pedido</h2>
        
        <div className="bg-muted p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span>Total do Pedido</span>
            <span className="font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Only show table input if restaurant uses tables AND no tableId is provided */}
          {restaurant.useTables && !tableId && (
            <div className="space-y-2">
              <label htmlFor="tableId" className="block font-medium">
                Número da Mesa
              </label>
              <input
                id="tableId"
                type="text"
                value={localTableId}
                onChange={(e) => setLocalTableId(e.target.value)}
                placeholder="Ex: 5"
                className="w-full p-3 border rounded-md"
              />
            </div>
          )}

          {/* If tableId is provided, show it as read-only */}
          {restaurant.useTables && tableId && (
            <div className="space-y-2">
              <label htmlFor="tableIdReadOnly" className="block font-medium">
                Mesa
              </label>
              <input
                id="tableIdReadOnly"
                type="text"
                value={tableId}
                readOnly
                className="w-full p-3 border rounded-md bg-muted"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="customerName" className="block font-medium">
              {restaurant.useTables ? "Seu nome (opcional)" : "Seu nome"}
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required={!restaurant.useTables}
              placeholder="Ex: Maria"
              className="w-full p-3 border rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-medium">Forma de pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {restaurant.paymentMethods.pix && (
                <button
                  type="button"
                  className={`p-4 border rounded-md flex flex-col items-center ${
                    paymentMethod === "pix" ? "border-primary bg-primary/10" : ""
                  }`}
                  onClick={() => setPaymentMethod("pix")}
                >
                  <span className="text-lg mb-1">PIX</span>
                </button>
              )}
              
              {restaurant.paymentMethods.creditCard && (
                <button
                  type="button"
                  className={`p-4 border rounded-md flex flex-col items-center ${
                    paymentMethod === "creditCard" ? "border-primary bg-primary/10" : ""
                  }`}
                  onClick={() => setPaymentMethod("creditCard")}
                >
                  <span className="text-lg mb-1">Cartão</span>
                </button>
              )}
              
              {restaurant.paymentMethods.cash && (
                <button
                  type="button"
                  className={`p-4 border rounded-md flex flex-col items-center ${
                    paymentMethod === "cash" ? "border-primary bg-primary/10" : ""
                  }`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <span className="text-lg mb-1">Dinheiro</span>
                </button>
              )}
              
              {restaurant.paymentMethods.payLater && (
                <button
                  type="button"
                  className={`p-4 border rounded-md flex flex-col items-center ${
                    paymentMethod === "payLater" ? "border-primary bg-primary/10" : ""
                  }`}
                  onClick={() => setPaymentMethod("payLater")}
                >
                  <span className="text-lg mb-1">Pagar depois</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              onClick={onCancel}
              variant="outline" 
              className="flex-1"
              disabled={isSubmitting}
            >
              Voltar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
