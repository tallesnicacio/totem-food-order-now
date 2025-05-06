
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { BillingData, BillingStats } from "./types";
import { BillingHeader } from "./BillingHeader";
import { BillingCards } from "./BillingCards";
import { BillingChart } from "./BillingChart";
import { BillingTable } from "./BillingTable";

export const BillingOverview = () => {
  const [billingData, setBillingData] = useState<BillingData[]>([]);
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
      setLoading(true);
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

      setBillingData(mockData);
      setFilteredData(mockData);
      
      // Calculate billing stats
      calculateStats(mockData);
      
      // Extract unique cities
      const uniqueCities = Array.from(new Set(data?.map((r: any) => r.city).filter(Boolean) as string[]));
      setCities(uniqueCities);
      
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de faturamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-2">Carregando dados de faturamento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BillingCards stats={billingStats} month={month} />
      
      <BillingChart billingData={billingData} billingStats={billingStats} month={month} setMonth={setMonth} />
      
      <Card>
        <BillingHeader 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
          cities={cities}
          resetFilters={resetFilters}
        />
        
        <BillingTable filteredData={filteredData} />
      </Card>
    </div>
  );
};
