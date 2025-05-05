
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Filter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/utils/format";
import { RestaurantForm } from "./RestaurantForm";
import { RestaurantFeatures } from "./RestaurantFeatures";

type Restaurant = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  active: boolean;
  created_at: string;
  in_community_qr: boolean | null;
  billing_status: string | null;
};

export const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [qrFilter, setQrFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('establishments')
        .select('*')
        .order('name');

      if (error) throw error;

      setRestaurants(data || []);
      setFilteredRestaurants(data || []);
      setLoading(false);

      // Extract unique cities
      const uniqueCities = Array.from(new Set(data?.map(r => r.city).filter(Boolean) as string[]));
      setCities(uniqueCities);
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
    // Apply all filters
    let result = restaurants;

    if (searchTerm) {
      result = result.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.address && r.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (cityFilter) {
      result = result.filter(r => r.city === cityFilter);
    }

    if (statusFilter) {
      if (statusFilter === 'active') {
        result = result.filter(r => r.active);
      } else if (statusFilter === 'inactive') {
        result = result.filter(r => !r.active);
      }
    }

    if (qrFilter) {
      if (qrFilter === 'in') {
        result = result.filter(r => r.in_community_qr);
      } else if (qrFilter === 'out') {
        result = result.filter(r => !r.in_community_qr);
      }
    }

    setFilteredRestaurants(result);
  }, [restaurants, searchTerm, cityFilter, statusFilter, qrFilter]);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('establishments')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setRestaurants(prev => 
        prev.map(restaurant => 
          restaurant.id === id ? { ...restaurant, active } : restaurant
        )
      );

      toast({
        title: active ? "Restaurante ativado" : "Restaurante desativado",
        description: `O restaurante foi ${active ? "ativado" : "desativado"} com sucesso.`,
      });
    } catch (error) {
      console.error("Error updating restaurant:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do restaurante.",
        variant: "destructive",
      });
    }
  };

  const handleSaveRestaurant = async (restaurantData: any) => {
    try {
      let result;
      
      if (editingRestaurant) {
        // Update existing restaurant
        result = await supabase
          .from('establishments')
          .update({
            ...restaurantData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRestaurant.id)
          .select();
      } else {
        // Create new restaurant
        result = await supabase
          .from('establishments')
          .insert({
            ...restaurantData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
      }

      if (result.error) throw result.error;

      toast({
        title: editingRestaurant ? "Restaurante atualizado" : "Restaurante criado",
        description: editingRestaurant 
          ? "O restaurante foi atualizado com sucesso."
          : "O novo restaurante foi criado com sucesso.",
      });

      setIsDialogOpen(false);
      fetchRestaurants();
    } catch (error) {
      console.error("Error saving restaurant:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o restaurante.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este restaurante? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('establishments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRestaurants(prev => prev.filter(restaurant => restaurant.id !== id));
      toast({
        title: "Restaurante excluído",
        description: "O restaurante foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o restaurante.",
        variant: "destructive",
      });
    }
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setIsDialogOpen(true);
  };

  const handleNewRestaurant = () => {
    setEditingRestaurant(null);
    setIsDialogOpen(true);
  };

  const handleViewFeatures = (id: string) => {
    setSelectedRestaurantId(id);
    setShowFeatures(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCityFilter("");
    setStatusFilter("");
    setQrFilter("");
  };

  if (loading) {
    return <div className="text-center py-10">Carregando restaurantes...</div>;
  }

  if (showFeatures && selectedRestaurantId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFeatures(false)}
          >
            Voltar para lista de restaurantes
          </Button>
        </div>
        <RestaurantFeatures 
          restaurantId={selectedRestaurantId} 
          onBack={() => setShowFeatures(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Restaurantes</CardTitle>
            <Button onClick={handleNewRestaurant}>
              <Plus className="mr-2 h-4 w-4" /> Novo Restaurante
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="col-span-1 md:col-span-4">
                <Input
                  placeholder="Buscar por nome ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label>Cidade</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">Todas as cidades</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label>Status</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
              
              <div>
                <Label>QR Code Comunitário</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={qrFilter}
                  onChange={(e) => setQrFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="in">Participando</option>
                  <option value="out">Não participando</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={resetFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Nenhum restaurante encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>QR Comunitário</TableHead>
                      <TableHead>Data Cadastro</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRestaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell className="font-medium">{restaurant.name}</TableCell>
                        <TableCell>{restaurant.city || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={restaurant.active} 
                              onCheckedChange={(checked) => handleToggleActive(restaurant.id, checked)} 
                            />
                            <span>{restaurant.active ? "Ativo" : "Inativo"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {restaurant.in_community_qr ? "Sim" : "Não"}
                        </TableCell>
                        <TableCell>{formatDate(restaurant.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEditRestaurant(restaurant)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteRestaurant(restaurant.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewFeatures(restaurant.id)}
                            >
                              <Filter className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingRestaurant ? "Editar Restaurante" : "Novo Restaurante"}
            </DialogTitle>
          </DialogHeader>
          <RestaurantForm 
            restaurant={editingRestaurant} 
            onSave={handleSaveRestaurant} 
            onCancel={() => setIsDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
