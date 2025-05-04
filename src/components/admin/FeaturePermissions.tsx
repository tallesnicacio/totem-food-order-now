
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { AdminRestaurant } from "@/pages/Admin";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle, Circle, ChevronDown } from "lucide-react";

interface FeaturePermissionsProps {
  restaurant: AdminRestaurant;
  onUpdateFeatures: (restaurantId: string, features: AdminRestaurant["features"]) => void;
}

export const FeaturePermissions = ({ restaurant, onUpdateFeatures }: FeaturePermissionsProps) => {
  const [features, setFeatures] = useState<AdminRestaurant["features"]>(restaurant.features);

  const handleFeatureChange = (feature: keyof AdminRestaurant["features"], enabled: boolean) => {
    const updatedFeatures = {
      ...features,
      [feature]: enabled
    };
    setFeatures(updatedFeatures);
  };

  const handleSaveFeatures = () => {
    onUpdateFeatures(restaurant.id, features);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureCard
          title="QR Code Comunitário"
          description="Acesso a múltiplos cardápios de foodtrucks em uma única interface"
          enabled={features.qrCommunity}
          onChange={(enabled) => handleFeatureChange("qrCommunity", enabled)}
          details={[
            "Permite que o restaurante apareça no QR Code comunitário",
            "Inclui a participação em marketplaces de foodtrucks",
            "Clientes podem acessar múltiplos menus de uma vez"
          ]}
        />
        
        <FeatureCard
          title="Modo Offline"
          description="Cache e sincronização para operação sem internet"
          enabled={features.offlineMode}
          onChange={(enabled) => handleFeatureChange("offlineMode", enabled)}
          details={[
            "Permite o funcionamento do sistema mesmo sem conexão à internet",
            "Sincronização automática quando a conexão é restaurada",
            "Armazenamento local de pedidos e cardápios"
          ]}
        />
        
        <FeatureCard
          title="Integração de Pagamentos"
          description="Integração com Pix automático, MercadoPago, Stripe ou PicPay"
          enabled={features.paymentIntegration}
          onChange={(enabled) => handleFeatureChange("paymentIntegration", enabled)}
          details={[
            "Permite pagamentos online direto pelo aplicativo",
            "Suporte para múltiplas plataformas de pagamento",
            "Geração automática de QR Codes para Pix"
          ]}
        />
        
        <FeatureCard
          title="Notificações"
          description="Notificações em tempo real para o cliente via Web Push ou WhatsApp"
          enabled={features.notifications}
          onChange={(enabled) => handleFeatureChange("notifications", enabled)}
          details={[
            "Envio de notificações quando o pedido está pronto",
            "Atualização automática do status do pedido",
            "Possibilidade de notificações via WhatsApp"
          ]}
        />
        
        <FeatureCard
          title="Análises e Relatórios"
          description="Dashboard de métricas e relatórios de vendas"
          enabled={features.analytics}
          onChange={(enabled) => handleFeatureChange("analytics", enabled)}
          details={[
            "Visualização de métricas de vendas e desempenho",
            "Relatórios personalizáveis de produtos vendidos",
            "Análise de horários de pico e tendências"
          ]}
        />
        
        <FeatureCard
          title="Multi-localização"
          description="Suporte a múltiplos pontos com painel central"
          enabled={features.multiLocation}
          onChange={(enabled) => handleFeatureChange("multiLocation", enabled)}
          details={[
            "Gerenciamento de múltiplos pontos de venda em um único painel",
            "Configurações específicas para cada localização",
            "Relatórios consolidados ou por localização"
          ]}
        />
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveFeatures}>
          Salvar Permissões
        </Button>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  details: string[];
}

const FeatureCard = ({ title, description, enabled, onChange, details }: FeatureCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Card className={enabled ? "border-primary/50 shadow-md" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Switch checked={enabled} onCheckedChange={onChange} />
        </div>
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center p-0 h-auto">
              <span className="text-xs text-muted-foreground mr-1">
                {isOpen ? "Ocultar detalhes" : "Ver detalhes"}
              </span>
              <ChevronDown className="h-4 w-4" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ul className="space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start text-sm">
                  {enabled ? 
                    <CheckCircle className="h-4 w-4 text-primary mr-2 shrink-0 mt-0.5" /> : 
                    <Circle className="h-4 w-4 text-muted-foreground mr-2 shrink-0 mt-0.5" />
                  }
                  <span className={enabled ? "" : "text-muted-foreground"}>{detail}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
