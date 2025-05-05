
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/utils/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type BillingStats = {
  total: number;
  monthly: number;
  percentage: number;
  activeCount: number;
  overdueCount: number;
};

type BillingData = {
  id: string;
  name: string;
  billing_plan: string;
  billing_amount: number;
  billing_status: string;
  last_payment_date: string | null;
  city: string | null;
  monthly_sales?: number; // We'd get this from real sales data
};

export const BillingOverview = () => {
  const [billingData, setbillingData] = useState<BillingData[]>([]);
  const [filteredData, setFilteredData] = useState<BillingData[]>([]);
  const [billingStats, setBillingStats] = useState<BillingStats>({
    total: 0,
    monthly: 0,
    percentage: 0,
    activeCount: 0,
    overdueCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [month, setMonth] = useState<Date>(new Date());
  const [cities, setCities] = useState<string[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingData();
  }, [month]);

  const fetchBillingData = async () => {
    try {
      // In a real app, this would fetch actual billing data with sales figures
      const { data, error } = await supabase
        .from('establishments')
        .select('*')
        .order('name');

      if (error) throw error;

      // Generate mock sales data for demonstration
      const mockData = data.map((item: any) => ({
        ...item,
        monthly_sales: Math.floor(Math.random() * 10000) + 1000 // Random sales between 1000-11000
      }));

      setbillingData(mockData);
      setFilteredData(mockData);
      
      // Calculate billing stats
      calculateStats(mockData);
      
      // Extract unique cities
      const uniqueCities = Array.from(new Set(data?.map((r: any) => r.city).filter(Boolean) as string[]));
      setCities(uniqueCities);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de faturamento.",
        variant: "destructive",
      });
    }
  };

  const calculateStats = (data: BillingData[]) => {
    const monthlyBilling = data.filter(item => item.billing_plan === 'monthly')
      .reduce((sum, item) => sum + Number(item.billing_amount), 0);
    
    const percentageBilling = data.filter(item => item.billing_plan === 'percentage')
      .reduce((sum, item) => {
        const sales = item.monthly_sales || 0;
        return sum + (sales * Number(item.billing_amount) / 100);
      }, 0);
    
    const totalBilling = monthlyBilling + percentageBilling;
    
    const activeCount = data.filter(item => item.billing_status === 'active').length;
    const overdueCount = data.filter(item => item.billing_status === 'overdue').length;
    
    setBillingStats({
      total: totalBilling,
      monthly: monthlyBilling,
      percentage: percentageBilling,
      activeCount,
      overdueCount
    });
  };

  useEffect(() => {
    // Apply all filters
    let result = billingData;

    if (statusFilter) {
      result = result.filter(item => item.billing_status === statusFilter);
    }

    if (cityFilter) {
      result = result.filter(item => item.city === cityFilter);
    }

    setFilteredData(result);
    calculateStats(result);
  }, [billingData, statusFilter, cityFilter]);

  const resetFilters = () => {
    setStatusFilter("");
    setCityFilter("");
  };

  // Prepare chart data
  const getChartData = () => {
    const monthlyCount = billingData.filter(item => item.billing_plan === 'monthly').length;
    const percentageCount = billingData.filter(item => item.billing_plan === 'percentage').length;
    
    return [
      { name: 'Planos', 'Mensalidade Fixa': monthlyCount, 'Porcentagem': percentageCount },
      { name: 'Receita (R$)', 'Mensalidade Fixa': billingStats.monthly, 'Porcentagem': billingStats.percentage }
    ];
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return <div className="text-center py-10">Carregando dados de faturamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billingStats.total)}</div>
            <p className="text-xs text-muted-foreground">mês de {formatMonthYear(month)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Mensalidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billingStats.monthly)}</div>
            <p className="text-xs text-muted-foreground">
              {((billingStats.monthly / billingStats.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Comissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billingStats.percentage)}</div>
            <p className="text-xs text-muted-foreground">
              {((billingStats.percentage / billingStats.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingStats.activeCount} Ativos</div>
            <p className="text-xs text-muted-foreground">
              {billingStats.overdueCount} em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <CardTitle>Distribuição de Receita</CardTitle>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatMonthYear(month)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={month}
                    onSelect={(date) => date && setMonth(date)}
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={2023}
                    toYear={2030}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value} />
              <Legend />
              <Bar dataKey="Mensalidade Fixa" fill="#8884d8" />
              <Bar dataKey="Porcentagem" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detalhamento por Restaurante</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="w-full md:w-1/3">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="overdue">Em atraso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-1/3">
                <Select 
                  value={cityFilter} 
                  onValueChange={setCityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as cidades</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-1/3">
                <Button variant="outline" onClick={resetFilters} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurante</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor/Taxa</TableHead>
                    <TableHead>Vendas do Mês</TableHead>
                    <TableHead>Cobrança</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => {
                    const billing = item.billing_plan === 'monthly' 
                      ? Number(item.billing_amount)
                      : (item.monthly_sales || 0) * Number(item.billing_amount) / 100;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.city || "-"}</TableCell>
                        <TableCell>
                          {item.billing_plan === 'monthly' ? 'Mensal' : 'Porcentagem'}
                        </TableCell>
                        <TableCell>
                          {item.billing_plan === 'monthly' 
                            ? formatCurrency(item.billing_amount)
                            : `${item.billing_amount}%`
                          }
                        </TableCell>
                        <TableCell>{formatCurrency(item.monthly_sales || 0)}</TableCell>
                        <TableCell>{formatCurrency(billing)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.billing_status === 'active' ? 'bg-green-100 text-green-800' :
                            item.billing_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.billing_status === 'active' ? 'Ativo' :
                            item.billing_status === 'pending' ? 'Pendente' :
                            'Em Atraso'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.last_payment_date 
                            ? formatDate(item.last_payment_date) 
                            : "-"
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
