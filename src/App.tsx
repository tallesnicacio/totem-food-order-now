
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Kitchen from "@/pages/Kitchen";
import Settings from "@/pages/Settings";
import QRGenerator from "@/pages/QRGenerator";
import Subscription from "@/pages/Subscription";
import Auth from "@/pages/Auth";
import TotemMenu from "@/pages/TotemMenu";
import QRCodeMenu from "@/pages/QRCodeMenu";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import CommunityQR from "@/pages/CommunityQR";
import CommunityMenu from "@/pages/CommunityMenu";
import Index from "@/pages/Index";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="settings" element={<Settings />} />
          <Route path="qr-generator" element={<QRGenerator />} />
          <Route path="community-qr" element={<CommunityQR />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        <Route path="/totem" element={<TotemMenu />} />
        <Route path="/qrcode" element={<QRCodeMenu />} />
        <Route path="/community" element={<CommunityMenu />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
