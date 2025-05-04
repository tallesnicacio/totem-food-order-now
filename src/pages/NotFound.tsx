
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-6">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Ops! Página não encontrada
        </p>
        <Button asChild>
          <a href="/">Voltar para Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
