import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Restaurant } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { subscriptionService, SubscriptionInfo } from "@/services/subscriptionService";

interface PaymentSettingsProps {
  restaurant: Restaurant | null;
  onUpdate: (settings: Partial<Restaurant>) => void;
}

export const PaymentSettings = ({ restaurant, onUpdate }: PaymentSettingsProps) => {
  const [paymentMethods, setPaymentMethods] = useState({
    pix: restaurant?.paymentMethods?.pix || false,
    creditCard: restaurant?.paymentMethods?.creditCard || false,
    cash: restaurant?.paymentMethods?.cash || false,
    payLater: restaurant?.paymentMethods?.payLater || false,
  });
  
  const [paymentTiming, setPaymentTiming] = useState<'before' | 'after'>(
    restaurant?.paymentTiming || 'before'
  );

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const subscriptionData = await subscriptionService.checkSubscription();
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error fetching subscription info:', error);
    }
  };

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    const updatedMethods = { ...paymentMethods, [method]: checked };
    setPaymentMethods(updatedMethods);
    onUpdate({ paymentMethods: updatedMethods });
  };

  const handlePaymentTimingChange = (timing: 'before' | 'after') => {
    setPaymentTiming(timing);
    onUpdate({ paymentTiming: timing });
  };

  const handleUpgradeSubscription = () => {
    navigate('/subscription');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plano e Assinatura</CardTitle>
          <CardDescription>
            Informações sobre seu plano atual e opções de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Seu Plano Atual</h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription.plan}
                  </p>
                </div>
                <Badge className={
                  subscription.status === 'Ativo' ? 'bg-green-500' : 
                  subscription.status === 'Pendente' ? 'bg-yellow-500' : 'bg-red-500'
                }>
                  {subscription.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Valor</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(subscription.amount)}
                    {subscription.plan.includes('Porcentagem') && <span className="text-sm font-normal"> / venda</span>}
                  </p>
                </div>
                
                {subscription.nextBillingDate && (
                  <div>
                    <p className="text-sm font-medium">Próxima Cobrança</p>
                    <p>{formatDate(subscription.nextBillingDate)}</p>
                  </div>
                )}
              </div>
              
              <Button onClick={handleUpgradeSubscription} className="w-full">
                {subscription.status === 'Ativo' ? 'Alterar Plano' : 'Atualizar Plano'}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Você ainda não possui um plano ativo.
              </p>
              <Button onClick={handleUpgradeSubscription}>
                Escolher um Plano
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Pagamento</CardTitle>
          <CardDescription>
            Configure as opções de pagamento disponíveis para seus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Métodos de Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-pix"
                  checked={paymentMethods.pix}
                  onCheckedChange={(checked) => 
                    handlePaymentMethodChange('pix', checked)
                  }
                />
                <Label htmlFor="payment-pix">PIX</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-credit-card"
                  checked={paymentMethods.creditCard}
                  onCheckedChange={(checked) => 
                    handlePaymentMethodChange('creditCard', checked)
                  }
                />
                <Label htmlFor="payment-credit-card">Cartão de Crédito</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-cash"
                  checked={paymentMethods.cash}
                  onCheckedChange={(checked) => 
                    handlePaymentMethodChange('cash', checked)
                  }
                />
                <Label htmlFor="payment-cash">Dinheiro</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="payment-later"
                  checked={paymentMethods.payLater}
                  onCheckedChange={(checked) => 
                    handlePaymentMethodChange('payLater', checked)
                  }
                />
                <Label htmlFor="payment-later">Pagar Depois</Label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Momento do Pagamento</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="payment-before"
                  name="payment-timing"
                  checked={paymentTiming === 'before'}
                  onChange={() => handlePaymentTimingChange('before')}
                  className="h-4 w-4"
                />
                <Label htmlFor="payment-before">
                  Antes do preparo (pagar ao fazer o pedido)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="payment-after"
                  name="payment-timing"
                  checked={paymentTiming === 'after'}
                  onChange={() => handlePaymentTimingChange('after')}
                  className="h-4 w-4"
                />
                <Label htmlFor="payment-after">
                  Depois do consumo (comanda)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
