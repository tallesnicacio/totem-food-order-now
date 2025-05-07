
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, Tablet, QrCode, ChefHat, Clock, Wallet, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

export const LandingPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'foodtrucks' | 'restaurants' | 'events'>('foodtrucks');

  const handleLogin = () => {
    navigate("/auth");
  };

  const features = [
    {
      icon: <Smartphone className="w-8 h-8 text-menutotem-primary" />,
      title: "Pedidos via Totem ou QR Code",
      description: "Clientes podem fazer pedidos diretamente em totens ou escaneando QR Codes nas mesas."
    },
    {
      icon: <Wallet className="w-8 h-8 text-menutotem-primary" />,
      title: "Pagamento Flexível",
      description: "Opções de pagamento antes ou depois do pedido, conforme preferência do estabelecimento."
    },
    {
      icon: <ChefHat className="w-8 h-8 text-menutotem-primary" />,
      title: "Painel da Cozinha",
      description: "Organização eficiente dos pedidos em tempo real."
    },
    {
      icon: <QrCode className="w-8 h-8 text-menutotem-primary" />,
      title: "QR Code Comunitário",
      description: "Acesso a múltiplos cardápios de foodtrucks em uma única interface."
    },
    {
      icon: <Clock className="w-8 h-8 text-menutotem-primary" />,
      title: "Notificações em Tempo Real",
      description: "Clientes são informados quando seus pedidos estão prontos."
    },
    {
      icon: <Users className="w-8 h-8 text-menutotem-primary" />,
      title: "Interface Intuitiva",
      description: "Design responsivo e fácil de usar, ideal para dispositivos móveis e totens."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-menutotem-primary/10 to-menutotem-primary/20 py-12 md:py-24">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              MenuTotem
            </h1>
            <p className="text-lg md:text-xl mb-6 text-menutotem-text-light">
              Solução de autoatendimento digital para foodtrucks e eventos gastronômicos
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleLogin} 
                className="bg-menutotem-primary hover:bg-menutotem-primary-dark text-white px-8 py-2"
              >
                Começar agora
              </Button>
              <Button 
                variant="outline" 
                className="border-menutotem-primary text-menutotem-primary hover:bg-menutotem-primary hover:text-white"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Saiba mais
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              {isMobile ? (
                <Smartphone className="w-full h-64 text-menutotem-primary/80" />
              ) : (
                <div className="flex gap-4 items-end">
                  <Smartphone className="w-32 h-48 text-menutotem-primary/80" />
                  <Tablet className="w-40 h-56 text-menutotem-primary/80" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Principais Funcionalidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-menutotem-text-light">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Segment Tabs */}
      <section className="py-16 bg-menutotem-bg-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Perfeito para</h2>
          
          <div className="flex flex-wrap justify-center mb-8 gap-2">
            <Button 
              variant={activeTab === 'foodtrucks' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('foodtrucks')}
              className={activeTab === 'foodtrucks' ? 'bg-menutotem-primary' : ''}
            >
              Foodtrucks
            </Button>
            <Button 
              variant={activeTab === 'restaurants' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('restaurants')}
              className={activeTab === 'restaurants' ? 'bg-menutotem-primary' : ''}
            >
              Restaurantes
            </Button>
            <Button 
              variant={activeTab === 'events' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('events')}
              className={activeTab === 'events' ? 'bg-menutotem-primary' : ''}
            >
              Eventos Gastronômicos
            </Button>
          </div>
          
          <Card className="shadow-lg">
            <CardContent className="p-6 md:p-8">
              {activeTab === 'foodtrucks' && (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold mb-4">Solução ideal para Foodtrucks</h3>
                    <p className="mb-4">Agilize o atendimento e reduza filas com pedidos via totem ou QR code, aumentando o giro de clientes e maximizando seu faturamento.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <ShieldCheck className="w-5 h-5 text-menutotem-primary mr-2" />
                        <span>Operação simplificada, mesmo em espaços reduzidos</span>
                      </li>
                      <li className="flex items-center">
                        <ShieldCheck className="w-5 h-5 text-menutotem-primary mr-2" />
                        <span>QR Code comunitário para praças de alimentação</span>
                      </li>
                      <li className="flex items-center">
                        <ShieldCheck className="w-5 h-5 text-menutotem-primary mr-2" />
                        <span>Atendimento simultâneo de múltiplos clientes</span>
                      </li>
                    </ul>
                  </div>
                  <div className="md:w-1/2 flex justify-center">
                    <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Imagem de Foodtruck</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'restaurants' && (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold mb-4">Perfeito para Restaurantes</h3>
                    <p className="mb-4">Modernize seu atendimento com QR Codes nas mesas, permitindo que os clientes façam pedidos sem esperar pelo garçom.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <ShieldCheck className="w-5 h-5 text-menutotem-primary mr-2" />
                        <span>Cardápio digital sempre atualizado</span>
                      </li>
                      <li className="flex items-center">
                        <ShieldCheck className="w-5 h-5 text-menutotem-primary mr-2" />
                        <span>Integração com sistema de mesas</span>
                      </li>
                      <li className="flex items-center">
                        <ShieldCheck className="w-5 h-5 text-menutotem-primary mr-2" />
                        <span>Redução da necessidade de equipe de atendimento</span>
                      </li>
                    </ul>
                  </div>
                  <div className="md:w-1/2 flex justify-center">
                    <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Imagem de Restaurante</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'events' && (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold mb-4">Ideal para Eventos Gastronômicos</h3>
                    <p className="mb-4">Aumente a eficiência operacional em feiras e eventos gastronômicos com um sistema unificado de pedidos.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <ShieldCheck className="w-5 h-5 text-menutotem-primary mr-2" />
                        <span>QR Code comunitário para todos os expositores</span>
                      </li>
                      <li className="flex items-center">
                        <ShieldCheck className="w-5 h-5 text-menutotem-primary mr-2" />
                        <span>Relatórios de vendas por evento</span>
                      </li>
                      <li className="flex items-center">
                        <ShieldCheck className="w-5 h-5 text-menutotem-primary mr-2" />
                        <span>Gestão simplificada de múltiplos estabelecimentos</span>
                      </li>
                    </ul>
                  </div>
                  <div className="md:w-1/2 flex justify-center">
                    <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Imagem de Evento</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-menutotem-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para revolucionar seu atendimento?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a diversos estabelecimentos que já estão usando o MenuTotem para aumentar suas vendas e melhorar a experiência do cliente.
          </p>
          <Button 
            onClick={handleLogin} 
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-menutotem-primary px-8 py-6 text-lg"
          >
            Começar agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">MenuTotem</h3>
              <p className="text-gray-400">© {new Date().getFullYear()} Todos os direitos reservados</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <a href="#" className="text-gray-400 hover:text-white">Termos de Uso</a>
              <a href="#" className="text-gray-400 hover:text-white">Política de Privacidade</a>
              <a href="#" className="text-gray-400 hover:text-white">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
