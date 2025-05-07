
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart, Calendar, CreditCard, DollarSign, ShoppingBag, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { resetOrderNumbering } from "@/services/orderService";

const Dashboard = () => {
  const [registerOpened, setRegisterOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodaysRegisterStatus();
  }, []);

  const fetchTodaysRegisterStatus = async () => {
    try {
      setLoading(true);
      
      // Get current restaurant config
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurant')
        .select('*')
        .limit(1);
      
      if (restaurantError) {
        console.error("Error fetching restaurant:", restaurantError);
        throw restaurantError;
      }
      
      if (!restaurantData || restaurantData.length === 0) {
        console.warn("No restaurant found");
        setLoading(false);
        return;
      }
      
      // Check if there are any orders for today - if yes, the register is open
      const today = new Date().toISOString().split('T')[0];
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .gte('created_at', today)
        .lt('created_at', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString())
        .limit(1);
      
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        throw ordersError;
      }
      
      // Register is considered open if there are orders today
      setRegisterOpened(ordersData && ordersData.length > 0);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o status do caixa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterToggle = async (opened: boolean) => {
    try {
      setSaving(true);
      setRegisterOpened(opened);
      
      if (opened) {
        // When opening the register, reset the order numbering
        await resetOrderNumbering();
        
        toast({
          title: "Status atualizado",
          description: "Caixa aberto com sucesso! A numeração dos pedidos foi reiniciada.",
        });
      } else {
        toast({
          title: "Status atualizado",
          description: "Caixa fechado com sucesso!",
        });
      }
    } catch (error) {
      console.error("Error updating register status:", error);
      setRegisterOpened(!opened); // revert UI state on error
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do caixa.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Visão geral do seu negócio"
        currentPage="Dashboard"
      />

      {/* Register control card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold">
            Status do Caixa
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="register-status"
              checked={registerOpened}
              onCheckedChange={handleRegisterToggle}
              disabled={loading || saving}
            />
            <Label htmlFor="register-status" className="font-medium">
              {loading ? "Carregando..." : registerOpened ? "Caixa Aberto" : "Caixa Fechado"}
            </Label>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {registerOpened 
              ? "O caixa está aberto. Os clientes podem fazer pedidos. A numeração dos pedidos começa do #1." 
              : "O caixa está fechado. Os clientes não podem fazer pedidos. Quando abrir o caixa novamente, a numeração dos pedidos será reiniciada."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 15.231,89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% desde o último mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +12% desde última semana
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180 novos clientes
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Vendas Semanais</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center">
              <BarChart className="h-16 w-16 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Novos pedidos registrados
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hoje às 14:35
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Pagamento recebido
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hoje às 13:12
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
