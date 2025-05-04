
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RESTAURANT } from "@/data/mockData";

const QRGenerator = () => {
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [tableNumber, setTableNumber] = useState<string>("1");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    // Get the current base URL in production this would be your domain
    const url = window.location.origin;
    setBaseUrl(url);
  }, []);

  useEffect(() => {
    if (baseUrl) {
      generateQrCode();
    }
  }, [baseUrl, tableNumber]);

  const generateQrCode = () => {
    const url = `${baseUrl}/qrcode?e=${RESTAURANT.id}&m=${tableNumber}`;
    
    // For now we'll use the Google Charts API to generate QR codes
    // In a real app, you might want to use a library like qrcode.react
    const encodedUrl = encodeURIComponent(url);
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodedUrl}`;
    
    setQrCodeUrl(qrUrl);
  };

  const handleCopyLink = () => {
    const url = `${baseUrl}/qrcode?e=${RESTAURANT.id}&m=${tableNumber}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleTableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableNumber(e.target.value);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-3xl font-bold mb-6">Gerador de QR Code</h1>
        
        <div className="totem-card p-6 mb-6">
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Mesa #
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={handleTableChange}
              className="w-full p-3 border rounded-md"
            />
          </div>
          
          <Button 
            onClick={generateQrCode}
            className="w-full bg-primary hover:bg-primary/90 mb-4"
          >
            Gerar QR Code
          </Button>
          
          {qrCodeUrl && (
            <div className="flex flex-col items-center mt-6">
              <div className="border p-4 rounded-lg mb-4">
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-auto" />
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Escaneie este QR Code para acessar o cardápio da mesa {tableNumber}
              </p>
              
              <Button 
                variant="outline" 
                onClick={handleCopyLink}
                className="w-full"
              >
                {copySuccess ? "Link copiado!" : "Copiar link"}
              </Button>
            </div>
          )}
        </div>
        
        <div className="totem-card p-6">
          <h2 className="text-xl font-bold mb-4">QR Code Geral</h2>
          <p className="text-muted-foreground mb-4">
            Gere um QR Code geral para usar em ambientes sem mesas específicas:
          </p>
          
          <div className="flex flex-col items-center mt-6">
            <div className="border p-4 rounded-lg mb-4">
              <img 
                src={`https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(`${baseUrl}/qrcode?e=${RESTAURANT.id}`)}`}
                alt="QR Code Geral" 
                className="w-full h-auto" 
              />
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Escaneie este QR Code para acessar o cardápio geral
            </p>
            
            <Button 
              variant="outline" 
              onClick={() => {
                navigator.clipboard.writeText(`${baseUrl}/qrcode?e=${RESTAURANT.id}`).then(() => {
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                });
              }}
              className="w-full"
            >
              {copySuccess ? "Link copiado!" : "Copiar link"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
