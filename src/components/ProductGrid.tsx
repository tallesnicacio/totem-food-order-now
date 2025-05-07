
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "./ui/skeleton";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  loading?: boolean;
  emptyMessage?: string; // Add the optional emptyMessage prop
}

export const ProductGrid = ({ products, onAddToCart, loading = false, emptyMessage = "No products available" }: ProductGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-24">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="totem-card-interactive overflow-hidden flex flex-col">
            <Skeleton className="h-40 w-full" />
            <div className="p-4 flex flex-col justify-between flex-grow">
              <div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-24">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart} 
        />
      ))}
    </div>
  );
};
