
import { PageHeader } from "@/components/PageHeader";
import { ProductManager } from "@/components/ProductManager";

const Products = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Gerencie os produtos disponíveis para venda"
        currentPage="Produtos"
      />
      
      <ProductManager />
    </div>
  );
};

export default Products;
