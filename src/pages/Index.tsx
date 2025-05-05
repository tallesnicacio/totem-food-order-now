
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ClipboardList, LayoutDashboard, QrCode, Settings, Utensils, Users, PackageOpen, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      
      // Get user role if user is logged in
      try {
        const { data, error } = await supabase.rpc('get_user_role');
        
        if (error) throw error;
        
        setUserRole(data || null);
      } catch (error) {
        console.error("Error getting user role:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate('/auth');
        } else {
          setUser(session.user);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-center mb-2">MenuTotem</h1>
        <p className="text-center text-muted-foreground mb-8">
          Sistema de cardápio digital e gestão de pedidos
        </p>
        <div className="text-center py-10">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">MenuTotem</h1>
          <p className="text-muted-foreground">
            Sistema de cardápio digital e gestão de pedidos
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">{user?.email}</p>
            <p className="text-sm text-muted-foreground">
              {userRole === 'master' ? 'Administrador Master' : 
              userRole === 'admin' ? 'Administrador' : 
              userRole === 'manager' ? 'Gerente' : 
              userRole === 'kitchen' ? 'Cozinha' : 'Usuário'}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LinkCard
          to="/totem"
          title="Menu Totem"
          description="Visualize o cardápio em modo totem para pedidos no local"
          icon={<Utensils className="h-6 w-6" />}
        />
        
        <LinkCard
          to="/qrcode"
          title="Menu QR Code"
          description="Cardápio digital para acesso via QR Code"
          icon={<QrCode className="h-6 w-6" />}
        />
        
        <LinkCard
          to="/qr-generator"
          title="Gerador de QR Code"
          description="Gere QR Codes para as mesas do restaurante"
          icon={<QrCode className="h-6 w-6" />}
        />
        
        <LinkCard
          to="/kitchen"
          title="Cozinha"
          description="Acompanhe e gerencie pedidos na cozinha"
          icon={<ChefHat className="h-6 w-6" />}
        />
        
        <LinkCard
          to="/dashboard"
          title="Dashboard"
          description="Painel administrativo com estatísticas e gerenciamento"
          icon={<LayoutDashboard className="h-6 w-6" />}
        />
        
        <LinkCard
          to="/settings"
          title="Configurações"
          description="Configure opções do restaurante e do sistema"
          icon={<Settings className="h-6 w-6" />}
        />
        
        <LinkCard
          to="/daily-inventory"
          title="Estoque Diário"
          description="Gerencie a disponibilidade de produtos e abra o caixa"
          icon={<PackageOpen className="h-6 w-6" />}
        />

        {(userRole === 'master' || userRole === 'admin') && (
          <LinkCard
            to="/admin"
            title="Controle Administrativo"
            description="Gerencie restaurantes e liberações de funcionalidades"
            icon={<Users className="h-6 w-6" />}
          />
        )}
      </div>
    </div>
  );
};

const LinkCard = ({ 
  to, 
  title, 
  description, 
  icon 
}: { 
  to: string; 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}) => (
  <Link to={to}>
    <Card className="h-full hover:bg-muted/50 transition-colors">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-primary/10 p-2 rounded-md">
          {icon}
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button variant="outline" className="w-full">
          Acessar
        </Button>
      </CardContent>
    </Card>
  </Link>
);

export default Index;
