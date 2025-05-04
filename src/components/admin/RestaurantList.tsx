
import { useState } from "react";
import { formatDateTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminRestaurant } from "@/pages/Admin";

interface RestaurantListProps {
  restaurants: AdminRestaurant[];
  selectedRestaurantId: string | undefined;
  onSelectRestaurant: (restaurant: AdminRestaurant) => void;
  onToggleActive: (restaurantId: string, active: boolean) => void;
}

export const RestaurantList = ({ 
  restaurants, 
  selectedRestaurantId,
  onSelectRestaurant, 
  onToggleActive 
}: RestaurantListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input 
        placeholder="Pesquisar restaurantes..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map(restaurant => (
                <TableRow 
                  key={restaurant.id}
                  className={restaurant.id === selectedRestaurantId ? "bg-muted" : ""}
                >
                  <TableCell>{restaurant.name}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={restaurant.active}
                      onCheckedChange={(checked) => onToggleActive(restaurant.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSelectRestaurant(restaurant)}
                    >
                      Gerenciar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Nenhum restaurante encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
