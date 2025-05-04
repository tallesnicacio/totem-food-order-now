
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Restaurant } from "@/types";

interface GeneralSettingsProps {
  restaurant: Restaurant | null;
  onUpdate: (settings: Partial<Restaurant>) => void;
}

export const GeneralSettings = ({ restaurant, onUpdate }: GeneralSettingsProps) => {
  const [restaurantName, setRestaurantName] = useState(restaurant?.name || "");
  const [useTables, setUseTables] = useState<boolean>(restaurant?.useTables || true);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setRestaurantName(newName);
    onUpdate({ name: newName });
  };

  const handleUseTablesChange = (checked: boolean) => {
    setUseTables(checked);
    onUpdate({ useTables: checked });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
        <CardDescription>
          Configure as informações básicas do seu restaurante.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="restaurant-name">Nome do Restaurante</Label>
          <Input
            id="restaurant-name"
            value={restaurantName}
            onChange={handleNameChange}
            placeholder="Nome do seu restaurante"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="use-tables">Usar mesas</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="use-tables"
              checked={useTables}
              onCheckedChange={handleUseTablesChange}
            />
            <span className="text-sm text-muted-foreground">
              {useTables 
                ? "Os pedidos podem ser associados a mesas" 
                : "Os pedidos não usarão mesas"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
