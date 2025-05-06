
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SubscriptionPlan } from "@/pages/Admin";
import { formatCurrency } from "@/utils/format";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

interface PlansListProps {
  plans: SubscriptionPlan[];
  onEditPlan: (plan: SubscriptionPlan) => void;
  onDeletePlan: (id: string) => void;
}

export const PlansList = ({ plans, onEditPlan, onDeletePlan }: PlansListProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Cobrança</TableHead>
            <TableHead>Popular</TableHead>
            <TableHead>Max Produtos</TableHead>
            <TableHead>Max Usuários</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell className="capitalize">{plan.type}</TableCell>
              <TableCell>{formatCurrency(plan.price)}</TableCell>
              <TableCell className="capitalize">
                {plan.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
              </TableCell>
              <TableCell>
                {plan.isPopular ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-300" />
                )}
              </TableCell>
              <TableCell>{plan.features.maxProducts}</TableCell>
              <TableCell>{plan.features.maxUsers}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onEditPlan(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="text-destructive"
                    onClick={() => onDeletePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
