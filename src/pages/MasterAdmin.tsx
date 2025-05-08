import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RestaurantManagement } from "@/components/admin/RestaurantManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { CommunityQRManagement } from "@/components/admin/CommunityQRManagement";
import { BillingOverview } from "@/components/admin/billing/BillingOverview";
import { PlansManagement } from "@/components/admin/plans/PlansManagement";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const MasterAdmin = () => {
  const [loading, setLoading] = useState(true);
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMasterAccess = async () => {
      try {
        if (!user) {
          navigate('/auth');
          return;
        }
        
        setLoading(false);
        
        // If the user is not a master admin, redirect to dashboard
        if (userRole !== 'master') {
          toast({
            title: "Acesso restrito",
            description: "Esta área é exclusiva para administradores master.",
            variant: "destructive",
          });
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar suas permissões.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    };
    
    checkMasterAccess();
  }, [toast, navigate, user, userRole]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader 
          title="Administração Master" 
          description="Área restrita para administração master"
          currentPage="Administração Master"
        />
        <div className="text-center py-10">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Administração Master" 
        description="Área exclusiva para o administrador master do sistema MenuTotem"
        currentPage="Administração Master"
        icon={<Lock className="h-6 w-6 text-primary" />}
      />
      
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
        <p className="text-yellow-700 font-medium">
          <strong>Área Restrita:</strong> Esta área é exclusiva para o administrador master do sistema MenuTotem.
        </p>
        <p className="text-yellow-700 mt-1">
          Usuário conectado: <strong>{user?.email}</strong>
        </p>
      </div>
      
      <Tabs defaultValue="restaurants" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="qrcodes">QR Codes Comunitários</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="restaurants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Restaurantes</CardTitle>
              <CardDescription>
                Visualize, edite e gerencie todos os restaurantes cadastrados no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestaurantManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie todos os usuários do sistema, incluindo administradores, gerentes e funcionários.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="qrcodes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Codes Comunitários</CardTitle>
              <CardDescription>
                Configure e gerencie os QR Codes comunitários para eventos e praças de alimentação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommunityQRManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral de Faturamento</CardTitle>
              <CardDescription>
                Acompanhe o faturamento e as assinaturas de todos os clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BillingOverview />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Planos</CardTitle>
              <CardDescription>
                Configure os planos de assinatura disponíveis para os clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlansManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterAdmin;
