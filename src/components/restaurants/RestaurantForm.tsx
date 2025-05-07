
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface RestaurantFormProps {
  initialData?: {
    id?: string;
    name: string;
    address?: string;
    city?: string;
  };
  onSuccess: () => void;
}

export const RestaurantForm = ({ initialData, onSuccess }: RestaurantFormProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!initialData?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from("establishments")
          .update({
            name,
            address,
            city,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);

        if (error) throw error;
        
        toast({
          title: "Restaurante atualizado",
          description: `${name} foi atualizado com sucesso`,
        });
      } else {
        const { error } = await supabase
          .from("establishments")
          .insert({
            name,
            address,
            city,
            active: true,
          });

        if (error) throw error;
        
        toast({
          title: "Restaurante criado",
          description: `${name} foi adicionado com sucesso`,
        });
      }
      
      onSuccess();
      
      if (!isEditing) {
        // Reset form if creating new
        setName("");
        setAddress("");
        setCity("");
      }
    } catch (error: any) {
      console.error("Erro ao salvar restaurante:", error);
      toast({
        title: "Erro",
        description: `Falha ao ${isEditing ? "atualizar" : "criar"} restaurante: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Restaurante" : "Novo Restaurante"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant-name">Nome do Restaurante *</Label>
            <Input
              id="restaurant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do restaurante"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="restaurant-address">Endereço</Label>
            <Input
              id="restaurant-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Endereço completo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="restaurant-city">Cidade</Label>
            <Input
              id="restaurant-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Cidade"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onSuccess()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || !name}>
            {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
