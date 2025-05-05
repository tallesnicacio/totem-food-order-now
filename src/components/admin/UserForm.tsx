
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Establishment {
  id: string;
  name: string;
}

interface UserFormProps {
  user: any | null;
  establishments: Establishment[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const UserForm = ({ user, establishments, onSave, onCancel }: UserFormProps) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "manager",
    establishment_id: ""
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "manager",
        establishment_id: user.establishment_id || ""
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const isNewUser = !user;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input 
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          disabled={!isNewUser}
        />
        {!isNewUser && (
          <p className="text-xs text-muted-foreground mt-1">
            O email não pode ser alterado após a criação do usuário.
          </p>
        )}
      </div>
      
      {isNewUser && (
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input 
            id="password"
            name="password"
            type="password"
            placeholder="Senha temporária para o usuário"
          />
        </div>
      )}
      
      <div>
        <Label htmlFor="role">Perfil</Label>
        <Select 
          value={form.role} 
          onValueChange={(value) => handleSelectChange("role", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="master">Master</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="manager">Gerente</SelectItem>
            <SelectItem value="kitchen">Cozinha</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="establishment_id">Restaurante</Label>
        <Select 
          value={form.establishment_id || ""} 
          onValueChange={(value) => handleSelectChange("establishment_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o restaurante" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sem vínculo</SelectItem>
            {establishments.map(establishment => (
              <SelectItem key={establishment.id} value={establishment.id}>
                {establishment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Usuários com perfil Master não precisam estar vinculados a um restaurante específico.
        </p>
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
