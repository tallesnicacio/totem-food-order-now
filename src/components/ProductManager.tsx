
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ProductForm } from "@/components/ProductForm";
import { ProductFilterTabs } from "@/components/ProductFilterTabs";
import { Product } from "@/types";
import { useProducts } from "@/hooks/useProducts";

export const ProductManager = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSubmit = async (product: Product) => {
    let success;
    if (editingProduct) {
      // Update existing product
      success = await updateProduct(product);
    } else {
      // Create new product
      success = await addProduct(product);
    }
    
    if (success) {
      setShowForm(false);
      setEditingProduct(null);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <>
      {showForm ? (
        <ProductForm 
          product={editingProduct} 
          onSubmit={handleFormSubmit} 
          onCancel={handleFormCancel}
        />
      ) : (
        <>
          <div className="flex justify-end mb-6">
            <Button onClick={handleAddProduct}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>

          <ProductFilterTabs 
            products={products} 
            loading={loading}
            onEdit={handleEditProduct}
            onDelete={deleteProduct}
          />
        </>
      )}
    </>
  );
};
