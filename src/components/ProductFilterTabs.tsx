
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types";
import { ProductTable } from "@/components/ProductTable";

interface ProductFilterTabsProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductFilterTabs = ({
  products,
  loading,
  onEdit,
  onDelete
}: ProductFilterTabsProps) => {
  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-4">
        <TabsTrigger value="all">Todos os Produtos</TabsTrigger>
        <TabsTrigger value="available">Disponíveis</TabsTrigger>
        <TabsTrigger value="out-of-stock">Esgotados</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <ProductTable 
          products={products} 
          loading={loading} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TabsContent>
      
      <TabsContent value="available">
        <ProductTable 
          products={products.filter(p => !(p.outOfStock || p.out_of_stock))} 
          loading={loading} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TabsContent>
      
      <TabsContent value="out-of-stock">
        <ProductTable 
          products={products.filter(p => p.outOfStock || p.out_of_stock)} 
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete} 
        />
      </TabsContent>
    </Tabs>
  );
};
