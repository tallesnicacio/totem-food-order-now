
import { Restaurant } from "@/types";
import { ShoppingCart } from "lucide-react";

interface HeaderProps {
  restaurant: Restaurant;
  cartItemCount: number;
  onCartClick: () => void;
}

export const Header = ({ restaurant, cartItemCount, onCartClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 bg-card z-10 border-b shadow-sm">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {restaurant.logo && (
            <img 
              src={restaurant.logo} 
              alt={`${restaurant.name} Logo`} 
              className="w-10 h-10 rounded-md"
            />
          )}
          <h1 className="text-xl font-bold">{restaurant.name}</h1>
        </div>
        
        <button 
          onClick={onCartClick}
          className="relative p-2 rounded-full hover:bg-muted"
          aria-label="Abrir carrinho"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
