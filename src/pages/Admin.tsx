
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RestaurantList } from "@/components/admin/RestaurantList";
import { FeaturePermissions } from "@/components/admin/FeaturePermissions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type AdminRestaurant = {
  id: string;
  name: string;
  createdAt: string;
  active: boolean;
  features: {
    qrCommunity: boolean;
    offlineMode: boolean;
    paymentIntegration: boolean;
    notifications: boolean;
    analytics: boolean;
    multiLocation: boolean;
  };
};

const Admin = () => {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<AdminRestaurant | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // In a real implementation, this would fetch data from Supabase
    // For now, we'll just use mock data
    const mockRestaurants: AdminRestaurant[] = [
      {
        id: "1",
        name: "Burger Place",
        createdAt: "2023-01-15",
        active: true,
        features: {
          qrCommunity: true,
          offlineMode: false,
          paymentIntegration: true,
          notifications: true,
          analytics: false,
          multiLocation: false
        }
      },
      {
        id: "2",
        name: "Pizza Corner",
        createdAt: "2023-02-20",
        active: true,
        features: {
          qrCommunity: false,
          offlineMode: false,
          paymentIntegration: false,
          notifications: false,
          analytics: false,
          multiLocation: false
        }
      },
      {
        id: "3",
        name: "Sushi Express",
        createdAt: "2023-03-10",
        active: false,
        features: {
          qrCommunity: false,
          offlineMode: false,
          paymentIntegration: false,
          notifications: false,
          analytics: false,
          multiLocation: false
        }
      }
    ];

    setTimeout(() => {
      setRestaurants(mockRestaurants);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSelectRestaurant = (restaurant: AdminRestaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleUpdateFeatures = (restaurantId: string, features: AdminRestaurant['features']) => {
    // Update the restaurant features
    const updatedRestaurants = restaurants.map(restaurant => {
      if (restaurant.id === restaurantId) {
        return {
          ...restaurant,
          features
        };
      }
      return restaurant;
    });
    
    setRestaurants(updatedRestaurants);
    
    if (selectedRestaurant && selectedRestaurant.id === restaurantId) {
      setSelectedRestaurant({
        ...selectedRestaurant,
        features
      });
    }
    
    toast({
      title: "Permissões atualizadas",
      description: "As permissões do restaurante foram atualizadas com sucesso.",
    });
  };

  const handleToggleActive = (restaurantId: string, active: boolean) => {
    // Update the restaurant active status
    const updatedRestaurants = restaurants.map(restaurant => {
      if (restaurant.id === restaurantId) {
        return {
          ...restaurant,
          active
        };
      }
      return restaurant;
    });
    
    setRestaurants(updatedRestaurants);
    
    if (selectedRestaurant && selectedRestaurant.id === restaurantId) {
      setSelectedRestaurant({
        ...selectedRestaurant,
        active
      });
    }
    
    toast({
      title: active ? "Restaurante ativado" : "Restaurante desativado",
      description: `O restaurante foi ${active ? "ativado" : "desativado"} com sucesso.`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
        <div className="text-center py-10">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Restaurantes</CardTitle>
              <CardDescription>Gerencie os restaurantes cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <RestaurantList 
                restaurants={restaurants}
                selectedRestaurantId={selectedRestaurant?.id}
                onSelectRestaurant={handleSelectRestaurant}
                onToggleActive={handleToggleActive}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {selectedRestaurant ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedRestaurant.name}</CardTitle>
                <CardDescription>
                  Gerencie as permissões de funcionalidades para este restaurante
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeaturePermissions 
                  restaurant={selectedRestaurant}
                  onUpdateFeatures={handleUpdateFeatures}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-10">
                <p className="text-muted-foreground">
                  Selecione um restaurante para gerenciar suas permissões
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
