
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { setMasterAdmin } from "@/utils/setMasterAdmin";
import { PageHeader } from "@/components/PageHeader";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SetMasterAdmin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSetMasterAdmin = async () => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);
      const result = await setMasterAdmin(email);
      
      toast({
        title: "Sucesso!",
        description: `${email} foi definido como Master Admin.`,
      });
      
      setSuccess(true);
      console.log("Resultado:", result);
    } catch (error) {
      console.error("Erro ao definir Master Admin:", error);
      toast({
        title: "Erro",
        description: "Não foi possível definir o Master Admin. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="Configurar Master Admin" 
        description="Defina um usuário como Master Admin do sistema"
        currentPage="Configurar Master Admin"
        icon={<Shield className="h-6 w-6 text-primary" />}
      />
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Definir Master Admin</CardTitle>
          <CardDescription>
            Insira o email do usuário que você deseja definir como Master Admin.
            Este usuário terá acesso completo ao sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleSetMasterAdmin}
              disabled={loading}
            >
              {loading ? "Processando..." : "Definir como Master Admin"}
            </Button>
            
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle className="text-green-800 font-medium">Sucesso!</AlertTitle>
                <AlertDescription className="text-green-700">
                  O usuário {email} agora é um Master Admin. Peça para ele fazer logout e login novamente para que as alterações tenham efeito.
                </AlertDescription>
              </Alert>
            )}
            
            <Alert variant="destructive" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-amber-800">Importante</AlertTitle>
              <AlertDescription className="text-amber-700">
                Esta é uma operação privilegiada. Apenas defina usuários de confiança como Master Admin.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
