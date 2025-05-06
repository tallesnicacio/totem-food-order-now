
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  PackageOpen, 
  ShoppingBag, 
  Settings, 
  ChefHat, 
  QrCode, 
  Monitor, 
  Package, 
  LogOut,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useAuth();
  
  // Definir usuários administradores do sistema
  const isSystemAdmin = user?.email && (
    user.email === "admin@menutoten.com" || 
    user.email === "contato@matheusgusso.com" || 
    user.email === "dev@menutoten.com"
  );

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard
    },
    {
      title: "Produtos",
      url: "/products",
      icon: PackageOpen
    },
    {
      title: "Estoque Diário",
      url: "/daily-inventory",
      icon: Package
    },
    {
      title: "Cozinha",
      url: "/kitchen",
      icon: ChefHat
    },
    {
      title: "Modo Totem",
      url: "/totem",
      icon: Monitor
    },
    {
      title: "QR Code Menu",
      url: "/qrcode",
      icon: QrCode
    },
    {
      title: "Gerador QR Code",
      url: "/qr-generator",
      icon: QrCode
    },
    {
      title: "Configurações",
      url: "/settings",
      icon: Settings
    }
  ];
  
  // Adiciona item de menu de administração do sistema apenas para administradores
  if (isSystemAdmin) {
    menuItems.push({
      title: "Administração do Sistema",
      url: "/system-admin",
      icon: Shield
    });
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema"
      });

      navigate("/auth");
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Não foi possível desconectar",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (url: string) => {
    return location.pathname === url;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center p-4">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">MenuTotem</h1>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
