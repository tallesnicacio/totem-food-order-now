
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
      <Route path="/totem" element={<TotemMenu />} />
      <Route path="/qrcode" element={<QRCodeMenu />} />
      
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
      <Route path="/daily-inventory" element={<ProtectedRoute><AppLayout><DailyInventory /></AppLayout></ProtectedRoute>} />
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
