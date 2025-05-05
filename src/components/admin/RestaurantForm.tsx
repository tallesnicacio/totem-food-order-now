
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RestaurantFormProps {
  restaurant: any | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const RestaurantForm = ({ restaurant, onSave, onCancel }: RestaurantFormProps) => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    active: true,
    in_community_qr: false,
    billing_plan: "monthly",
    billing_amount: 29.00,
    billing_status: "active"
  });

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || "",
        address: restaurant.address || "",
        city: restaurant.city || "",
        active: restaurant.active !== undefined ? restaurant.active : true,
        in_community_qr: restaurant.in_community_qr || false,
        billing_plan: restaurant.billing_plan || "monthly",
        billing_amount: restaurant.billing_amount || 29.00,
        billing_status: restaurant.billing_status || "active"
      });
    }
  }, [restaurant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (field: string, value: boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setForm(prev => ({ ...prev, billing_amount: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Restaurante</Label>
        <Input 
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="address">Endereço</Label>
        <Input 
          id="address"
          name="address"
          value={form.address}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="city">Cidade</Label>
        <Input 
          id="city"
          name="city"
          value={form.city}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="active"
          checked={form.active}
          onCheckedChange={(checked) => handleSwitchChange("active", checked)}
        />
        <Label htmlFor="active">Ativo</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="in_community_qr"
          checked={form.in_community_qr}
          onCheckedChange={(checked) => handleSwitchChange("in_community_qr", checked)}
        />
        <Label htmlFor="in_community_qr">Participar de QR Code Comunitário</Label>
      </div>
      
      <div>
        <Label htmlFor="billing_plan">Plano de Cobrança</Label>
        <Select 
          value={form.billing_plan} 
          onValueChange={(value) => handleSelectChange("billing_plan", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensalidade Fixa</SelectItem>
            <SelectItem value="percentage">Porcentagem de Vendas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="billing_amount">
          {form.billing_plan === "monthly" ? "Valor da Mensalidade (R$)" : "Porcentagem (%)"}
        </Label>
        <Input 
          id="billing_amount"
          type="number"
          step={form.billing_plan === "monthly" ? "0.01" : "0.1"}
          min="0"
          value={form.billing_amount}
          onChange={handleAmountChange}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="billing_status">Status de Cobrança</Label>
        <Select 
          value={form.billing_status} 
          onValueChange={(value) => handleSelectChange("billing_status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="overdue">Em atraso</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar
        </Button>
      </div>
    </form>
  );
};
