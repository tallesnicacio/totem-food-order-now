
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
  const { user, loading } = useAuth();
  
  // Check if the user is loaded and has a role
  // Note: In a real system, you'd fetch the user's role from the database
  // For this example, we're assuming the role is stored in user metadata
  const userRole = user?.user_metadata?.role as UserRole || "customer";
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to={redirectTo} />;
  }
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};
