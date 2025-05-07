
import { Button } from "@/components/ui/button";

interface WelcomeTotemProps {
  restaurantName: string;
  logo?: string;
  onStart: () => void;
}

export const WelcomeTotem = ({ restaurantName, logo, onStart }: WelcomeTotemProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/20 to-secondary/20">
      <div className="totem-card p-8 text-center max-w-md w-full bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          {logo ? (
            <img 
              src={logo} 
              alt={`${restaurantName} Logo`} 
              className="w-32 h-32 mb-6 object-contain"
            />
          ) : (
            <div className="w-32 h-32 mb-6 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {restaurantName.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold mb-2">Bem-vindo ao</h1>
          <h2 className="text-4xl font-bold mb-6 text-primary">{restaurantName}</h2>
          
          <p className="text-lg mb-8">
            Faça seu pedido no nosso totem digital.
          </p>
          
          <Button 
            onClick={onStart}
            className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90"
          >
            Toque para começar
          </Button>
        </div>
      </div>
    </div>
  );
};
