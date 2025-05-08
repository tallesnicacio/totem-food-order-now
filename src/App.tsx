
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
import SystemAdmin from "@/pages/SystemAdmin";
import MasterAdmin from "@/pages/MasterAdmin";
import Restaurants from "@/pages/Restaurants";
import CashFlow from "@/pages/CashFlow";
import InventoryCheck from "@/pages/InventoryCheck";
import SetMasterAdmin from "@/pages/SetMasterAdmin";
import { RoleBasedAuth } from "@/components/auth/RoleBasedAuth";

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/totem" element={<TotemMenu />} />
        <Route path="/qrcode" element={<QRCodeMenu />} />
        <Route path="/community" element={<CommunityMenu />} />
        <Route path="/set-master-admin" element={<SetMasterAdmin />} />
        
        {/* Restaurant admin/staff routes */}
        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="products" element={<Products />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="settings" element={<Settings />} />
          <Route path="qr-generator" element={<QRGenerator />} />
          <Route path="community-qr" element={<CommunityQR />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="cashflow" element={<CashFlow />} />
          <Route path="inventory" element={<InventoryCheck />} />
        </Route>
        
        {/* System admin routes */}
        <Route path="/" element={<AppLayout />}>
          <Route 
            path="system-admin" 
            element={
              <RoleBasedAuth allowedRoles={["admin", "master"]}>
                <SystemAdmin />
              </RoleBasedAuth>
            } 
          />
          <Route 
            path="admin" 
            element={
              <RoleBasedAuth allowedRoles={["admin", "master"]}>
                <Admin />
              </RoleBasedAuth>
            } 
          />
        </Route>
        
        {/* Master admin routes */}
        <Route path="/" element={<AppLayout />}>
          <Route 
            path="master-admin" 
            element={
              <RoleBasedAuth allowedRoles={["master"]}>
                <MasterAdmin />
              </RoleBasedAuth>
            } 
          />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
