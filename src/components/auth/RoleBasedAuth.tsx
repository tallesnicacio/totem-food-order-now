
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export type UserRole = "admin" | "manager" | "staff" | "customer" | "master";

interface RoleBasedAuthProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const RoleBasedAuth = ({ 
  children, 
  allowedRoles, 
  redirectTo = "/auth" 
}: RoleBasedAuthProps) => {
  const { user, loading, userRole } = useAuth();
  
  if (loading) {
    return <div className="p-8 text-center">Verificando suas permissões...</div>;
  }
  
  if (!user) {
    return <Navigate to={redirectTo} />;
  }
  
  if (!allowedRoles.includes(userRole as UserRole)) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};
