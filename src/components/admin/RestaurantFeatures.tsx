
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, CheckCircle, Circle } from "lucide-react";

interface RestaurantFeaturesProps {
  restaurantId: string;
  onBack: () => void;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export const RestaurantFeatures = ({ restaurantId, onBack }: RestaurantFeaturesProps) => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant data
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('establishments')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (restaurantError) throw restaurantError;

      setRestaurant(restaurantData);

      // In a real app, features would be fetched from a table in the database
      // For this example, we'll use mock data based on the restaurant ID
      setFeatures([
        {
          id: '1',
          name: 'QR Code Comunitário',
          description: 'Participação no marketplace de QR Codes comunitários',
          enabled: restaurantData.in_community_qr || false
        },
        {
          id: '2',
          name: 'Modo Offline',
          description: 'Operação do sistema sem internet com cache e sincronização',
          enabled: false
        },
        {
          id: '3',
          name: 'Integração de Pagamentos',
          description: 'Integração com gateways de pagamento para Pix automático',
          enabled: false
        },
        {
          id: '4',
          name: 'Notificações em Tempo Real',
          description: 'Notificações via Web Push ou WhatsApp para clientes',
          enabled: false
        },
        {
          id: '5',
          name: 'Relatórios Avançados',
          description: 'Acesso a dashboard com métricas e relatórios detalhados',
          enabled: false
        },
        {
          id: '6',
          name: 'Multi-Localização',
          description: 'Gerenciamento de múltiplos pontos de venda',
          enabled: false
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do restaurante.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleFeatureChange = (id: string, enabled: boolean) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === id ? { ...feature, enabled } : feature
    ));
  };

  const handleSaveFeatures = async () => {
    try {
      // Update the community QR feature in the database as that's already in our schema
      const qrFeature = features.find(f => f.id === '1');
      
      const { error } = await supabase
        .from('establishments')
        .update({ 
          in_community_qr: qrFeature?.enabled || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      if (error) throw error;

      // In a real app, you would save all feature settings to a dedicated table

      toast({
        title: "Recursos atualizados",
        description: "As permissões de funcionalidades foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error saving features:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as permissões de funcionalidades.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-10">Carregando dados do restaurante...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <h2 className="text-2xl font-bold">{restaurant?.name}</h2>
        </div>
        <Button onClick={handleSaveFeatures}>
          <Save className="mr-2 h-4 w-4" /> Salvar Alterações
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissões de Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(feature => (
              <Card key={feature.id} className={feature.enabled ? "border-primary/50" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        {feature.enabled ? (
                          <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground mr-2" />
                        )}
                        <h3 className="text-lg font-medium">{feature.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={feature.enabled} 
                        onCheckedChange={(checked) => handleFeatureChange(feature.id, checked)} 
                      />
                      <Label>{feature.enabled ? "Habilitado" : "Desabilitado"}</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
