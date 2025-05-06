
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from "@/components/PageHeader";
import { PricingPlans } from "@/components/subscription/PricingPlans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscriptionInfo, subscriptionService } from "@/services/subscriptionService";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/utils/format";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Subscription = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  // Verificar autenticação e dados da assinatura
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        await fetchSubscriptionStatus();
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Mostrar notificações de sucesso/cancelamento
  useEffect(() => {
    if (success) {
      toast({
        title: "Assinatura realizada com sucesso!",
        description: "Sua assinatura foi configurada com sucesso.",
      });
    } else if (canceled) {
      toast({
        title: "Assinatura cancelada",
        description: "A assinatura foi cancelada. Você pode tentar novamente quando desejar.",
        variant: "destructive",
      });
    }
  }, [success, canceled, toast]);

  const fetchSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const subscriptionData = await subscriptionService.checkSubscription();
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Erro ao obter status da assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const portalUrl = await subscriptionService.createPortalSession();
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível acessar o portal de gerenciamento de assinaturas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao gerenciar assinatura:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar gerenciar sua assinatura.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Planos e Assinaturas" 
        description="Gerencie ou atualize seu plano de assinatura"
        currentPage="Planos e Assinaturas"
      />
      
      {/* Alertas de sucesso e cancelamento */}
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Assinatura confirmada!</AlertTitle>
          <AlertDescription>
            Sua assinatura foi processada com sucesso. Você já pode aproveitar os recursos do seu plano.
          </AlertDescription>
        </Alert>
      )}
      
      {canceled && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Assinatura cancelada</AlertTitle>
          <AlertDescription>
            O processo de assinatura foi cancelado. Você pode tentar novamente quando quiser.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Autenticação necessária */}
      {!isAuthenticated && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Autenticação Necessária</CardTitle>
            <CardDescription>Você precisa estar logado para gerenciar assinaturas.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleLogin}>Fazer Login</Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Exibir informações da assinatura atual */}
      {isAuthenticated && loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando informações da assinatura...</span>
        </div>
      )}
      
      {isAuthenticated && !loading && subscription && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Assinatura Atual</CardTitle>
                <CardDescription>Detalhes da sua assinatura</CardDescription>
              </div>
              <Badge className={
                subscription.status === 'active' ? 'bg-green-500' : 
                subscription.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
              }>
                {subscription.status === 'active' ? 'Ativo' : 
                subscription.status === 'pending' ? 'Pendente' : 'Inativo'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Plano</p>
                <p className="text-xl">
                  {subscription.plan === 'monthly' ? 'Assinatura Mensal' : 
                   subscription.plan === 'percentage' ? 'Porcentagem sobre Vendas' : 
                   'Plano Personalizado'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Valor</p>
                <p className="text-xl font-bold">
                  {formatCurrency(subscription.amount)}
                  {subscription.plan === 'percentage' && <span className="text-sm font-normal"> / venda</span>}
                </p>
              </div>
            </div>
            
            {subscription.lastPaymentDate && (
              <div>
                <p className="text-sm font-medium">Último pagamento</p>
                <p>{formatDate(subscription.lastPaymentDate)}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleManageSubscription}>
              Gerenciar Assinatura
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Lista de planos disponíveis */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Planos Disponíveis</h2>
        <PricingPlans />
      </div>
    </div>
  );
};

export default Subscription;
