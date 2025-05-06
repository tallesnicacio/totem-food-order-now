
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Subscription from "./pages/Subscription";
import Products from "./pages/Products";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota de autenticação sem layout de App */}
          <Route path="/auth" element={<Auth />} />
          
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
          <Route path="/subscription" element={<AppLayout><Subscription /></AppLayout>} />
          <Route path="/admin" element={<AppLayout><Admin /></AppLayout>} />
          
          {/* Página não encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
