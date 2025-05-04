
import { Product } from "@/types";
import { formatCurrency } from "@/utils/format";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <div className="totem-card-interactive overflow-hidden flex flex-col">
      <div className="h-40 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="font-bold text-lg">{product.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 h-10">
            {product.description}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="font-bold text-lg">
            {formatCurrency(product.price)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="totem-button-primary px-3 py-1.5 text-sm"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};
