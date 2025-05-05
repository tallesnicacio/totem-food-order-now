
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Save } from "lucide-react";

interface AssignRestaurantsFormProps {
  qrCode: {
    id: string;
    name: string;
    location?: string | null;
    city?: string | null;
  };
  onComplete: () => void;
}

interface Restaurant {
  id: string;
  name: string;
  city: string | null;
  isAssigned: boolean;
}

export const AssignRestaurantsForm = ({ qrCode, onComplete }: AssignRestaurantsFormProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurants();
  }, [qrCode.id]);

  const fetchRestaurants = async () => {
    try {
      // Fetch all restaurants
      const { data: establishmentData, error: establishmentError } = await supabase
        .from('establishments')
        .select('*')
        .eq('active', true)
        .order('name');

      if (establishmentError) throw establishmentError;

      // Fetch restaurants already assigned to this QR code
      const { data: assignedData, error: assignedError } = await supabase
        .from('establishment_qr_codes')
        .select('establishment_id')
        .eq('community_qr_id', qrCode.id);

      if (assignedError) throw assignedError;

      // Create set of assigned restaurant IDs for fast lookup
      const assignedIds = new Set(assignedData.map((item: any) => item.establishment_id));

      // Combine the data
      const combinedData = establishmentData.map((restaurant: any) => ({
        id: restaurant.id,
        name: restaurant.name,
        city: restaurant.city,
        isAssigned: assignedIds.has(restaurant.id)
      }));

      setRestaurants(combinedData);
      setFilteredRestaurants(combinedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os restaurantes.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.city && restaurant.city.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredRestaurants(filtered);
    } else {
      setFilteredRestaurants(restaurants);
    }
  }, [searchTerm, restaurants]);

  const handleToggleAssignment = (id: string, isChecked: boolean) => {
    setRestaurants(prev => prev.map(restaurant => 
      restaurant.id === id ? { ...restaurant, isAssigned: isChecked } : restaurant
    ));
  };

  const handleSaveAssignments = async () => {
    try {
      setSaving(true);
      
      // Get IDs of restaurants that should be assigned
      const assignedRestaurants = restaurants.filter(r => r.isAssigned).map(r => r.id);
      
      // First, remove all existing assignments for this QR code
      const { error: deleteError } = await supabase
        .from('establishment_qr_codes')
        .delete()
        .eq('community_qr_id', qrCode.id);
      
      if (deleteError) throw deleteError;
      
      // Then, create new assignments
      if (assignedRestaurants.length > 0) {
        const assignmentsToInsert = assignedRestaurants.map(restaurantId => ({
          community_qr_id: qrCode.id,
          establishment_id: restaurantId,
          active: true
        }));
        
        const { error: insertError } = await supabase
          .from('establishment_qr_codes')
          .insert(assignmentsToInsert);
        
        if (insertError) throw insertError;
      }

      // Update the in_community_qr flag for all restaurants
      for (const restaurant of restaurants) {
        await supabase
          .from('establishments')
          .update({ 
            in_community_qr: restaurant.isAssigned,
            updated_at: new Date().toISOString()
          })
          .eq('id', restaurant.id);
      }
      
      toast({
        title: "Restaurantes associados",
        description: "Os restaurantes foram associados ao QR code comunitário com sucesso.",
      });
      
      onComplete();
    } catch (error) {
      console.error("Error saving assignments:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as associações de restaurantes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Carregando restaurantes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <div>
            <CardTitle>Associar Restaurantes ao QR Code: {qrCode.name}</CardTitle>
            <CardDescription>
              {qrCode.location && `Localização: ${qrCode.location}`}
              {qrCode.city && ` - ${qrCode.city}`}
            </CardDescription>
          </div>
          <Button 
            onClick={handleSaveAssignments}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Associações"}
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar restaurantes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRestaurants.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-4">
              Nenhum restaurante encontrado com o termo de pesquisa aplicado.
            </p>
          ) : (
            filteredRestaurants.map(restaurant => (
              <div 
                key={restaurant.id}
                className="flex items-center space-x-3 border rounded-md p-3"
              >
                <Checkbox 
                  id={`restaurant-${restaurant.id}`}
                  checked={restaurant.isAssigned}
                  onCheckedChange={(checked) => 
                    handleToggleAssignment(restaurant.id, checked === true)
                  }
                />
                <div className="flex-1">
                  <label 
                    htmlFor={`restaurant-${restaurant.id}`}
                    className="font-medium cursor-pointer"
                  >
                    {restaurant.name}
                  </label>
                  {restaurant.city && (
                    <p className="text-xs text-muted-foreground">{restaurant.city}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
