
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Restaurant } from "@/types";

interface AppearanceSettingsProps {
  restaurant: Restaurant | null;
  onUpdate: (settings: Partial<Restaurant>) => void;
}

export const AppearanceSettings = ({ restaurant, onUpdate }: AppearanceSettingsProps) => {
  const [themeColor, setThemeColor] = useState(restaurant?.themeColor || "#FF5722");

  const handleThemeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setThemeColor(newColor);
    onUpdate({ themeColor: newColor });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Personalize a aparência do seu cardápio digital.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme-color">Cor do Tema</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="theme-color"
              type="color"
              value={themeColor}
              onChange={handleThemeColorChange}
              className="w-12 h-8 p-1"
            />
            <Input
              value={themeColor}
              onChange={handleThemeColorChange}
              className="flex-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
