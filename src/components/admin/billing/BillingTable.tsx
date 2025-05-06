
import { CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/utils/format";
import { BillingData } from "./types";

interface BillingTableProps {
  filteredData: BillingData[];
}

export const BillingTable = ({ filteredData }: BillingTableProps) => {
  return (
    <CardContent>
      <div className="space-y-4">
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
  );
};
