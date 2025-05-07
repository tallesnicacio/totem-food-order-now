
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirects users based on authentication state
  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    }
  }, [navigate, user, loading]);

  return null; // Não renderiza nada, pois o redirecionamento acontecerá
};

export default Index;
