
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface BillingHeaderProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
  cities: string[];
  resetFilters: () => void;
}

export const BillingHeader = ({ 
  statusFilter, 
  setStatusFilter, 
  cityFilter, 
  setCityFilter, 
  cities, 
  resetFilters 
}: BillingHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>Detalhamento por Restaurante</CardTitle>
      </div>
      <div className="space-y-4 mt-4">
        <div className="flex flex-col md:flex-row gap-4">
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
      </div>
    </CardHeader>
  );
};
