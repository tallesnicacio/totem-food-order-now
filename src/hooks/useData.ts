
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  CategoryRow, 
  ProductRow, 
  RestaurantRow, 
  mapCategoryFromDB, 
  mapProductFromDB, 
  mapRestaurantFromDB 
} from "@/types/supabase";
import { Category, Product, Restaurant } from "@/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        const mappedCategories = (data as CategoryRow[]).map(mapCategoryFromDB);
        setCategories(mappedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading };
}

export function useProducts(categoryId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        let query = supabase
          .from('products')
          .select('*')
          .order('name');

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        const mappedProducts = (data as ProductRow[]).map(mapProductFromDB);
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [categoryId]);

  return { products, loading };
}

export function useRestaurant() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('restaurant')
          .select('*')
          .limit(1)
          .single();

        if (error) {
          throw error;
        }

        const mappedRestaurant = mapRestaurantFromDB(data as RestaurantRow);
        setRestaurant(mappedRestaurant);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as informações do restaurante",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurant();
  }, []);

  return { restaurant, loading };
}
