
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan, PlanType, PlanFeatures } from "@/pages/Admin";

const defaultPlanFeatures: PlanFeatures = {
  maxProducts: 20,
  maxUsers: 3,
  customization: false,
  qrCommunity: false,
  offlineMode: false,
  paymentIntegration: false,
  notifications: false,
  analytics: false,
  multiLocation: false,
};

interface PlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: Partial<SubscriptionPlan> | null;
  onPlanSaved: () => void;
}

export const PlanDialog = ({ isOpen, onClose, currentPlan, onPlanSaved }: PlanDialogProps) => {
  const [plan, setPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const { toast } = useToast();

  // Initialize plan data when dialog opens
  useEffect(() => {
    if (currentPlan) {
      setPlan({
        ...currentPlan,
        features: currentPlan.features || { ...defaultPlanFeatures }
      });
    }
  }, [currentPlan]);

  const handleSavePlan = async () => {
    if (!plan?.name || !plan?.price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const planData = {
        name: plan.name,
        type: plan.type,
        price: plan.price,
        billing_cycle: plan.billingCycle,
        is_popular: plan.isPopular || false,
        max_products: plan.features?.maxProducts || defaultPlanFeatures.maxProducts,
        max_users: plan.features?.maxUsers || defaultPlanFeatures.maxUsers,
        feature_customization: plan.features?.customization || false,
        feature_qr_community: plan.features?.qrCommunity || false,
        feature_offline_mode: plan.features?.offlineMode || false,
        feature_payment_integration: plan.features?.paymentIntegration || false,
        feature_notifications: plan.features?.notifications || false,
        feature_analytics: plan.features?.analytics || false,
        feature_multi_location: plan.features?.multiLocation || false,
      };

      if (plan.id) {
        // Update existing plan
        const { data, error } = await supabase
          .rpc('update_subscription_plan', {
            plan_id: plan.id,
            plan_data: planData
          });

        if (error) throw error;

        toast({
          title: "Plano atualizado",
          description: "O plano foi atualizado com sucesso.",
        });
      } else {
        // Create new plan
        const { data, error } = await supabase
          .rpc('insert_subscription_plan', {
            plan_data: planData
          });

        if (error) throw error;

        toast({
          title: "Plano criado",
          description: "O novo plano foi criado com sucesso.",
        });
      }

      onClose();
      onPlanSaved();
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano.",
        variant: "destructive",
      });
    }
  };

  if (!plan) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {plan.id ? "Editar Plano" : "Novo Plano"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Nome do Plano</Label>
              <Input
                id="plan-name"
                value={plan.name || ''}
                onChange={(e) => setPlan(prev => ({ ...prev!, name: e.target.value }))}
                placeholder="Ex: Plano Básico"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan-type">Tipo do Plano</Label>
              <select
                id="plan-type"
                className="w-full border rounded p-2"
                value={plan.type}
                onChange={(e) => setPlan(prev => ({ ...prev!, type: e.target.value as PlanType }))}
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan-price">Preço (R$)</Label>
              <Input
                id="plan-price"
                type="number"
                step="0.01"
                value={plan.price || 0}
                onChange={(e) => setPlan(prev => ({ ...prev!, price: parseFloat(e.target.value) }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billing-cycle">Ciclo de Cobrança</Label>
              <select
                id="billing-cycle"
                className="w-full border rounded p-2"
                value={plan.billingCycle}
                onChange={(e) => setPlan(prev => ({ ...prev!, billingCycle: e.target.value as 'monthly' | 'yearly' }))}
              >
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is-popular"
                checked={plan.isPopular || false}
                onCheckedChange={(checked) => setPlan(prev => ({ ...prev!, isPopular: checked }))}
              />
              <Label htmlFor="is-popular">Marcar como plano popular</Label>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Limites e Recursos</h3>
            
            <div className="space-y-2">
              <Label htmlFor="max-products">Número Máximo de Produtos</Label>
              <Input
                id="max-products"
                type="number"
                value={plan.features?.maxProducts || defaultPlanFeatures.maxProducts}
                onChange={(e) => setPlan(prev => ({ 
                  ...prev!, 
                  features: { 
                    ...prev!.features!, 
                    maxProducts: parseInt(e.target.value) 
                  } 
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-users">Número Máximo de Usuários</Label>
              <Input
                id="max-users"
                type="number"
                value={plan.features?.maxUsers || defaultPlanFeatures.maxUsers}
                onChange={(e) => setPlan(prev => ({ 
                  ...prev!, 
                  features: { 
                    ...prev!.features!, 
                    maxUsers: parseInt(e.target.value) 
                  } 
                }))}
              />
            </div>
            
            <h4 className="font-medium mt-4">Recursos Disponíveis</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="feature-customization"
                  checked={plan.features?.customization || false}
                  onCheckedChange={(checked) => setPlan(prev => ({ 
                    ...prev!, 
                    features: { 
                      ...prev!.features!, 
                      customization: checked 
                    } 
                  }))}
                />
                <Label htmlFor="feature-customization">Personalização do Menu</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="feature-qr-community"
                  checked={plan.features?.qrCommunity || false}
                  onCheckedChange={(checked) => setPlan(prev => ({ 
                    ...prev!, 
                    features: { 
                      ...prev!.features!, 
                      qrCommunity: checked 
                    } 
                  }))}
                />
                <Label htmlFor="feature-qr-community">QR Code Comunitário</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="feature-offline-mode"
                  checked={plan.features?.offlineMode || false}
                  onCheckedChange={(checked) => setPlan(prev => ({ 
                    ...prev!, 
                    features: { 
                      ...prev!.features!, 
                      offlineMode: checked 
                    } 
                  }))}
                />
                <Label htmlFor="feature-offline-mode">Modo Offline</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="feature-payment-integration"
                  checked={plan.features?.paymentIntegration || false}
                  onCheckedChange={(checked) => setPlan(prev => ({ 
                    ...prev!, 
                    features: { 
                      ...prev!.features!, 
                      paymentIntegration: checked 
                    } 
                  }))}
                />
                <Label htmlFor="feature-payment-integration">Integração com Pagamentos</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="feature-notifications"
                  checked={plan.features?.notifications || false}
                  onCheckedChange={(checked) => setPlan(prev => ({ 
                    ...prev!, 
                    features: { 
                      ...prev!.features!, 
                      notifications: checked 
                    } 
                  }))}
                />
                <Label htmlFor="feature-notifications">Notificações</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="feature-analytics"
                  checked={plan.features?.analytics || false}
                  onCheckedChange={(checked) => setPlan(prev => ({ 
                    ...prev!, 
                    features: { 
                      ...prev!.features!, 
                      analytics: checked 
                    } 
                  }))}
                />
                <Label htmlFor="feature-analytics">Relatórios e Analytics</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="feature-multi-location"
                  checked={plan.features?.multiLocation || false}
                  onCheckedChange={(checked) => setPlan(prev => ({ 
                    ...prev!, 
                    features: { 
                      ...prev!.features!, 
                      multiLocation: checked 
                    } 
                  }))}
                />
                <Label htmlFor="feature-multi-location">Múltiplas Localizações</Label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button onClick={handleSavePlan}>
            {plan.id ? "Salvar Alterações" : "Criar Plano"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
