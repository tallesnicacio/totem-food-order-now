
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ProductForm } from "@/components/ProductForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductTable } from "@/components/ProductTable";
import { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mapProductFromDB } from "@/types/supabase";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      const mappedProducts = data.map(mapProductFromDB);
      setProducts(mappedProducts);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw error;
      }

      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (product: Product) => {
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            category_id: product.categoryId,
            out_of_stock: false
          })
          .eq('id', product.id);

        if (error) throw error;
        
        setProducts(products.map(p => p.id === product.id ? product : p));
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso",
        });
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            category_id: product.categoryId,
            out_of_stock: false
          })
          .select();

        if (error) throw error;
        
        const newProduct = mapProductFromDB(data[0]);
        setProducts([...products, newProduct]);
        toast({
          title: "Sucesso",
          description: "Produto adicionado com sucesso",
        });
      }
      
      setShowForm(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto",
        variant: "destructive",
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Produtos"
        description="Gerencie os produtos disponíveis para venda"
        currentPage="Produtos"
      />

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
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </TabsContent>
            
            <TabsContent value="available">
              <ProductTable 
                products={products.filter(p => !p.outOfStock)} 
                loading={loading} 
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </TabsContent>
            
            <TabsContent value="out-of-stock">
              <ProductTable 
                products={products.filter(p => p.outOfStock)} 
                loading={loading}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct} 
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Products;
