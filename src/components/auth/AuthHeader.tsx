
import { ShoppingBag } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const AuthHeader = () => {
  return (
    <CardHeader className="space-y-1 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingBag className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">MenuTotem</h1>
      </div>
      <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
      <CardDescription>
        Faça login ou crie uma nova conta para continuar
      </CardDescription>
    </CardHeader>
  );
};
