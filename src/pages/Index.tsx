
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">MenuTotem</h1>
        <p className="text-xl text-muted-foreground">
          Solução de autoatendimento digital para foodtrucks e eventos gastronômicos
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link to="/totem">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🖥️</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Totem</h2>
              <p className="text-center text-muted-foreground">
                Modo totem para autoatendimento
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/qrcode">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h2 className="text-xl font-bold mb-2">QR Code</h2>
              <p className="text-center text-muted-foreground">
                Cardápio via QR Code para mesas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/kitchen">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Cozinha</h2>
              <p className="text-center text-muted-foreground">
                Painel da cozinha para gerenciar pedidos
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link to="/dashboard">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Dashboard</h2>
              <p className="text-center text-muted-foreground">
                Visualize estatísticas e métricas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/products">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🍔</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Produtos</h2>
              <p className="text-center text-muted-foreground">
                Gerencie seu cardápio e produtos
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/settings">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Configurações</h2>
              <p className="text-center text-muted-foreground">
                Configure seu estabelecimento
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/daily-inventory">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Estoque Diário</h2>
              <p className="text-center text-muted-foreground">
                Gerencie a disponibilidade de produtos
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/subscription">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Assinatura</h2>
              <p className="text-center text-muted-foreground">
                Gerenciar planos e pagamentos
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Index;
