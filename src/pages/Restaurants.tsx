
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Search, Store, Edit, Trash2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RestaurantForm } from "@/components/restaurants/RestaurantForm";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface Restaurant {
  id: string;
  name: string;
  address?: string;
  city?: string;
  active: boolean;
  created_at: string;
}

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .order("name");

      if (error) throw error;

      setRestaurants(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar restaurantes:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar restaurantes: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleAddRestaurant = () => {
    setCurrentRestaurant(null);
    setShowForm(true);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setCurrentRestaurant(restaurant);
    setShowForm(true);
  };

  const handleDeleteRestaurant = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("establishments")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Restaurante excluído",
        description: "O restaurante foi excluído com sucesso",
      });

      fetchRestaurants();
      setShowDeleteDialog(false);
      setDeleteId(null);
    } catch (error: any) {
      console.error("Erro ao excluir restaurante:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir restaurante: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchRestaurants();
  };

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.city && restaurant.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (restaurant.address && restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Restaurantes"
        description="Cadastre e gerencie seus restaurantes"
        currentPage="Restaurantes"
        icon={<Store className="h-6 w-6" />}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="relative w-full sm:w-auto mb-4 sm:mb-0">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar restaurantes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddRestaurant} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Novo Restaurante
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <RestaurantForm
            initialData={currentRestaurant || undefined}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Carregando...</div>
      ) : filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className={restaurant.active ? "" : "opacity-70"}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <span className="truncate">{restaurant.name}</span>
                  <div className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEditRestaurant(restaurant)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteRestaurant(restaurant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-1">
                  {restaurant.address || "Endereço não informado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {restaurant.city || "Cidade não informada"}
                </p>
                {!restaurant.active && (
                  <div className="flex items-center mt-3 text-amber-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Inativo</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground mb-2">Nenhum restaurante encontrado</p>
            <Button onClick={handleAddRestaurant} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Restaurante
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir este restaurante? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Restaurants;
