
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Restaurant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface AppearanceSettingsProps {
  restaurant: Restaurant | null;
  onUpdate: (settings: Partial<Restaurant>) => void;
}

export const AppearanceSettings = ({ restaurant, onUpdate }: AppearanceSettingsProps) => {
  const [themeColor, setThemeColor] = useState(restaurant?.themeColor || "#FF5722");
  const [logoUrl, setLogoUrl] = useState(restaurant?.logo || "");
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();

  const handleThemeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setThemeColor(newColor);
    onUpdate({ themeColor: newColor });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload image to the restaurant-assets bucket
      const { error: uploadError } = await supabase.storage
        .from('restaurant-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading logo:", uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('restaurant-assets')
        .getPublicUrl(filePath);
      
      setLogoUrl(data.publicUrl);
      onUpdate({ logo: data.publicUrl });
      
      toast({
        title: "Logo atualizado",
        description: "O logo do restaurante foi atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload",
        description: error.message || "Ocorreu um erro ao fazer upload do logo.",
        variant: "destructive",
      });
      console.error("Error uploading logo:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Personalize a aparência do seu cardápio digital.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="space-y-4">
          <Label>Logo do Restaurante</Label>
          
          {logoUrl && (
            <div className="p-4 border rounded-md mb-4 flex justify-center">
              <img 
                src={logoUrl} 
                alt="Logo do restaurante" 
                className="max-h-32 object-contain"
              />
            </div>
          )}
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="logo" className="sr-only">Logo</Label>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline"
                size="sm"
                asChild
                className="cursor-pointer"
                disabled={uploading}
              >
                <label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Enviando..." : "Enviar logo"}
                </label>
              </Button>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={uploading}
              />
              {logoUrl && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setLogoUrl("");
                    onUpdate({ logo: "" });
                  }}
                >
                  Remover
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
