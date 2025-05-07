
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Banknote, DollarSign, AlignLeft, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CashRecord {
  id: string;
  type: 'opening' | 'closing';
  amount: number;
  notes: string;
  created_at: string;
  user_id: string;
}

const CashFlow = () => {
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [todayRecords, setTodayRecords] = useState<CashRecord[]>([]);
  const [isCashOpen, setIsCashOpen] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodayRecords();
  }, []);

  const fetchTodayRecords = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('cash_flow')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const records = data as CashRecord[];
      setTodayRecords(records);
      
      // Check if cash is currently open (if last record is opening)
      if (records.length > 0) {
        const lastRecord = records[records.length - 1];
        setIsCashOpen(lastRecord.type === 'opening');
      } else {
        setIsCashOpen(false);
      }
    } catch (error: any) {
      console.error('Error fetching cash records:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar registros de caixa: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCash = async () => {
    if (!amount.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o valor inicial do caixa",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('cash_flow')
        .insert({
          type: 'opening',
          amount: parseFloat(amount.replace(',', '.')),
          notes: notes,
          user_id: userId
        });

      if (error) throw error;

      toast({
        title: "Caixa aberto",
        description: "O caixa foi aberto com sucesso",
      });

      setAmount("");
      setNotes("");
      fetchTodayRecords();
    } catch (error: any) {
      console.error('Error opening cash:', error);
      toast({
        title: "Erro",
        description: "Falha ao abrir o caixa: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCash = async () => {
    if (!amount.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o valor final do caixa",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('cash_flow')
        .insert({
          type: 'closing',
          amount: parseFloat(amount.replace(',', '.')),
          notes: notes,
          user_id: userId
        });

      if (error) throw error;

      toast({
        title: "Caixa fechado",
        description: "O caixa foi fechado com sucesso",
      });

      setAmount("");
      setNotes("");
      fetchTodayRecords();
    } catch (error: any) {
      console.error('Error closing cash:', error);
      toast({
        title: "Erro",
        description: "Falha ao fechar o caixa: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (dateString: string): string => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Controle de Caixa"
        description="Gerencie a abertura e fechamento do caixa diário"
        currentPage="Controle de Caixa"
        icon={<Banknote className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{isCashOpen ? "Fechar Caixa" : "Abrir Caixa"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                {isCashOpen ? "Valor Final (R$)" : "Valor Inicial (R$)"}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                <Input
                  id="amount"
                  type="text"
                  placeholder="0,00"
                  className="pl-9"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9,\.]/g, '');
                    setAmount(value);
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 text-gray-500" size={16} />
                <Textarea
                  id="notes"
                  placeholder="Observações adicionais..."
                  className="pl-9 min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={isCashOpen ? handleCloseCash : handleOpenCash}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Processando..." : isCashOpen ? "Fechar Caixa" : "Abrir Caixa"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Registros de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : todayRecords.length > 0 ? (
              todayRecords.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-md border ${
                    record.type === 'opening' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">
                      {record.type === 'opening' ? 'Abertura' : 'Fechamento'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(record.created_at)}
                    </span>
                  </div>
                  <div className="font-bold text-lg mb-1">
                    {formatCurrency(record.amount)}
                  </div>
                  {record.notes && (
                    <p className="text-sm text-muted-foreground">{record.notes}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum registro para hoje
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={fetchTodayRecords}
              disabled={loading}
            >
              Atualizar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CashFlow;
