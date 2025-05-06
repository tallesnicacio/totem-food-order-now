
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RestaurantManagement } from "@/components/admin/RestaurantManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { CommunityQRManagement } from "@/components/admin/CommunityQRManagement";
import { BillingOverview } from "@/components/admin/BillingOverview";
import { PlansManagement } from "@/components/admin/PlansManagement";
import { supabase } from "@/integrations/supabase/client";

// Add the AdminRestaurant interface
export interface AdminRestaurant {
  id: string;
  name: string;
  address?: string;
  city?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
  billing_plan?: string;
  billing_amount?: number;
  billing_status?: string;
  last_payment_date?: string;
  in_community_qr?: boolean;
  features: {
    qrCommunity: boolean;
    offlineMode: boolean;
    paymentIntegration: boolean;
    notifications: boolean;
    analytics: boolean;
    multiLocation: boolean;
  };
}

// Define subscription plan types
export type PlanType = 'free' | 'basic' | 'premium' | 'enterprise';

// Define subscription plan features
export interface PlanFeatures {
  maxProducts: number;
  maxUsers: number;
  customization: boolean;
  qrCommunity: boolean;
  offlineMode: boolean;
  paymentIntegration: boolean;
  notifications: boolean;
  analytics: boolean;
  multiLocation: boolean;
}

// Define subscription plan
export interface SubscriptionPlan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: PlanFeatures;
  isPopular?: boolean;
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkUserPermission = async () => {
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
        
        const { data, error } = await supabase.rpc('get_user_role');
        
        if (error) throw error;
        
        setUserRole(data || null);
        setLoading(false);
      } catch (error) {
        console.error("Error checking user permission:", error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar suas permissões.",
          variant: "destructive",
        });
      }
    };
    
    checkUserPermission();
  }, [toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
        <div className="text-center py-10">Carregando dados...</div>
      </div>
    );
  }
  
  if (userRole !== 'master') {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Acesso Restrito</h1>
        <Card>
          <CardContent className="pt-6">
            <p>Esta área é exclusiva para administradores master.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo Master</h1>
      
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

export default Admin;
