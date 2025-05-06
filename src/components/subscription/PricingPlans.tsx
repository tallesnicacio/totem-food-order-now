
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/utils/format";

type PlanFeature = {
  name: string;
  included: boolean;
};

type PricingPlan = {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  isPopular: boolean;
  features: PlanFeature[];
};

export const PricingPlans = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      // Using RPC function instead of direct table access
      const { data, error } = await supabase
        .rpc('get_subscription_plans')
        .order('price');

      if (error) throw error;

      // Transform the data to match our PricingPlan interface
      const transformedPlans = data.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        price: Number(plan.price),
        billingCycle: plan.billing_cycle,
        description: `Até ${plan.max_products} produtos e ${plan.max_users} usuários`,
        isPopular: plan.is_popular,
        features: [
          { name: 'Cardápio Digital', included: true },
          { name: 'Gestão de Pedidos', included: true },
          { name: 'Personalização do Menu', included: plan.feature_customization },
          { name: 'QR Code Comunitário', included: plan.feature_qr_community },
          { name: 'Modo Offline', included: plan.feature_offline_mode },
          { name: 'Integração com Pagamentos', included: plan.feature_payment_integration },
          { name: 'Notificações em Tempo Real', included: plan.feature_notifications },
          { name: 'Relatórios e Analytics', included: plan.feature_analytics },
          { name: 'Múltiplas Localizações', included: plan.feature_multi_location },
        ]
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

  const handleSelectPlan = async (planId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Login necessário",
          description: "Faça login para assinar um plano.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Here you would integrate with a payment provider like Stripe
      // For now, we'll just show a success message
      toast({
        title: "Plano selecionado",
        description: "Você será redirecionado para finalizar sua assinatura.",
      });

      // In a real implementation, redirect to checkout or update subscription in database
      // navigate('/checkout');
    } catch (error) {
      console.error("Error selecting plan:", error);
      toast({
        title: "Erro",
        description: "Não foi possível selecionar o plano.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-10">Carregando planos...</div>;
  }

  return (
    <div className="container py-8 px-4 mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">Escolha seu Plano</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Selecione o plano que melhor se adapta às necessidades do seu negócio.
        </p>
        
        <div className="flex items-center justify-center mt-6">
          <div className="bg-muted p-1 rounded-lg flex items-center">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
              className="rounded-md"
              onClick={() => setBillingCycle('monthly')}
            >
              Mensal
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
              className="rounded-md"
              onClick={() => setBillingCycle('yearly')}
            >
              Anual <span className="ml-1 text-xs bg-primary-foreground text-primary px-1 py-0.5 rounded">-20%</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plans.filter(plan => plan.billingCycle === billingCycle).map((plan) => (
          <Card key={plan.id} className={`relative flex flex-col ${plan.isPopular ? 'border-primary shadow-lg' : ''}`}>
            {plan.isPopular && (
              <Badge variant="default" className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2">
                Mais Popular
              </Badge>
            )}
            
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-muted-foreground ml-1">
                  /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    {feature.included ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300 mr-2" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.isPopular ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.price === 0 ? 'Começar Agora' : 'Assinar Plano'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
