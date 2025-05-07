import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader, Store, Search } from "lucide-react";
import { Product, Category, CartItem } from "@/types";
import { mapProductFromDB, mapCategoryFromDB } from "@/types/supabase";
import { ProductGrid } from "@/components/ProductGrid";
import { CartDrawer } from "@/components/CartDrawer";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EstablishmentWithProducts {
  id: string;
  name: string;
  logo?: string;
  products: Product[];
  categories: Category[];
}

const CommunityMenu = () => {
  const [searchParams] = useSearchParams();
  const communityId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [establishments, setEstablishments] = useState<EstablishmentWithProducts[]>([]);
  const [activeEstablishment, setActiveEstablishment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  useEffect(() => {
    if (communityId) {
      fetchEstablishmentsData();
    } else {
      setError("QR Code comunitário não encontrado");
      setLoading(false);
    }
  }, [communityId]);

  const fetchEstablishmentsData = async () => {
    try {
      setLoading(true);
      
      // Get all establishment IDs connected to this community QR code
      const { data: establishmentLinks, error: linksError } = await supabase
        .from('establishment_qr_codes')
        .select('establishment_id')
        .eq('community_qr_id', communityId)
        .eq('active', true);
        
      if (linksError) throw linksError;
      
      if (!establishmentLinks || establishmentLinks.length === 0) {
        setError("Nenhum restaurante encontrado para este QR code");
        setLoading(false);
        return;
      }

      const establishmentIds = establishmentLinks.map(link => link.establishment_id);
      
      // Get all establishments data
      const { data: establishmentsData, error: establishmentsError } = await supabase
        .from('establishments')
        .select('id, name')
        .in('id', establishmentIds)
        .eq('active', true);
        
      if (establishmentsError) throw establishmentsError;
      
      if (!establishmentsData || establishmentsData.length === 0) {
        setError("Nenhum restaurante ativo encontrado");
        setLoading(false);
        return;
      }

      // For each establishment, get their restaurant config, products, and categories
      const establishmentsWithData = await Promise.all(
        establishmentsData.map(async (establishment) => {
          // Get restaurant config
          const { data: restaurantData, error: restaurantError } = await supabase
            .from('restaurant')
            .select('*')
            .eq('establishment_id', establishment.id)
            .single();
            
          if (restaurantError) {
            console.error(`Error fetching restaurant data for ${establishment.id}:`, restaurantError);
            return null;
          }
          
          // Get categories
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('*');
            
          if (categoriesError) {
            console.error(`Error fetching categories for ${establishment.id}:`, categoriesError);
            return null;
          }
          
          // Get products
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('available', true)
            .eq('out_of_stock', false);
            
          if (productsError) {
            console.error(`Error fetching products for ${establishment.id}:`, productsError);
            return null;
          }
          
          return {
            id: establishment.id,
            name: establishment.name,
            logo: restaurantData?.logo || undefined,
            products: productsData.map(mapProductFromDB),
            categories: categoriesData.map(mapCategoryFromDB)
          };
        })
      );
      
      // Filter out null results
      const validEstablishments = establishmentsWithData.filter(e => e !== null) as EstablishmentWithProducts[];
      
      if (validEstablishments.length === 0) {
        setError("Nenhum restaurante configurado corretamente");
        setLoading(false);
        return;
      }
      
      setEstablishments(validEstablishments);
      setActiveEstablishment(validEstablishments[0].id);
      setLoading(false);
      
    } catch (error) {
      console.error("Error fetching community data:", error);
      setError("Erro ao carregar dados dos restaurantes");
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const currentEstablishment = establishments.find(e => e.id === activeEstablishment);
    if (!currentEstablishment) return;
    
    setCartItems(prevItems => {
      // Check if the item is already in the cart
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // If it exists, update the quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Otherwise, add it as a new item
        // Make sure to include the categoryId for compatibility
        const productWithCategoryId = {
          ...product,
          categoryId: product.category_id
        };
        
        return [...prevItems, { 
          product: productWithCategoryId as any, 
          quantity: 1,
          notes: '' 
        }];
      }
    });
  };

  const filteredProducts = () => {
    if (!activeEstablishment) return [];
    
    const establishment = establishments.find(e => e.id === activeEstablishment);
    if (!establishment) return [];
    
    let filtered = establishment.products;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(product => product.category_id === activeCategory);
    }
    
    return filtered;
  };

  const activeEstablishmentData = establishments.find(e => e.id === activeEstablishment);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Loader className="h-8 w-8 animate-spin mb-4" />
        <p className="text-center">Carregando menu dos restaurantes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Erro</h1>
        <p className="text-center text-muted-foreground mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Comunitário</h1>
        <Button 
          onClick={() => setIsCartOpen(true)} 
          variant="outline"
          className="relative"
        >
          <span className="mr-2">Carrinho</span>
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar with establishments */}
        <div className="col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Restaurantes</h2>
              <div className="space-y-2">
                {establishments.map(establishment => (
                  <Button
                    key={establishment.id}
                    variant={activeEstablishment === establishment.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveEstablishment(establishment.id)}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    <span className="truncate">{establishment.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="col-span-1 md:col-span-3">
          {activeEstablishmentData && (
            <>
              <div className="mb-6">
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                
                <Tabs 
                  value={activeCategory} 
                  onValueChange={setActiveCategory}
                  className="w-full"
                >
                  <TabsList className="w-full overflow-x-auto flex-nowrap max-w-full">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    {activeEstablishmentData.categories.map(category => (
                      <TabsTrigger key={category.id} value={category.id}>
                        {category.icon && <span className="mr-1">{category.icon}</span>}
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              
              <ProductGrid 
                products={filteredProducts()} 
                onAddToCart={handleAddToCart}
                emptyMessage={
                  searchTerm 
                    ? "Nenhum produto encontrado para esta busca" 
                    : "Nenhum produto disponível nesta categoria"
                }
              />
            </>
          )}
        </div>
      </div>
      
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) => {
          setCartItems(prevItems => 
            prevItems.map(item => 
              item.product.id === id ? { ...item, quantity } : item
            ).filter(item => item.quantity > 0)
          );
        }}
        onRemoveItem={(id) => {
          setCartItems(prevItems => prevItems.filter(item => item.product.id !== id));
        }}
        currentEstablishment={activeEstablishmentData?.name || ""}
      />
    </div>
  );
};

export default CommunityMenu;
