
import { useState, useEffect } from "react";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mapProductFromDB } from "@/types/supabase";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const addProduct = async (product: Product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category_id: product.categoryId,
          out_of_stock: product.outOfStock || false,
          available: product.available !== undefined ? product.available : true
        })
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        const newProduct = mapProductFromDB(data[0]);
        setProducts([...products, newProduct]);
        toast({
          title: "Sucesso",
          description: "Produto adicionado com sucesso",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category_id: product.categoryId,
          out_of_stock: product.outOfStock || false,
          available: product.available !== undefined ? product.available : true
        })
        .eq('id', product.id);

      if (error) throw error;
      
      setProducts(products.map(p => p.id === product.id ? product : p));
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
      return true;
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleProductAvailability = async (productId: string, available: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available })
        .eq('id', productId);

      if (error) throw error;
      
      setProducts(products.map(p => p.id === productId ? { ...p, available } : p));
      toast({
        title: "Sucesso",
        description: `Produto ${available ? 'disponibilizado' : 'indisponibilizado'} com sucesso`,
      });
      return true;
    } catch (error: any) {
      console.error("Error toggling product availability:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a disponibilidade do produto",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
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
      return true;
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    refreshProducts: fetchProducts
  };
};
