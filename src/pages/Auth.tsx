
import { Card } from "@/components/ui/card";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthForm } from "@/hooks/useAuthForm";
import { CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Auth = () => {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    loading, 
    handleLogin 
  } = useAuthForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <AuthHeader />
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acesso restrito</AlertTitle>
            <AlertDescription>
              O cadastro de novos usuários é gerenciado exclusivamente pelo administrador master do sistema.
            </AlertDescription>
          </Alert>
          
          <LoginForm 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            handleLogin={handleLogin}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
