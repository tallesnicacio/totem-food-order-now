
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export const BackToHomeButton = () => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Não mostrar na página inicial
    setShow(location.pathname !== "/");
  }, [location]);
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="icon"
        variant="secondary"
        className="rounded-full shadow-lg h-12 w-12"
        asChild
      >
        <Link to="/" title="Voltar para a página inicial">
          <Home className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
};
