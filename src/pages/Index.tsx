
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ClipboardList, LayoutDashboard, QrCode, Settings, Utensils } from "lucide-react";

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-2">MenuTotem</h1>
      <p className="text-center text-muted-foreground mb-8">
        Sistema de cardápio digital e gestão de pedidos
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LinkCard
          to="/totem"
          title="Menu Totem"
          description="Visualize o cardápio em modo totem para pedidos no local"
          icon={<Utensils className="h-6 w-6" />}
        />
        
        <LinkCard
          to="/qrcode"
          title="Menu QR Code"
          description="Cardápio digital para acesso via QR Code"
          icon={<QrCode className="h-6 w-6" />}
        />
        
        <LinkCard
          to="/qr-generator"
          title="Gerador de QR Code"
          description="Gere QR Codes para as mesas do restaurante"
          icon={<QrCode className="h-6 w-6" />}
        />
        
        <LinkCard
          to="/kitchen"
          title="Cozinha"
          description="Acompanhe e gerencie pedidos na cozinha"
          icon={<ChefHat className="h-6 w-6" />}
        />
        
        <LinkCard
          to="/dashboard"
          title="Dashboard"
          description="Painel administrativo com estatísticas e gerenciamento"
          icon={<LayoutDashboard className="h-6 w-6" />}
        />
        
        <LinkCard
          to="/settings"
          title="Configurações"
          description="Configure opções do restaurante e do sistema"
          icon={<Settings className="h-6 w-6" />}
        />
      </div>
    </div>
  );
};

const LinkCard = ({ 
  to, 
  title, 
  description, 
  icon 
}: { 
  to: string; 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}) => (
  <Link to={to}>
    <Card className="h-full hover:bg-muted/50 transition-colors">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-primary/10 p-2 rounded-md">
          {icon}
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button variant="outline" className="w-full">
          Acessar
        </Button>
      </CardContent>
    </Card>
  </Link>
);

export default Index;
