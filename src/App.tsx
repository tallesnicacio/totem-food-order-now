
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
import Products from "./pages/Products";
import SystemAdmin from "./pages/SystemAdmin";
import { useAuth } from "./hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { Loader } from "lucide-react";

// Protected route component that redirects to auth if not logged in
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Check if register is open for public routes (totem and QR code)
const PublicRouteWithRegisterCheck = ({ children }: { children: React.ReactNode }) => {
  const [registerOpen, setRegisterOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRegisterStatus = async () => {
      try {
        setLoading(true);
        // Check if there are any orders for today - if yes, the register is open
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .gte('created_at', today)
          .lt('created_at', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString())
          .limit(1);
        
        if (error) {
          console.error("Error checking register status:", error);
          throw error;
        }
        
        // Register is considered open if there are orders today
        setRegisterOpen(data && data.length > 0);
      } catch (error) {
        console.error("Error:", error);
        setRegisterOpen(false); // Default to closed on error
      } finally {
        setLoading(false);
      }
    };

    checkRegisterStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  // If register is not open, display a message
  if (!registerOpen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Estabelecimento Fechado</h1>
        <p className="text-muted-foreground mb-6">
          Desculpe, o estabelecimento não está aceitando pedidos no momento.
          Por favor, tente novamente mais tarde.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

// Unprotected route for public pages (only Totem and QR code menu are public)
const UnprotectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Admin route with verification for system administrator access
const SystemAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  // Verify if the user has system administrator permission
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
      {/* Public routes - no auth required */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/totem" element={
        <PublicRouteWithRegisterCheck>
          <TotemMenu />
        </PublicRouteWithRegisterCheck>
      } />
      <Route path="/qrcode" element={
        <PublicRouteWithRegisterCheck>
          <QRCodeMenu />
        </PublicRouteWithRegisterCheck>
      } />
      
      {/* Redirect root to auth if not logged in, or to dashboard if logged in */}
      <Route path="/" element={<Index />} />
      
      {/* System admin routes */}
      <Route path="/system-admin" element={
        <SystemAdminRoute>
          <AppLayout>
            <SystemAdmin />
          </AppLayout>
        </SystemAdminRoute>
      } />
      
      {/* Protected routes - require authentication */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><AppLayout><Products /></AppLayout></ProtectedRoute>} />
      <Route path="/qr-generator" element={<ProtectedRoute><AppLayout><QRGenerator /></AppLayout></ProtectedRoute>} />
      <Route path="/kitchen" element={<ProtectedRoute><AppLayout><Kitchen /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AppLayout><Admin /></AppLayout></ProtectedRoute>} />
      
      {/* Not found page */}
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
