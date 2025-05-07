
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

// Protected route component that redirects to auth if not logged in
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Unprotected route for public pages (only Totem and QR code menu are public)
const UnprotectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

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
  const { user, loading } = useAuth();
  
  // If not logged in, redirect to auth page except for QR code and Totem routes
  if (!loading && !user) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/totem" element={<TotemMenu />} />
        <Route path="/qrcode" element={<QRCodeMenu />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }
  
  return (
    <Routes>
      {/* Rota de autenticação sem layout de App */}
      <Route path="/auth" element={
        user ? <Navigate to="/dashboard" replace /> : <Auth />
      } />
      
      {/* Rotas públicas (Totem e QRCode) */}
      <Route path="/totem" element={<UnprotectedRoute><TotemMenu /></UnprotectedRoute>} />
      <Route path="/qrcode" element={<UnprotectedRoute><QRCodeMenu /></UnprotectedRoute>} />
      
      {/* Rota administrativa do sistema - acesso restrito */}
      <Route path="/system-admin" element={
        <SystemAdminRoute>
          <AppLayout>
            <SystemAdmin />
          </AppLayout>
        </SystemAdminRoute>
      } />
      
      {/* Rotas do cliente com layout de App - protegidas por autenticação */}
      <Route path="/" element={<ProtectedRoute><AppLayout><Index /></AppLayout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><AppLayout><Products /></AppLayout></ProtectedRoute>} />
      <Route path="/daily-inventory" element={<ProtectedRoute><AppLayout><DailyInventory /></AppLayout></ProtectedRoute>} />
      <Route path="/qr-generator" element={<ProtectedRoute><AppLayout><QRGenerator /></AppLayout></ProtectedRoute>} />
      <Route path="/kitchen" element={<ProtectedRoute><AppLayout><Kitchen /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AppLayout><Admin /></AppLayout></ProtectedRoute>} />
      
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
