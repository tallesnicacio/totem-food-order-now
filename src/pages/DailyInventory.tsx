
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/utils/format";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

interface Product {
  id: string;
  name: string;
  available: boolean;
  initial_stock: number | null;
  minimum_stock: number | null;
  out_of_stock?: boolean;
}

const DailyInventory = () => {
  const [date, setDate] = useState(new Date());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dailyInventoryId, setDailyInventoryId] = useState<string | null>(null);
  const [showStockFields, setShowStockFields] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchTodaysInventory();
    }
  }, [user]);

  const fetchTodaysInventory = async () => {
    try {
      setLoading(true);
      console.log("Fetching today's inventory...");
      
      // Get current establishment ID (in a real app, this would come from user context)
      const { data: establishmentData, error: establishmentError } = await supabase
        .from('establishments')
        .select('id')
        .limit(1);
      
      if (establishmentError) {
        console.error("Error fetching establishment:", establishmentError);
        throw establishmentError;
      }
      
      let establishmentId;
      
      if (!establishmentData || establishmentData.length === 0) {
        console.warn("No establishment found, creating a default one");
        // Create a default establishment if none exists
        const { data: newEstablishment, error: newEstablishmentError } = await supabase
          .from('establishments')
          .insert({
            name: 'Default Establishment',
            active: true
          })
          .select();
          
        if (newEstablishmentError) {
          console.error("Error creating new establishment:", newEstablishmentError);
          throw newEstablishmentError;
        }
        
        if (!newEstablishment || newEstablishment.length === 0) {
          throw new Error("Failed to create new establishment");
        }
        
        establishmentId = newEstablishment[0].id;
      } else {
        establishmentId = establishmentData[0].id;
      }
      
      console.log("Using establishment ID:", establishmentId);
      
      // Check if there's already a daily inventory for today
      const today = new Date().toISOString().split('T')[0];
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('daily_inventory')
        .select('*')
        .eq('establishment_id', establishmentId)
        .eq('date', today)
        .limit(1);
      
      if (inventoryError) {
        console.error("Error fetching inventory:", inventoryError);
        throw inventoryError;
      }
      
      let inventory;
      let dailyProducts: any[] = [];
      
      if (inventoryData && inventoryData.length > 0) {
        // Found existing inventory for today
        inventory = inventoryData[0];
        console.log("Found existing inventory:", inventory.id);
        setDailyInventoryId(inventory.id);
        
        // Fetch the daily products
        const { data: productsData, error: productsError } = await supabase
          .from('daily_products')
          .select(`
            id,
            available,
            initial_stock,
            minimum_stock,
            products (
              id,
              name,
              out_of_stock
            )
          `)
          .eq('daily_inventory_id', inventory.id);
        
        if (productsError) {
          console.error("Error fetching daily products:", productsError);
          throw productsError;
        }
        
        if (productsData) {
          dailyProducts = productsData.map((item) => ({
            id: item.products.id,
            name: item.products.name,
            available: item.available,
            initial_stock: item.initial_stock,
            minimum_stock: item.minimum_stock,
            out_of_stock: item.products.out_of_stock
          }));
        }
        
      } else {
        // No inventory yet, create a new one
        console.log("Creating new inventory for today");
        const { data: newInventory, error: newInventoryError } = await supabase
          .from('daily_inventory')
          .insert({
            establishment_id: establishmentId,
            date: today,
            register_opened: false
          })
          .select();
        
        if (newInventoryError) {
          console.error("Error creating new inventory:", newInventoryError);
          throw newInventoryError;
        }
        
        if (!newInventory || newInventory.length === 0) {
          throw new Error("Failed to create new inventory");
        }
        
        inventory = newInventory[0];
        console.log("New inventory created:", inventory.id);
        setDailyInventoryId(inventory.id);
        
        // Get all products
        const { data: allProducts, error: productsError } = await supabase
          .from('products')
          .select('id, name, out_of_stock');
        
        if (productsError) {
          console.error("Error fetching products:", productsError);
          throw productsError;
        }
        
        if (!allProducts || allProducts.length === 0) {
          // No products found, just set empty array
          console.log("No products found");
          setProducts([]);
          setLoading(false);
          return;
        }
        
        // Create daily products entries for all products
        const dailyProductsToInsert = allProducts.map((product) => ({
          daily_inventory_id: inventory.id,
          product_id: product.id,
          available: !product.out_of_stock,  // Produtos não esgotados estão disponíveis por padrão
          initial_stock: null,
          minimum_stock: null
        }));
        
        if (dailyProductsToInsert.length > 0) {
          console.log("Inserting", dailyProductsToInsert.length, "daily products");
          const { error: insertError } = await supabase
            .from('daily_products')
            .insert(dailyProductsToInsert);
          
          if (insertError) {
            console.error("Error inserting daily products:", insertError);
            throw insertError;
          }
        }
        
        // Format products for state
        dailyProducts = allProducts.map((product) => ({
          id: product.id,
          name: product.name,
          available: !product.out_of_stock,  // Sincronizar com o status out_of_stock
          initial_stock: null,
          minimum_stock: null,
          out_of_stock: product.out_of_stock
        }));
      }
      
      setProducts(dailyProducts);
      console.log("Inventory fetch complete, products:", dailyProducts.length);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o inventário diário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (productId: string, available: boolean) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId ? { ...product, available } : product
      )
    );
  };

  const handleStockChange = (productId: string, field: 'initial_stock' | 'minimum_stock', value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId ? { ...product, [field]: numValue } : product
      )
    );
  };

  const handleSaveInventory = async () => {
    try {
      setSaving(true);
      console.log("Saving inventory, ID:", dailyInventoryId);
      
      if (!dailyInventoryId) {
        console.error("No inventory ID found");
        toast({
          title: "Erro",
          description: "ID do inventário não encontrado. Tentando recriar o inventário.",
          variant: "destructive",
        });
        
        // Attempt to recreate the inventory
        await fetchTodaysInventory();
        
        if (!dailyInventoryId) {
          toast({
            title: "Erro",
            description: "Não foi possível criar o inventário. Tente recarregar a página.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }
      
      // Get existing daily products
      const { data: existingProducts, error: fetchError } = await supabase
        .from('daily_products')
        .select('id, product_id')
        .eq('daily_inventory_id', dailyInventoryId);
      
      if (fetchError) {
        console.error("Error fetching existing products:", fetchError);
        throw fetchError;
      }
      
      if (!existingProducts) {
        throw new Error("Failed to fetch existing products");
      }
      
      // Create a map for quick lookup
      const productMap = new Map();
      existingProducts.forEach((item) => {
        productMap.set(item.product_id, item.id);
      });
      
      // Process each product
      for (const product of products) {
        const dailyProductId = productMap.get(product.id);
        
        if (dailyProductId) {
          // Update existing daily product
          const { error: productUpdateError } = await supabase
            .from('daily_products')
            .update({
              available: product.available,
              initial_stock: product.initial_stock,
              minimum_stock: product.minimum_stock
            })
            .eq('id', dailyProductId);
            
          if (productUpdateError) {
            console.error("Error updating daily product:", productUpdateError);
            continue;  // Continue with other products even if one fails
          }
            
          // Also update the product's out_of_stock flag in the products table
          const { error: productTableUpdateError } = await supabase
            .from('products')
            .update({
              out_of_stock: !product.available
            })
            .eq('id', product.id);
            
          if (productTableUpdateError) {
            console.error("Error updating product out_of_stock:", productTableUpdateError);
          }
        } else {
          console.warn("Daily product not found for product ID:", product.id);
          // Create a new daily product entry
          const { error: insertError } = await supabase
            .from('daily_products')
            .insert({
              daily_inventory_id: dailyInventoryId,
              product_id: product.id,
              available: product.available,
              initial_stock: product.initial_stock,
              minimum_stock: product.minimum_stock
            });
            
          if (insertError) {
            console.error("Error inserting daily product:", insertError);
          }
        }
      }
      
      toast({
        title: "Inventário atualizado",
        description: "O inventário diário foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error saving inventory:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o inventário diário.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Controle de Estoque Diário" 
          currentPage="Estoque Diário"
        />
        <div className="text-center py-10">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Controle de Estoque Diário" 
        description={`Data: ${formatDate(date)} - Configure os produtos disponíveis para venda hoje.`}
        currentPage="Estoque Diário"
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold">Produtos Disponíveis Hoje</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-stock"
              checked={showStockFields}
              onCheckedChange={(checked) => setShowStockFields(checked === true)}
            />
            <Label htmlFor="show-stock">Mostrar campos de estoque</Label>
          </div>
          <Button onClick={handleSaveInventory} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Inventário"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <Card key={product.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                <div className="font-medium mb-2 sm:mb-0">{product.name}</div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={product.available}
                    onCheckedChange={(checked) => handleAvailabilityChange(product.id, checked === true)}
                  />
                  <Label htmlFor={`product-${product.id}`}>
                    {product.available ? "Disponível" : "Indisponível"}
                  </Label>
                </div>
              </div>
              
              {showStockFields && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`initial-stock-${product.id}`}>Estoque Inicial</Label>
                      <Input
                        id={`initial-stock-${product.id}`}
                        type="number"
                        min="0"
                        value={product.initial_stock === null ? '' : product.initial_stock}
                        onChange={(e) => handleStockChange(product.id, 'initial_stock', e.target.value)}
                        disabled={!product.available}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`minimum-stock-${product.id}`}>Estoque Mínimo</Label>
                      <Input
                        id={`minimum-stock-${product.id}`}
                        type="number"
                        min="0"
                        value={product.minimum_stock === null ? '' : product.minimum_stock}
                        onChange={(e) => handleStockChange(product.id, 'minimum_stock', e.target.value)}
                        disabled={!product.available}
                      />
                    </div>
                  </div>
                  
                  {product.initial_stock !== null && product.minimum_stock !== null && 
                    product.initial_stock <= product.minimum_stock && (
                    <p className="text-xs text-amber-500">
                      O estoque inicial está no limite ou abaixo do mínimo.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DailyInventory;
