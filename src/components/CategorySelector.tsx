
import { Category } from "@/types";
import { Skeleton } from "./ui/skeleton";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  loading?: boolean;
}

export const CategorySelector = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  loading = false
}: CategorySelectorProps) => {
  if (loading) {
    return (
      <div className="py-4 overflow-x-auto">
        <div className="flex gap-2 px-4 min-w-max">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4 overflow-x-auto">
      <div className="flex gap-2 px-4 min-w-max">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${selectedCategory === null 
              ? 'bg-primary text-white' 
              : 'bg-muted hover:bg-muted/80'}`}
        >
          Todos
        </button>
        
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedCategory === category.id 
                ? 'bg-primary text-white' 
                : 'bg-muted hover:bg-muted/80'}`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};
