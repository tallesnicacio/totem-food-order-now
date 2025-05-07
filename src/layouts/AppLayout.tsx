
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export const AppLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    // Atualiza o estado do sidebar quando o tamanho da tela muda
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar que pode ser escondida em dispositivos móveis */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
          <AppSidebar />
        </div>
        
        {/* Conteúdo principal */}
        <SidebarInset className="w-full">
          {/* Botão para mostrar/esconder sidebar em dispositivos móveis */}
          {isMobile && (
            <Button 
              variant="outline" 
              size="icon" 
              className="fixed top-4 left-4 z-50"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          
          <div className={`p-4 md:p-6 ${isMobile ? 'pt-16' : ''}`}>
            <Toaster />
            <Sonner />
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
