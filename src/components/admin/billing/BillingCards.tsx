
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import { BillingStats } from "./types";

interface BillingCardsProps {
  stats: BillingStats;
  month: Date;
}

export const BillingCards = ({ stats, month }: BillingCardsProps) => {
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Faturamento Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
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
          <div className="text-2xl font-bold">{formatCurrency(stats.monthly)}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.monthly / stats.total) * 100).toFixed(1)}% do total
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
          <div className="text-2xl font-bold">{formatCurrency(stats.percentage)}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.percentage / stats.total) * 100).toFixed(1)}% do total
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
          <div className="text-2xl font-bold">{stats.activeCount} Ativos</div>
          <p className="text-xs text-muted-foreground">
            {stats.overdueCount} em atraso
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
