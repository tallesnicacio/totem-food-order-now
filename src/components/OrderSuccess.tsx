
import { Button } from "./ui/button";
import { Check } from "lucide-react";

interface OrderSuccessProps {
  orderNumber: string;
  onNewOrder: () => void;
}

export const OrderSuccess = ({ orderNumber, onNewOrder }: OrderSuccessProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="totem-card p-8 text-center max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <Check className="text-primary w-12 h-12" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Pedido Recebido!</h1>
          <p className="text-lg mb-2">Seu número de pedido é:</p>
          <p className="text-4xl font-bold mb-6 text-primary">#{orderNumber}</p>
          
          <p className="text-lg mb-8">
            Acompanhe seu preparo nos monitores e aguarde ser chamado.
          </p>
          
          <Button 
            onClick={onNewOrder}
            className="px-8 py-6 rounded-full bg-primary hover:bg-primary/90"
          >
            Fazer novo pedido
          </Button>
        </div>
      </div>
    </div>
  );
};
