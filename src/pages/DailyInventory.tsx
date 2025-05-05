
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/utils/format";

interface Product {
  id: string;
  name: string;
  available: boolean;
  initial_stock: number | null;
  minimum_stock: number | null;
  out_of_stock?: boolean; // Add this property to the interface
}

const DailyInventory = () => {
  const [date, setDate] = useState(new Date());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registerOpened, setRegisterOpened] = useState(false);
  const [dailyInventoryId, setDailyInventoryId] = useState<string | null>(null);
  const [showStockFields, setShowStockFields] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodaysInventory();
  }, []);

  const fetchTodaysInventory = async () => {
    try {
      setLoading(true);
      
      // Get current establishment ID (in a real app, this would come from user context)
      // For now we'll just get the first restaurant in the database
      const { data: establishmentData, error: establishmentError } = await supabase
        .from('establishments')
        .select('id')
        .limit(1)
        .single();
      
      if (establishmentError) throw establishmentError;
      
      const establishmentId = establishmentData.id;
      
      // Check if there's already a daily inventory for today
      const today = new Date().toISOString().split('T')[0];
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('daily_inventory')
        .select('*')
        .eq('establishment_id', establishmentId)
        .eq('date', today)
        .limit(1);
      
      if (inventoryError) throw inventoryError;
      
      let inventory;
      let dailyProducts: any[] = [];
      
      if (inventoryData && inventoryData.length > 0) {
        // Found existing inventory for today
        inventory = inventoryData[0];
        setDailyInventoryId(inventory.id);
        setRegisterOpened(inventory.register_opened);
        
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
        
        if (productsError) throw productsError;
        
        dailyProducts = productsData.map((item) => ({
          id: item.products.id,
          name: item.products.name,
          available: item.available,
          initial_stock: item.initial_stock,
          minimum_stock: item.minimum_stock,
          out_of_stock: item.products.out_of_stock
        }));
        
      } else {
        // No inventory yet, create a new one
        const { data: newInventory, error: newInventoryError } = await supabase
          .from('daily_inventory')
          .insert({
            establishment_id: establishmentId,
            date: today,
            register_opened: false
          })
          .select()
          .single();
        
        if (newInventoryError) throw newInventoryError;
        
        inventory = newInventory;
        setDailyInventoryId(inventory.id);
        setRegisterOpened(false);
        
        // Get all products
        const { data: allProducts, error: productsError } = await supabase
          .from('products')
          .select('id, name, out_of_stock');
        
        if (productsError) throw productsError;
        
        // Create daily products entries for all products
        const dailyProductsToInsert = allProducts.map((product) => ({
          daily_inventory_id: inventory.id,
          product_id: product.id,
          available: !product.out_of_stock, // Now this should work with the updated query
          initial_stock: null,
          minimum_stock: null
        }));
        
        if (dailyProductsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('daily_products')
            .insert(dailyProductsToInsert);
          
          if (insertError) throw insertError;
        }
        
        // Format products for state
        dailyProducts = allProducts.map((product) => ({
          id: product.id,
          name: product.name,
          available: !product.out_of_stock, // Now this should work with the updated query
          initial_stock: null,
          minimum_stock: null,
          out_of_stock: product.out_of_stock
        }));
      }
      
      setProducts(dailyProducts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o inventário diário.",
        variant: "destructive",
      });
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
      
      if (!dailyInventoryId) {
        throw new Error("No daily inventory ID");
      }
      
      // Update register_opened status
      await supabase
        .from('daily_inventory')
        .update({
          register_opened: registerOpened,
          updated_at: new Date().toISOString()
        })
        .eq('id', dailyInventoryId);
      
      // Get existing daily products
      const { data: existingProducts, error: fetchError } = await supabase
        .from('daily_products')
        .select('id, product_id')
        .eq('daily_inventory_id', dailyInventoryId);
      
      if (fetchError) throw fetchError;
      
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
          await supabase
            .from('daily_products')
            .update({
              available: product.available,
              initial_stock: product.initial_stock,
              minimum_stock: product.minimum_stock
            })
            .eq('id', dailyProductId);
            
          // Also update the product's out_of_stock flag in the products table
          await supabase
            .from('products')
            .update({
              out_of_stock: !product.available
            })
            .eq('id', product.id);
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
        <h1 className="text-3xl font-bold mb-6">Controle de Estoque Diário</h1>
        <div className="text-center py-10">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Controle de Estoque Diário</h1>
      <p className="text-muted-foreground mb-6">
        Data: {formatDate(date)} - Configure os produtos disponíveis para venda hoje.
      </p>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Status do Caixa</CardTitle>
              <CardDescription>Defina se o caixa está aberto ou fechado</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="register-status"
                checked={registerOpened}
                onCheckedChange={setRegisterOpened}
              />
              <Label htmlFor="register-status">
                {registerOpened ? "Caixa Aberto" : "Caixa Fechado"}
              </Label>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Produtos Disponíveis Hoje</h2>
        <div className="flex items-center space-x-4">
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
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{product.name}</div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`product-${product.id}`}
                    checked={product.available}
                    onCheckedChange={(checked) => handleAvailabilityChange(product.id, checked)}
                  />
                  <Label htmlFor={`product-${product.id}`}>
                    {product.available ? "Disponível" : "Indisponível"}
                  </Label>
                </div>
              </div>
              
              {showStockFields && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
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
