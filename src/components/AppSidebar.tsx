
import {
  LayoutDashboard,
  Package2,
  ChefHat,
  Settings,
  QrCode,
  CreditCard,
  Users,
  DatabaseIcon,
  FileCheck,
  Lock,
  Building,
  Shield,
  ServerCog,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const { pathname } = useLocation();
  const { signOut, user, userRole } = useAuth();
  
  const isMasterAdmin = userRole === 'master';

  return (
    <div className="h-full border-r bg-background w-64 flex flex-col">
      <div className="flex flex-col gap-2 px-4 py-3 border-b">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <img src="/logo.svg" alt="MenuTotem" className="h-8 w-8" />
          MenuTotem
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 overflow-hidden">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="truncate">{user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold">Menu</h2>
          <div className="space-y-1">
            {/* Regular restaurant features */}
            <Button
              variant={pathname === "/dashboard" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant={pathname === "/products" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/products">
                <Package2 className="mr-2 h-4 w-4" />
                Produtos
              </Link>
            </Button>
            <Button
              variant={pathname === "/kitchen" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/kitchen">
                <ChefHat className="mr-2 h-4 w-4" />
                Cozinha
              </Link>
            </Button>
            <Button
              variant={pathname === "/cashflow" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/cashflow">
                <DatabaseIcon className="mr-2 h-4 w-4" />
                Fluxo de Caixa
              </Link>
            </Button>
            <Button
              variant={pathname === "/inventory" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/inventory">
                <FileCheck className="mr-2 h-4 w-4" />
                Verificação de Estoque
              </Link>
            </Button>
            <Button
              variant={pathname === "/qr-generator" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/qr-generator">
                <QrCode className="mr-2 h-4 w-4" />
                QR Code
              </Link>
            </Button>
            <Button
              variant={pathname === "/community-qr" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/community-qr">
                <Users className="mr-2 h-4 w-4" />
                QR Comunitário
              </Link>
            </Button>
            <Button
              variant={pathname === "/settings" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </Button>
            <Button
              variant={pathname === "/subscription" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/subscription">
                <CreditCard className="mr-2 h-4 w-4" />
                Assinatura
              </Link>
            </Button>
            
            {/* Only show Admin section for users with master role */}
            {isMasterAdmin && (
              <>
                <div className="mt-6 mb-2 px-4 text-xs font-semibold">Administração</div>
                
                {/* Restaurant Management */}
                <Button
                  variant={pathname === "/restaurants" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/restaurants">
                    <Building className="mr-2 h-4 w-4" />
                    Restaurantes
                  </Link>
                </Button>
                
                {/* Master Admin */}
                <Button
                  variant={pathname === "/master-admin" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-800 border-l-2 border-purple-500"
                  asChild
                >
                  <Link to="/master-admin">
                    <Lock className="mr-2 h-4 w-4" />
                    Admin Master
                  </Link>
                </Button>
                
                {/* System Admin */}
                <Button
                  variant={pathname === "/system-admin" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/system-admin">
                    <ServerCog className="mr-2 h-4 w-4" />
                    Admin Sistema
                  </Link>
                </Button>
                
                {/* Admin */}
                <Button
                  variant={pathname === "/admin" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
                
                {/* Set Master Admin */}
                <Button
                  variant={pathname === "/set-master-admin" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/set-master-admin">
                    <Lock className="mr-2 h-4 w-4" />
                    Configurar Master Admin
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
