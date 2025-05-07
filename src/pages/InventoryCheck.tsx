
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Package, Search, Save, FilterX, ClipboardCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  name: string;
  available: boolean;
  out_of_stock: boolean;
  price: number;
  description: string;
}

interface InventoryRecord {
  id: string;
  date: string;
  user_id: string;
  created_at: string;
}

interface InventoryItem {
  id: string;
  inventory_id: string;
  product_id: string;
  is_available: boolean;
  notes?: string;
}

const InventoryCheck = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showUnavailable, setShowUnavailable] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingInventory, setSavingInventory] = useState<boolean>(false);
  const [todayCheck, setTodayCheck] = useState<InventoryRecord | null>(null);
  const [inventoryItems, setInventoryItems] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchInventoryStatus();
  }, []);

  const fetchInventoryStatus = async () => {
    setLoading(true);
    try {
      // Fetch today's inventory check if exists
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_checks')
        .select('*')
        .gte('date', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (inventoryError) throw inventoryError;
      
      const todayInventory = inventoryData && inventoryData.length > 0 ? inventoryData[0] : null;
      setTodayCheck(todayInventory);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');
        
      if (productsError) throw productsError;
      
      setProducts(productsData || []);
      setFilteredProducts(productsData || []);
      
      // If today's check exists, get items status
      if (todayInventory) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('inventory_id', todayInventory.id);
          
        if (itemsError) throw itemsError;
        
        const itemsMap = (itemsData || []).reduce((acc: Record<string, boolean>, item: InventoryItem) => {
          acc[item.product_id] = item.is_available;
          return acc;
        }, {});
        
        setInventoryItems(itemsMap);
      } else {
        // Pre-populate with current availability status
        const defaultItems = (productsData || []).reduce((acc: Record<string, boolean>, product: Product) => {
          acc[product.id] = !product.out_of_stock;
          return acc;
        }, {});
        
        setInventoryItems(defaultItems);
      }
    } catch (error: any) {
      console.error('Error fetching inventory status:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do inventário: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    if (!showUnavailable) {
      const filtered = products.filter(product => !product.out_of_stock);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [showUnavailable, products]);

  const handleInventoryToggle = (productId: string, value: boolean) => {
    setInventoryItems(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const saveInventoryCheck = async () => {
    if (Object.keys(inventoryItems).length === 0) {
      toast({
        title: "Nenhum produto",
        description: "Não há produtos para salvar no inventário",
        variant: "destructive",
      });
      return;
    }

    setSavingInventory(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error("Usuário não autenticado");

      // Create or update inventory check
      let inventoryId = todayCheck?.id;
      if (!inventoryId) {
        const { data, error } = await supabase
          .from('inventory_checks')
          .insert({
            date: new Date().toISOString(),
            user_id: userId
          })
          .select('id')
          .single();
          
        if (error) throw error;
        inventoryId = data.id;
      }

      // Prepare inventory items
      const inventoryItemsToSave = Object.entries(inventoryItems).map(([productId, isAvailable]) => ({
        inventory_id: inventoryId,
        product_id: productId,
        is_available: isAvailable
      }));

      // Delete existing items if updating
      if (todayCheck) {
        const { error: deleteError } = await supabase
          .from('inventory_items')
          .delete()
          .eq('inventory_id', inventoryId);
          
        if (deleteError) throw deleteError;
      }

      // Insert new items
      const { error: insertError } = await supabase
        .from('inventory_items')
        .insert(inventoryItemsToSave);
        
      if (insertError) throw insertError;

      // Update product availability in products table
      for (const [productId, isAvailable] of Object.entries(inventoryItems)) {
        await supabase
          .from('products')
          .update({
            out_of_stock: !isAvailable,
            updated_at: new Date().toISOString()
          })
          .eq('id', productId);
      }

      toast({
        title: todayCheck ? "Inventário atualizado" : "Inventário registrado",
        description: `O controle de estoque foi ${todayCheck ? 'atualizado' : 'registrado'} com sucesso`,
      });
      
      // Refresh data
      await fetchInventoryStatus();
    } catch (error: any) {
      console.error('Error saving inventory check:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar verificação de inventário: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSavingInventory(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setShowUnavailable(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Verificação de Estoque"
        description="Confirme a disponibilidade dos produtos no estoque"
        currentPage="Verificação de Estoque"
        icon={<ClipboardCheck className="h-6 w-6" />}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status do Estoque Hoje</span>
            {todayCheck && (
              <span className="text-sm font-normal text-muted-foreground">
                Última atualização: {format(new Date(todayCheck.created_at), "dd/MM/yyyy HH:mm")}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-2/3">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar produtos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Switch 
                id="show-unavailable"
                checked={showUnavailable}
                onCheckedChange={setShowUnavailable}
              />
              <Label htmlFor="show-unavailable">Mostrar indisponíveis</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={resetFilters}
                className="ml-2"
              >
                <FilterX className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-10">Carregando...</div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-2">
              {filteredProducts.map((product) => {
                const isAvailable = inventoryItems[product.id] !== undefined 
                  ? inventoryItems[product.id] 
                  : !product.out_of_stock;
                  
                return (
                  <div
                    key={product.id}
                    className={`p-3 border rounded-md flex justify-between items-center
                      ${isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id={`product-${product.id}`}
                        checked={isAvailable}
                        onCheckedChange={(value) => handleInventoryToggle(product.id, !!value)}
                      />
                      <Label htmlFor={`product-${product.id}`} className="font-medium cursor-pointer">
                        {product.name}
                      </Label>
                    </div>
                    {isAvailable ? (
                      <span className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Disponível
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Indisponível
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Package className="mx-auto h-10 w-10 mb-2 opacity-50" />
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={saveInventoryCheck}
            disabled={savingInventory || loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {savingInventory 
              ? "Salvando..." 
              : todayCheck 
                ? "Atualizar Verificação de Estoque" 
                : "Salvar Verificação de Estoque"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InventoryCheck;
