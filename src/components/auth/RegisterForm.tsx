
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useState } from "react";

interface RegisterFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  handleRegister: (e: React.FormEvent) => Promise<void>;
}

export const RegisterForm = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  handleRegister
}: RegisterFormProps) => {
  const [name, setName] = useState("");
  
  const onSubmit = (e: React.FormEvent) => {
    // Store name in localStorage to be accessed during registration
    localStorage.setItem("registerName", name);
    handleRegister(e);
  };
  
  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="register-name">Nome</Label>
          <Input 
            id="register-name" 
            placeholder="Seu nome" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <Input 
            id="register-email" 
            type="email" 
            placeholder="seu@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">Senha</Label>
          <Input 
            id="register-password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
      </CardFooter>
    </form>
  );
};
