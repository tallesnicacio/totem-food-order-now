
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader, QrCode, Download, Copy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { QRCodeCanvas } from "qrcode.react";

interface CommunityQRData {
  id: string;
  name: string;
  location: string | null;
  city: string | null;
  created_at: string;
  restaurantCount?: number;
}

const CommunityQR = () => {
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [activeCommunityQR, setActiveCommunityQR] = useState<CommunityQRData | null>(null);
  const [communityQRs, setCommunityQRs] = useState<CommunityQRData[]>([]);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Get the current base URL
    const url = window.location.origin;
    setBaseUrl(url);
    
    // Fetch community QR codes
    fetchCommunityQRs();
  }, []);

  useEffect(() => {
    if (activeCommunityQR && baseUrl) {
      generateQrCode();
    }
  }, [activeCommunityQR, baseUrl]);

  const fetchCommunityQRs = async () => {
    try {
      setLoading(true);
      
      // First check if the user is a master admin
      const { data: roleData, error: roleError } = await supabase.rpc('user_is_master');
      
      if (roleError) throw roleError;
      
      if (roleData) {
        // If master admin, fetch all community QR codes
        const { data, error } = await supabase
          .from('community_qr_codes')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        // Get counts of restaurants per QR code
        const qrCodesWithCounts = await Promise.all(
          (data || []).map(async (qr) => {
            const { count, error } = await supabase
              .from('establishment_qr_codes')
              .select('*', { count: 'exact', head: true })
              .eq('community_qr_id', qr.id);
              
            return {
              ...qr,
              restaurantCount: count || 0
            };
          })
        );
        
        setCommunityQRs(qrCodesWithCounts);
        
        if (qrCodesWithCounts.length > 0) {
          setActiveCommunityQR(qrCodesWithCounts[0]);
        }
      } else {
        // If not master admin, fetch only the community QR codes associated with their establishment
        // First get the user's establishment ID
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('establishment_id')
          .eq('id', user?.id)
          .single();
        
        if (profileError) throw profileError;
        
        if (profileData?.establishment_id) {
          // Find all community QR codes this establishment belongs to
          const { data: establishmentQRs, error: establishmentQRError } = await supabase
            .from('establishment_qr_codes')
            .select('community_qr_id')
            .eq('establishment_id', profileData.establishment_id);
          
          if (establishmentQRError) throw establishmentQRError;
          
          if (establishmentQRs && establishmentQRs.length > 0) {
            const communityIds = establishmentQRs.map(item => item.community_qr_id);
            
            const { data: qrData, error: qrError } = await supabase
              .from('community_qr_codes')
              .select('*')
              .in('id', communityIds)
              .order('name');
            
            if (qrError) throw qrError;
            
            setCommunityQRs(qrData || []);
            
            if (qrData && qrData.length > 0) {
              setActiveCommunityQR(qrData[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching Community QR codes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os QR codes comunitários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQrCode = () => {
    if (!activeCommunityQR) return;
    
    // Create URL for community QR code
    const url = `${baseUrl}/community?id=${activeCommunityQR.id}`;
    setQrCodeUrl(url);
  };

  const handleSelectQR = (qrCode: CommunityQRData) => {
    setActiveCommunityQR(qrCode);
  };

  const handleCopyLink = () => {
    if (!activeCommunityQR) return;
    
    const url = `${baseUrl}/community?id=${activeCommunityQR.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    });
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl || !activeCommunityQR || !qrCodeRef.current) return;
    
    const canvas = qrCodeRef.current.querySelector('canvas');
    if (!canvas) return;
    
    // Create an invisible link element to download the QR code
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `qrcode-comunidade-${activeCommunityQR.name.replace(/\s+/g, '-').toLowerCase()}.png`;
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
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-48">
          <Loader className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando QR Codes comunitários...</span>
        </div>
      </div>
    );
  }

  if (communityQRs.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">QR Codes Comunitários</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Nenhum QR Code comunitário disponível</h2>
              <p className="text-muted-foreground">
                Você ainda não está participando de nenhum QR Code comunitário.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">QR Codes Comunitários</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Selecione um QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communityQRs.map((qr) => (
                  <div 
                    key={qr.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      activeCommunityQR?.id === qr.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleSelectQR(qr)}
                  >
                    <h3 className="font-medium">{qr.name}</h3>
                    {qr.location && <p className="text-sm text-muted-foreground">{qr.location}</p>}
                    {qr.city && <p className="text-sm text-muted-foreground">{qr.city}</p>}
                    {qr.restaurantCount !== undefined && (
                      <p className="text-xs mt-2">
                        {qr.restaurantCount} 
                        {qr.restaurantCount === 1 ? ' restaurante' : ' restaurantes'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {activeCommunityQR && (
            <Card>
              <CardHeader>
                <CardTitle>{activeCommunityQR.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mt-2">
                  {qrCodeUrl && (
                    <div className="border p-6 rounded-lg mb-4 bg-white" ref={qrCodeRef}>
                      <QRCodeCanvas
                        value={qrCodeUrl}
                        size={300}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground mb-6 text-center">
                    Escaneie este QR Code para acessar o cardápio comunitário
                  </p>
                  
                  <div className="flex flex-col sm:flex-row w-full gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCopyLink}
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copiar link
                    </Button>
                    <Button
                      onClick={handleDownloadQR}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" /> Baixar QR Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityQR;
