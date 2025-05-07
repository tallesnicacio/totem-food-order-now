
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart, Calendar, CreditCard, DollarSign, ShoppingBag, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [registerOpened, setRegisterOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dailyInventoryId, setDailyInventoryId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodaysRegisterStatus();
  }, []);

  const fetchTodaysRegisterStatus = async () => {
    try {
      setLoading(true);
      
      // Get current establishment ID
      const { data: establishmentData, error: establishmentError } = await supabase
        .from('establishments')
        .select('id')
        .limit(1);
      
      if (establishmentError) {
        console.error("Error fetching establishment:", establishmentError);
        throw establishmentError;
      }
      
      if (!establishmentData || establishmentData.length === 0) {
        console.warn("No establishment found");
        setLoading(false);
        return;
      }
      
      const establishmentId = establishmentData[0].id;
      
      // Check if there's already a daily inventory for today
      const today = new Date().toISOString().split('T')[0];
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('daily_inventory')
        .select('id, register_opened')
        .eq('establishment_id', establishmentId)
        .eq('date', today)
        .limit(1);
      
      if (inventoryError) {
        console.error("Error fetching inventory:", inventoryError);
        throw inventoryError;
      }
      
      if (inventoryData && inventoryData.length > 0) {
        setDailyInventoryId(inventoryData[0].id);
        setRegisterOpened(inventoryData[0].register_opened);
      } else {
        // Create new inventory for today
        const { data: newInventory, error: newInventoryError } = await supabase
          .from('daily_inventory')
          .insert({
            establishment_id: establishmentId,
            date: today,
            register_opened: false
          })
          .select();
        
        if (newInventoryError) {
          console.error("Error creating inventory:", newInventoryError);
          throw newInventoryError;
        }
        
        if (newInventory && newInventory.length > 0) {
          setDailyInventoryId(newInventory[0].id);
          setRegisterOpened(false);
        }
      }
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
      
      if (!dailyInventoryId) {
        console.error("No inventory ID");
        toast({
          title: "Erro",
          description: "ID do inventário não encontrado.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
      
      const { error } = await supabase
        .from('daily_inventory')
        .update({ register_opened: opened, updated_at: new Date().toISOString() })
        .eq('id', dailyInventoryId);
      
      if (error) {
        console.error("Error updating register status:", error);
        throw error;
      }
      
      toast({
        title: "Status atualizado",
        description: opened ? "Caixa aberto com sucesso!" : "Caixa fechado com sucesso!",
      });
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

      {/* Novo card de controle de caixa */}
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
              ? "O caixa está aberto. Os clientes podem fazer pedidos." 
              : "O caixa está fechado. Os clientes não podem fazer pedidos."}
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
