
import { Restaurant } from "@/types";
import { useState } from "react";
import { Button } from "./ui/button";
import { formatCurrency } from "@/utils/format";

interface CheckoutFormProps {
  total: number;
  restaurant: Restaurant;
  onCancel: () => void;
  onComplete: (customerName: string, paymentMethod: string, tableId?: string) => void;
}

export const CheckoutForm = ({ 
  total, 
  restaurant,
  onCancel,
  onComplete
}: CheckoutFormProps) => {
  const [customerName, setCustomerName] = useState("");
  const [tableId, setTableId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(restaurant.paymentMethods.pix ? "pix" : "creditCard");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(customerName, paymentMethod, tableId);
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
          {restaurant.useTables && (
            <div className="space-y-2">
              <label htmlFor="tableId" className="block font-medium">
                Número da Mesa
              </label>
              <input
                id="tableId"
                type="text"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                placeholder="Ex: 5"
                className="w-full p-3 border rounded-md"
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
            >
              Voltar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
