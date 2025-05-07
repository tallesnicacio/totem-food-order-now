
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, QrCode, RefreshCw, Download, Copy } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";

interface StoredQRCode {
  id: string;
  restaurant_id: string;
  table_number: string | null;
  qr_code_url: string;
  qr_code_image: string;
  created_at: string;
}

const QRGenerator = () => {
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [tableNumber, setTableNumber] = useState<string>("1");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("table");
  const [loadingQR, setLoadingQR] = useState<boolean>(false);
  const [storedQRCodes, setStoredQRCodes] = useState<StoredQRCode[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { restaurant, loading } = useRestaurant();

  useEffect(() => {
    // Get the current base URL
    const url = window.location.origin;
    setBaseUrl(url);
  }, []);

  useEffect(() => {
    if (restaurant?.id) {
      fetchStoredQRCodes();
    }
  }, [restaurant?.id]);

  useEffect(() => {
    if (baseUrl && restaurant?.id && storedQRCodes.length > 0) {
      displayQRCode();
    }
  }, [baseUrl, tableNumber, restaurant?.id, activeTab, storedQRCodes]);

  const fetchStoredQRCodes = async () => {
    if (!restaurant?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('restaurant_qrcodes')
        .select('*')
        .eq('restaurant_id', restaurant.id);
      
      if (error) throw error;
      
      if (data) {
        setStoredQRCodes(data as StoredQRCode[]);
      }
    } catch (error) {
      console.error('Error fetching stored QR codes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os QR codes salvos.",
        variant: "destructive",
      });
    }
  };

  const displayQRCode = () => {
    // Get the current QR code based on active tab and table number
    let qrCode;
    
    if (activeTab === "table") {
      qrCode = storedQRCodes.find(qr => qr.table_number === tableNumber);
    } else {
      qrCode = storedQRCodes.find(qr => qr.table_number === null);
    }
    
    if (qrCode) {
      setQrCodeUrl(qrCode.qr_code_image);
    } else {
      // If no stored QR code, generate a temporary one
      generateTemporaryQRCode();
    }
  };

  const generateTemporaryQRCode = () => {
    if (!restaurant?.id || !baseUrl) return;
    
    // Create URL based on active tab
    let url;
    if (activeTab === "table") {
      url = `${baseUrl}/qrcode?e=${restaurant.id}&m=${tableNumber}`;
    } else {
      url = `${baseUrl}/qrcode?e=${restaurant.id}`;
    }
    
    // Use the Google Charts API to generate QR codes
    const encodedUrl = encodeURIComponent(url);
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodedUrl}`;
    
    setQrCodeUrl(qrUrl);
  };

  const generateAndStoreQRCode = async () => {
    if (!restaurant?.id || !baseUrl) return;
    
    setLoadingQR(true);
    
    try {
      // Create URL based on active tab
      let url;
      let tableNum = null;
      
      if (activeTab === "table") {
        url = `${baseUrl}/qrcode?e=${restaurant.id}&m=${tableNumber}`;
        tableNum = tableNumber;
      } else {
        url = `${baseUrl}/qrcode?e=${restaurant.id}`;
      }
      
      // Use the Google Charts API to generate QR codes
      const encodedUrl = encodeURIComponent(url);
      const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodedUrl}`;
      
      // Check if QR code already exists
      let existingQR;
      
      if (activeTab === "table") {
        existingQR = storedQRCodes.find(qr => qr.table_number === tableNumber);
      } else {
        existingQR = storedQRCodes.find(qr => qr.table_number === null);
      }
      
      let result;
      
      if (existingQR) {
        // Update existing QR code
        result = await supabase
          .from('restaurant_qrcodes')
          .update({
            qr_code_url: url,
            qr_code_image: qrUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingQR.id);
      } else {
        // Insert new QR code
        result = await supabase
          .from('restaurant_qrcodes')
          .insert({
            restaurant_id: restaurant.id,
            table_number: tableNum,
            qr_code_url: url,
            qr_code_image: qrUrl
          });
      }
      
      if (result.error) throw result.error;
      
      // Refresh the list of stored QR codes
      await fetchStoredQRCodes();
      
      setQrCodeUrl(qrUrl);
      
      toast({
        title: existingQR ? "QR Code atualizado" : "QR Code gerado",
        description: existingQR 
          ? "O QR Code foi atualizado com sucesso." 
          : "O QR Code foi gerado e salvo com sucesso.",
      });
    } catch (error) {
      console.error('Error generating/storing QR code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar ou salvar o QR code.",
        variant: "destructive",
      });
    } finally {
      setLoadingQR(false);
    }
  };

  const handleCopyLink = (url: string) => {
    if (!url) return;
    
    // Find the actual URL to copy (not the image URL)
    const qrCode = activeTab === "table"
      ? storedQRCodes.find(qr => qr.table_number === tableNumber)
      : storedQRCodes.find(qr => qr.table_number === null);
    
    const urlToCopy = qrCode 
      ? qrCode.qr_code_url 
      : `${baseUrl}/qrcode?e=${restaurant?.id}${activeTab === "table" ? `&m=${tableNumber}` : ''}`;
    
    navigator.clipboard.writeText(urlToCopy).then(() => {
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
    if (!qrCodeUrl) return;
    
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h1 className="text-2xl font-bold mb-4">Restaurante não encontrado</h1>
        <p className="text-muted-foreground mb-4">
          Configure seu restaurante nas configurações antes de gerar QR Codes.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto">
      <PageHeader 
        title="Gerador de QR Code" 
        description="Gere QR Codes para mesas ou para uso geral"
        currentPage="Gerador de QR Code"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" }
        ]}
        icon={<QrCode className="h-6 w-6" />}
      />
      
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
                <div className="flex gap-2 mb-6">
                  <Input
                    type="text"
                    value={tableNumber}
                    onChange={handleTableChange}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={generateTemporaryQRCode}
                    disabled={!restaurant?.id}
                    className="whitespace-nowrap"
                  >
                    Gerar QR Code
                  </Button>
                </div>
              </div>
              
              {qrCodeUrl && (
                <div className="flex flex-col items-center mt-6">
                  <div className="border p-6 rounded-lg mb-4 bg-white">
                    <img src={qrCodeUrl} alt="QR Code" className="w-full h-auto max-w-[300px]" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Escaneie este QR Code para acessar o cardápio da mesa {tableNumber}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row w-full gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleCopyLink(qrCodeUrl)}
                      className="w-full flex items-center justify-center"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar link
                    </Button>
                    <Button
                      onClick={handleDownloadQR}
                      className="w-full flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar QR Code
                    </Button>
                  </div>
                  
                  <Button
                    onClick={generateAndStoreQRCode}
                    variant="outline"
                    className="w-full"
                    disabled={loadingQR}
                  >
                    {loadingQR ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {storedQRCodes.some(qr => qr.table_number === tableNumber) 
                          ? "Atualizar QR Code" 
                          : "Salvar QR Code"}
                      </>
                    )}
                  </Button>
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
              <div className="flex justify-end mb-6">
                <Button 
                  onClick={generateTemporaryQRCode}
                  disabled={!restaurant?.id}
                >
                  Gerar QR Code
                </Button>
              </div>
              
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
                  
                  <div className="flex flex-col sm:flex-row w-full gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleCopyLink(qrCodeUrl)}
                      className="w-full flex items-center justify-center"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar link
                    </Button>
                    <Button
                      onClick={handleDownloadQR}
                      className="w-full flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar QR Code
                    </Button>
                  </div>
                  
                  <Button
                    onClick={generateAndStoreQRCode}
                    variant="outline"
                    className="w-full"
                    disabled={loadingQR}
                  >
                    {loadingQR ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {storedQRCodes.some(qr => qr.table_number === null) 
                          ? "Atualizar QR Code" 
                          : "Salvar QR Code"}
                      </>
                    )}
                  </Button>
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
