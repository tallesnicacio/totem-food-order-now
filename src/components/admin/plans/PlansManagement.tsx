
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionPlan } from "@/pages/Admin";
import { Plus } from "lucide-react";
import { PlansList } from "./PlansList";
import { PlanDialog } from "./PlanDialog";

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
        type: plan.type,
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
      features: { 
        maxProducts: 20,
        maxUsers: 3,
        customization: false,
        qrCommunity: false,
        offlineMode: false,
        paymentIntegration: false,
        notifications: false,
        analytics: false,
        multiLocation: false,
      },
    });
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setIsDialogOpen(true);
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

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentPlan(null);
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
            <PlansList
              plans={plans}
              onEditPlan={handleEditPlan}
              onDeletePlan={handleDeletePlan}
            />
          )}
        </CardContent>
      </Card>

      <PlanDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        currentPlan={currentPlan}
        onPlanSaved={fetchPlans}
      />
    </div>
  );
};
