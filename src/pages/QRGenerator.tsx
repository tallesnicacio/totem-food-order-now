
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "lucide-react";

const QRGenerator = () => {
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [tableNumber, setTableNumber] = useState<string>("1");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("table");
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { restaurant, loading } = useRestaurant();

  useEffect(() => {
    // Get the current base URL
    const url = window.location.origin;
    setBaseUrl(url);
  }, []);

  useEffect(() => {
    if (baseUrl && restaurant?.id) {
      generateQrCode();
    }
  }, [baseUrl, tableNumber, restaurant?.id, activeTab]);

  const generateQrCode = () => {
    if (!restaurant?.id) return;
    
    // Create URL based on active tab
    const url = activeTab === "table" 
      ? `${baseUrl}/qrcode?e=${restaurant.id}&m=${tableNumber}` 
      : `${baseUrl}/qrcode?e=${restaurant.id}`;
    
    // Use the Google Charts API to generate QR codes
    const encodedUrl = encodeURIComponent(url);
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodedUrl}`;
    
    setQrCodeUrl(qrUrl);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleTableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableNumber(e.target.value);
  };

  const handleDownloadQR = () => {
    // Create an invisible link element to download the QR code
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = activeTab === "table" 
      ? `qrcode-mesa-${tableNumber}.png` 
      : "qrcode-geral.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code baixado",
      description: "O QR Code foi baixado com sucesso.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Restaurante não encontrado</h1>
        <p className="text-muted-foreground mb-4">
          Configure seu restaurante nas configurações antes de gerar QR Codes.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Gerador de QR Code</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="table">QR Code de Mesa</TabsTrigger>
          <TabsTrigger value="general">QR Code Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code para Mesa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block mb-2 font-medium">
                  Número da Mesa
                </label>
                <Input
                  type="text"
                  value={tableNumber}
                  onChange={handleTableChange}
                  className="w-full"
                />
              </div>
              
              {qrCodeUrl && (
                <div className="flex flex-col items-center mt-6">
                  <div className="border p-6 rounded-lg mb-4 bg-white">
                    <img src={qrCodeUrl} alt="QR Code" className="w-full h-auto max-w-[300px]" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Escaneie este QR Code para acessar o cardápio da mesa {tableNumber}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row w-full gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleCopyLink(`${baseUrl}/qrcode?e=${restaurant.id}&m=${tableNumber}`)}
                      className="w-full"
                    >
                      Copiar link
                    </Button>
                    <Button
                      onClick={handleDownloadQR}
                      className="w-full"
                    >
                      Baixar QR Code
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Use este QR Code para clientes sem mesa específica.
              </p>
              
              {qrCodeUrl && (
                <div className="flex flex-col items-center">
                  <div className="border p-6 rounded-lg mb-4 bg-white">
                    <img src={qrCodeUrl} alt="QR Code Geral" className="w-full h-auto max-w-[300px]" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Escaneie este QR Code para acessar o cardápio geral
                  </p>
                  
                  <div className="flex flex-col sm:flex-row w-full gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleCopyLink(`${baseUrl}/qrcode?e=${restaurant.id}`)}
                      className="w-full"
                    >
                      Copiar link
                    </Button>
                    <Button
                      onClick={handleDownloadQR}
                      className="w-full"
                    >
                      Baixar QR Code
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QRGenerator;
