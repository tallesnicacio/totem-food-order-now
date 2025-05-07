
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "./LandingPage";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [navigate, user, loading]);

  // If user is loading, show nothing
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  // If user is not authenticated, show landing page
  return <LandingPage />;
};

export default Index;
