
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlanType, SubscriptionPlan, PlanFeatures } from "@/pages/Admin";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/utils/format";

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

export const PlansManagement = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Using RPC function to fetch subscription plans
      const { data, error } = await supabase
        .rpc('get_subscription_plans');

      if (error) throw error;

      // Transform the data to match our SubscriptionPlan interface
      const transformedPlans = data.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        type: plan.type as PlanType,
        price: Number(plan.price),
        billingCycle: plan.billing_cycle,
        isPopular: plan.is_popular,
        features: {
          maxProducts: plan.max_products,
          maxUsers: plan.max_users,
          customization: plan.feature_customization,
          qrCommunity: plan.feature_qr_community,
          offlineMode: plan.feature_offline_mode,
          paymentIntegration: plan.feature_payment_integration,
          notifications: plan.feature_notifications,
          analytics: plan.feature_analytics,
          multiLocation: plan.feature_multi_location,
        },
      }));

      setPlans(transformedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPlan = () => {
    setCurrentPlan({
      name: '',
      type: 'basic',
      price: 29.90,
      billingCycle: 'monthly',
      isPopular: false,
      features: { ...defaultPlanFeatures },
    });
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setIsDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!currentPlan?.name || !currentPlan?.price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const planData = {
        name: currentPlan.name,
        type: currentPlan.type,
        price: currentPlan.price,
        billing_cycle: currentPlan.billingCycle,
        is_popular: currentPlan.isPopular || false,
        max_products: currentPlan.features?.maxProducts || defaultPlanFeatures.maxProducts,
        max_users: currentPlan.features?.maxUsers || defaultPlanFeatures.maxUsers,
        feature_customization: currentPlan.features?.customization || false,
        feature_qr_community: currentPlan.features?.qrCommunity || false,
        feature_offline_mode: currentPlan.features?.offlineMode || false,
        feature_payment_integration: currentPlan.features?.paymentIntegration || false,
        feature_notifications: currentPlan.features?.notifications || false,
        feature_analytics: currentPlan.features?.analytics || false,
        feature_multi_location: currentPlan.features?.multiLocation || false,
      };

      if (currentPlan.id) {
        // Update existing plan
        const { data, error } = await supabase
          .rpc('update_subscription_plan', {
            plan_id: currentPlan.id,
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

      setIsDialogOpen(false);
      fetchPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('delete_subscription_plan', { plan_id: id });

      if (error) throw error;

      toast({
        title: "Plano excluído",
        description: "O plano foi excluído com sucesso.",
      });
      
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o plano.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-10">Carregando planos de assinatura...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Planos de Assinatura</CardTitle>
            <Button onClick={handleNewPlan}>
              <Plus className="mr-2 h-4 w-4" /> Novo Plano
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum plano de assinatura cadastrado.</p>
              <Button onClick={handleNewPlan} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Plano
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Cobrança</TableHead>
                    <TableHead>Popular</TableHead>
                    <TableHead>Max Produtos</TableHead>
                    <TableHead>Max Usuários</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell className="capitalize">{plan.type}</TableCell>
                      <TableCell>{formatCurrency(plan.price)}</TableCell>
                      <TableCell className="capitalize">
                        {plan.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
                      </TableCell>
                      <TableCell>
                        {plan.isPopular ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                      </TableCell>
                      <TableCell>{plan.features.maxProducts}</TableCell>
                      <TableCell>{plan.features.maxUsers}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {currentPlan?.id ? "Editar Plano" : "Novo Plano"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Nome do Plano</Label>
                <Input
                  id="plan-name"
                  value={currentPlan?.name || ''}
                  onChange={(e) => setCurrentPlan(prev => ({ ...prev!, name: e.target.value }))}
                  placeholder="Ex: Plano Básico"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plan-type">Tipo do Plano</Label>
                <select
                  id="plan-type"
                  className="w-full border rounded p-2"
                  value={currentPlan?.type}
                  onChange={(e) => setCurrentPlan(prev => ({ ...prev!, type: e.target.value as PlanType }))}
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
                  value={currentPlan?.price || 0}
                  onChange={(e) => setCurrentPlan(prev => ({ ...prev!, price: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billing-cycle">Ciclo de Cobrança</Label>
                <select
                  id="billing-cycle"
                  className="w-full border rounded p-2"
                  value={currentPlan?.billingCycle}
                  onChange={(e) => setCurrentPlan(prev => ({ ...prev!, billingCycle: e.target.value as 'monthly' | 'yearly' }))}
                >
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="is-popular"
                  checked={currentPlan?.isPopular || false}
                  onCheckedChange={(checked) => setCurrentPlan(prev => ({ ...prev!, isPopular: checked }))}
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
                  value={currentPlan?.features?.maxProducts || defaultPlanFeatures.maxProducts}
                  onChange={(e) => setCurrentPlan(prev => ({ 
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
                  value={currentPlan?.features?.maxUsers || defaultPlanFeatures.maxUsers}
                  onChange={(e) => setCurrentPlan(prev => ({ 
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
                    checked={currentPlan?.features?.customization || false}
                    onCheckedChange={(checked) => setCurrentPlan(prev => ({ 
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
                    checked={currentPlan?.features?.qrCommunity || false}
                    onCheckedChange={(checked) => setCurrentPlan(prev => ({ 
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
                    checked={currentPlan?.features?.offlineMode || false}
                    onCheckedChange={(checked) => setCurrentPlan(prev => ({ 
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
                    checked={currentPlan?.features?.paymentIntegration || false}
                    onCheckedChange={(checked) => setCurrentPlan(prev => ({ 
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
                    checked={currentPlan?.features?.notifications || false}
                    onCheckedChange={(checked) => setCurrentPlan(prev => ({ 
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
                    checked={currentPlan?.features?.analytics || false}
                    onCheckedChange={(checked) => setCurrentPlan(prev => ({ 
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
                    checked={currentPlan?.features?.multiLocation || false}
                    onCheckedChange={(checked) => setCurrentPlan(prev => ({ 
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
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSavePlan}>
              {currentPlan?.id ? "Salvar Alterações" : "Criar Plano"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
