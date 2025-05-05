
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QRCodeFormProps {
  qrCode: any | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const QRCodeForm = ({ qrCode, onSave, onCancel }: QRCodeFormProps) => {
  const [form, setForm] = useState({
    name: "",
    location: "",
    city: ""
  });

  useEffect(() => {
    if (qrCode) {
      setForm({
        name: qrCode.name || "",
        location: qrCode.location || "",
        city: qrCode.city || ""
      });
    }
  }, [qrCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do QR Code Comunitário</Label>
        <Input 
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Exemplo: Praça da Alimentação Centro"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="location">Localização</Label>
        <Input 
          id="location"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Exemplo: Av. Paulista, 1000"
        />
      </div>
      
      <div>
        <Label htmlFor="city">Cidade</Label>
        <Input 
          id="city"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Exemplo: São Paulo"
        />
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
