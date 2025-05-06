
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminRestaurant, SubscriptionPlan } from "@/pages/Admin";
import { RestaurantManagement } from "@/components/admin/RestaurantManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { CommunityQRManagement } from "@/components/admin/CommunityQRManagement";
import { BillingOverview } from "@/components/admin/billing/BillingOverview";
import { PlansManagement } from "@/components/admin/plans/PlansManagement";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

const SystemAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Acesso restrito",
            description: "Você precisa estar logado para acessar esta página.",
            variant: "destructive",
          });
          return;
        }
        
        setUser(session.user);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar suas permissões.",
          variant: "destructive",
        });
      }
    };
    
    fetchUserData();
  }, [toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Administração do Sistema" 
          description="Área restrita para administração do sistema"
          currentPage="Administração do Sistema"
        />
        <div className="text-center py-10">Carregando dados...</div>
      </div>
    );
  }
  
  // Verifica se o usuário é administrador do sistema
  const isSystemAdmin = user?.email && (
    user.email === "admin@menutoten.com" || 
    user.email === "contato@matheusgusso.com" || 
    user.email === "dev@menutoten.com"
  );
  
  if (!isSystemAdmin) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Acesso Restrito" 
          description="Área restrita para administração do sistema"
          currentPage="Acesso Restrito"
        />
        <Card>
          <CardContent className="pt-6">
            <p>Esta área é exclusiva para administradores do sistema.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Administração do Sistema" 
        description="Área restrita para administração do sistema MenuTotem"
        currentPage="Administração do Sistema"
        icon={<Shield className="h-6 w-6 text-primary" />}
      />
      
      <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
        <p className="text-yellow-700">
          <strong>Área Restrita:</strong> Esta área é exclusiva para administradores do sistema MenuTotem.
        </p>
        <p className="text-yellow-700 mt-1">
          Usuário conectado: <strong>{user?.email}</strong>
        </p>
      </div>
      
      <Tabs defaultValue="restaurants" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="qrcodes">QR Codes Comunitários</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="restaurants">
          <RestaurantManagement />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="qrcodes">
          <CommunityQRManagement />
        </TabsContent>
        
        <TabsContent value="billing">
          <BillingOverview />
        </TabsContent>
        
        <TabsContent value="plans">
          <PlansManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemAdmin;
