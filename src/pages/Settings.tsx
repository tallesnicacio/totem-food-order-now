
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRestaurant } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const { restaurant, loading } = useRestaurant();
  const [restaurantName, setRestaurantName] = useState(restaurant?.name || "");
  const [themeColor, setThemeColor] = useState(restaurant?.themeColor || "#FF5722");
  // Change the state type to boolean explicitly, not just true
  const [useTables, setUseTables] = useState<boolean>(restaurant?.useTables || true);
  const [paymentMethods, setPaymentMethods] = useState({
    pix: restaurant?.paymentMethods.pix || false,
    creditCard: restaurant?.paymentMethods.creditCard || false,
    cash: restaurant?.paymentMethods.cash || false,
    payLater: restaurant?.paymentMethods.payLater || false,
  });
  const [paymentTiming, setPaymentTiming] = useState<'before' | 'after'>(
    restaurant?.paymentTiming || 'before'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>
                Configure as informações básicas do seu restaurante.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant-name">Nome do Restaurante</Label>
                <Input
                  id="restaurant-name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Nome do seu restaurante"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="use-tables">Usar mesas</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-tables"
                    checked={useTables}
                    onCheckedChange={(checked: boolean) => setUseTables(checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {useTables 
                      ? "Os pedidos podem ser associados a mesas" 
                      : "Os pedidos não usarão mesas"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment" className="mt-6">
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
                        setPaymentMethods({...paymentMethods, pix: checked})
                      }
                    />
                    <Label htmlFor="payment-pix">PIX</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="payment-credit-card"
                      checked={paymentMethods.creditCard}
                      onCheckedChange={(checked) => 
                        setPaymentMethods({...paymentMethods, creditCard: checked})
                      }
                    />
                    <Label htmlFor="payment-credit-card">Cartão de Crédito</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="payment-cash"
                      checked={paymentMethods.cash}
                      onCheckedChange={(checked) => 
                        setPaymentMethods({...paymentMethods, cash: checked})
                      }
                    />
                    <Label htmlFor="payment-cash">Dinheiro</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="payment-later"
                      checked={paymentMethods.payLater}
                      onCheckedChange={(checked) => 
                        setPaymentMethods({...paymentMethods, payLater: checked})
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
                      onChange={() => setPaymentTiming('before')}
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
                      onChange={() => setPaymentTiming('after')}
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
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do seu cardápio digital.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme-color">Cor do Tema</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="theme-color"
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
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
