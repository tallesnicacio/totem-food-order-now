
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency } from "@/utils/format";
import { CalendarIcon } from "lucide-react";
import { BillingData, BillingStats } from "./types";

interface BillingChartProps {
  billingData: BillingData[];
  billingStats: BillingStats;
  month: Date;
  setMonth: (date: Date) => void;
}

export const BillingChart = ({ billingData, billingStats, month, setMonth }: BillingChartProps) => {
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
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

  return (
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
  );
};
