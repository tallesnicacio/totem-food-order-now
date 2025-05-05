
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, QrCode, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/utils/format";
import { QRCodeForm } from "./QRCodeForm";
import { AssignRestaurantsForm } from "./AssignRestaurantsForm";

type CommunityQR = {
  id: string;
  name: string;
  location: string | null;
  city: string | null;
  created_at: string;
  restaurant_count?: number;
};

export const CommunityQRManagement = () => {
  const [qrCodes, setQrCodes] = useState<CommunityQR[]>([]);
  const [filteredQRs, setFilteredQRs] = useState<CommunityQR[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQR, setEditingQR] = useState<CommunityQR | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedQR, setSelectedQR] = useState<CommunityQR | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      // Fetch community QR codes
      const { data: qrData, error: qrError } = await supabase
        .from('community_qr_codes')
        .select('*')
        .order('name');

      if (qrError) throw qrError;

      // Get counts of restaurants per QR code
      const qrCodesWithCounts = await Promise.all(
        qrData.map(async (qr) => {
          const { count, error } = await supabase
            .from('establishment_qr_codes')
            .select('*', { count: 'exact', head: true })
            .eq('community_qr_id', qr.id);
            
          return {
            ...qr,
            restaurant_count: count || 0
          };
        })
      );

      setQrCodes(qrCodesWithCounts);
      setFilteredQRs(qrCodesWithCounts);
      setLoading(false);

      // Extract unique cities
      const uniqueCities = Array.from(new Set(qrData?.map(qr => qr.city).filter(Boolean) as string[]));
      setCities(uniqueCities);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os QR codes comunitários.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Apply all filters
    let result = qrCodes;

    if (searchTerm) {
      result = result.filter(qr => 
        qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (qr.location && qr.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (cityFilter) {
      result = result.filter(qr => qr.city === cityFilter);
    }

    setFilteredQRs(result);
  }, [qrCodes, searchTerm, cityFilter]);

  const handleSaveQR = async (qrData: any) => {
    try {
      let result;
      
      if (editingQR) {
        // Update existing QR
        result = await supabase
          .from('community_qr_codes')
          .update({
            name: qrData.name,
            location: qrData.location,
            city: qrData.city
          })
          .eq('id', editingQR.id)
          .select();
      } else {
        // Create new QR
        result = await supabase
          .from('community_qr_codes')
          .insert({
            name: qrData.name,
            location: qrData.location,
            city: qrData.city
          })
          .select();
      }

      if (result.error) throw result.error;

      toast({
        title: editingQR ? "QR code atualizado" : "QR code criado",
        description: editingQR 
          ? "O QR code comunitário foi atualizado com sucesso."
          : "O novo QR code comunitário foi criado com sucesso.",
      });

      setIsDialogOpen(false);
      fetchQRCodes();
    } catch (error) {
      console.error("Error saving QR code:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o QR code comunitário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQR = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este QR code? Esta ação irá remover todos os restaurantes associados a ele.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('community_qr_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQrCodes(prev => prev.filter(qr => qr.id !== id));
      toast({
        title: "QR code excluído",
        description: "O QR code comunitário foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting QR code:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o QR code comunitário.",
        variant: "destructive",
      });
    }
  };

  const handleEditQR = (qr: CommunityQR) => {
    setEditingQR(qr);
    setIsDialogOpen(true);
  };

  const handleNewQR = () => {
    setEditingQR(null);
    setIsDialogOpen(true);
  };

  const handleAssignRestaurants = (qr: CommunityQR) => {
    setSelectedQR(qr);
    setShowAssign(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCityFilter("");
  };

  if (loading) {
    return <div className="text-center py-10">Carregando QR codes comunitários...</div>;
  }

  if (showAssign && selectedQR) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowAssign(false);
              setSelectedQR(null);
            }}
          >
            Voltar para lista de QR codes
          </Button>
        </div>
        <AssignRestaurantsForm 
          qrCode={selectedQR}
          onComplete={() => {
            setShowAssign(false);
            setSelectedQR(null);
            fetchQRCodes();
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar QR Codes Comunitários</CardTitle>
            <Button onClick={handleNewQR}>
              <Plus className="mr-2 h-4 w-4" /> Novo QR Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="col-span-1 md:col-span-2">
                <Input
                  placeholder="Buscar por nome ou localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  className="flex-1 p-2 border rounded"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">Todas as cidades</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                
                <Button variant="outline" onClick={resetFilters}>
                  Limpar
                </Button>
              </div>
            </div>

            {filteredQRs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Nenhum QR code comunitário encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Restaurantes</TableHead>
                      <TableHead>Data Criação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQRs.map((qr) => (
                      <TableRow key={qr.id}>
                        <TableCell className="font-medium">{qr.name}</TableCell>
                        <TableCell>{qr.location || "-"}</TableCell>
                        <TableCell>{qr.city || "-"}</TableCell>
                        <TableCell>{qr.restaurant_count}</TableCell>
                        <TableCell>{formatDateTime(qr.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEditQR(qr)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteQR(qr.id)}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline"
                              size="icon"
                              onClick={() => handleAssignRestaurants(qr)}
                              title="Gerenciar restaurantes"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline"
                              size="icon"
                              // In a real app, this would generate a QR code image
                              title="Gerar QR Code"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingQR ? "Editar QR Code Comunitário" : "Novo QR Code Comunitário"}
            </DialogTitle>
          </DialogHeader>
          <QRCodeForm 
            qrCode={editingQR} 
            onSave={handleSaveQR} 
            onCancel={() => setIsDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
