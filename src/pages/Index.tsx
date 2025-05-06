
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  // Redireciona para o dashboard automaticamente
  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  return null; // Não renderiza nada, pois o redirecionamento acontecerá
};

export default Index;
