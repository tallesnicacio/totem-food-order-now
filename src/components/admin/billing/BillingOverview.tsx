
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
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
        .select('id, name, billing_plan, billing_amount, billing_status, last_payment_date, city');

      if (error) throw error;

      // Fetch sales data for establishments that use percentage billing
      const billingDataWithSales = await Promise.all(
        data.map(async (item: any) => {
          let monthlySales = 0;
          
          if (item.billing_plan === 'percentage') {
            // Get the first and last day of the selected month
            const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
            const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
            
            // Fetch orders for this establishment within the date range
            const { data: orderData, error: orderError } = await supabase
              .from('orders')
              .select('total')
              .gte('created_at', firstDay.toISOString())
              .lte('created_at', lastDay.toISOString());
              
            if (!orderError && orderData) {
              monthlySales = orderData.reduce((sum: number, order: any) => sum + Number(order.total), 0);
            }
          }
          
          return {
            ...item,
            monthly_sales: monthlySales
          };
        })
      );

      setBillingData(billingDataWithSales);
      setFilteredData(billingDataWithSales);
      
      // Calculate billing stats
      calculateStats(billingDataWithSales);
      
      // Extract unique cities
      const uniqueCities = Array.from(new Set(data.map((r: any) => r.city).filter(Boolean) as string[]));
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
