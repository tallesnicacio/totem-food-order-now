
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRestaurant } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { PaymentSettings } from "@/components/settings/PaymentSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { Restaurant } from "@/types";

const Settings = () => {
  const { restaurant, loading } = useRestaurant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [updatedSettings, setUpdatedSettings] = useState<Partial<Restaurant>>({});

  const handleUpdateSettings = (settings: Partial<Restaurant>) => {
    setUpdatedSettings(prev => ({
      ...prev,
      ...settings
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    // In a real implementation, this would update the restaurant settings in Supabase
    // For now, we'll just simulate a successful update
    setTimeout(() => {
      toast({
        title: "Configurações salvas",
        description: "As configurações do restaurante foram atualizadas com sucesso.",
      });
      setIsSubmitting(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        <div className="text-center py-10">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      
      <Tabs defaultValue="general">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex min-w-full">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="payment">Pagamentos</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="general" className="mt-6">
          <GeneralSettings 
            restaurant={restaurant} 
            onUpdate={handleUpdateSettings}
          />
        </TabsContent>
        
        <TabsContent value="payment" className="mt-6">
          <PaymentSettings 
            restaurant={restaurant} 
            onUpdate={handleUpdateSettings}
          />
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-6">
          <AppearanceSettings 
            restaurant={restaurant} 
            onUpdate={handleUpdateSettings}
          />
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
