
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RESTAURANT } from '@/data/mockData';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">MenuTotem</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sistema de pedidos digitais para foodtrucks e pequenos restaurantes
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/totem">Modo Totem</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/qrcode">Simular QR Code</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/qr-generator">Gerar QR Codes</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Recursos Principais</h2>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="totem-card p-6">
            <h3 className="text-xl font-bold mb-3">Modo Totem</h3>
            <p className="text-muted-foreground mb-4">
              Ideal para autoatendimento em balcões e foodtrucks, permitindo que clientes façam seus pedidos diretamente.
            </p>
          </div>
          
          <div className="totem-card p-6">
            <h3 className="text-xl font-bold mb-3">QR Code nas Mesas</h3>
            <p className="text-muted-foreground mb-4">
              Ofereça aos seus clientes a possibilidade de fazer pedidos diretamente da mesa com um simples QR code.
            </p>
          </div>
          
          <div className="totem-card p-6">
            <h3 className="text-xl font-bold mb-3">Gerenciamento Simples</h3>
            <p className="text-muted-foreground mb-4">
              Interface fácil de usar para gerenciar cardápios, preços, e acompanhar pedidos em tempo real.
            </p>
          </div>
          
          <div className="totem-card p-6">
            <h3 className="text-xl font-bold mb-3">Múltiplas Formas de Pagamento</h3>
            <p className="text-muted-foreground mb-4">
              Suporte para pagamentos via PIX, cartão de crédito, ou pagamento na entrega.
            </p>
          </div>
          
          <div className="totem-card p-6">
            <h3 className="text-xl font-bold mb-3">Painel da Cozinha</h3>
            <p className="text-muted-foreground mb-4">
              Painel em tempo real para a cozinha visualizar e gerenciar pedidos em preparação.
            </p>
          </div>
          
          <div className="totem-card p-6">
            <h3 className="text-xl font-bold mb-3">Relatórios e Insights</h3>
            <p className="text-muted-foreground mb-4">
              Dados e estatísticas para ajudar a entender melhor seu negócio e tomar decisões informadas.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Sobre {RESTAURANT.name}</h2>
          
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg mb-8">
              Bem-vindo à nossa demonstração do MenuTotem. Este é um exemplo de como seu estabelecimento
              poderia utilizar nossa solução para automatizar pedidos e melhorar a eficiência.
            </p>
            
            <div className="flex justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/totem">Experimentar Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p>MenuTotem &copy; 2025 - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
