
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "./hooks/useAuth";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TotemMenu from "./pages/TotemMenu";
import QRCodeMenu from "./pages/QRCodeMenu";
import QRGenerator from "./pages/QRGenerator";
import Kitchen from "./pages/Kitchen";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import DailyInventory from "./pages/DailyInventory";
import Products from "./pages/Products";
import SystemAdmin from "./pages/SystemAdmin";
import { useAuth } from "./hooks/useAuth";

// Protegendo rotas com verificação de acesso de adminstrador do sistema
const SystemAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  // Verifica se o usuário tem permissão de administrador do sistema
  // Aqui estamos usando emails específicos como exemplo
  const isSystemAdmin = user?.email && 
    (user.email === "admin@menutoten.com" || 
     user.email === "contato@matheusgusso.com" || 
     user.email === "dev@menutoten.com");
  
  return isSystemAdmin ? <>{children}</> : <Navigate to="/auth" replace />;
};

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rota de autenticação sem layout de App */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Rota administrativa do sistema - acesso restrito */}
      <Route path="/system-admin" element={
        <SystemAdminRoute>
          <AppLayout>
            <SystemAdmin />
          </AppLayout>
        </SystemAdminRoute>
      } />
      
      {/* Rotas do cliente com layout de App */}
      <Route path="/" element={<AppLayout><Index /></AppLayout>} />
      <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
      <Route path="/daily-inventory" element={<AppLayout><DailyInventory /></AppLayout>} />
      <Route path="/totem" element={<AppLayout><TotemMenu /></AppLayout>} />
      <Route path="/qrcode" element={<AppLayout><QRCodeMenu /></AppLayout>} />
      <Route path="/qr-generator" element={<AppLayout><QRGenerator /></AppLayout>} />
      <Route path="/kitchen" element={<AppLayout><Kitchen /></AppLayout>} />
      <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
      <Route path="/admin" element={<AppLayout><Admin /></AppLayout>} />
      
      {/* Página não encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
