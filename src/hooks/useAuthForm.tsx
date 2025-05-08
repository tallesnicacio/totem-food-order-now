
import { useState, FormEvent } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export const useAuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (!error) {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password, 
    setPassword,
    loading,
    handleLogin
  };
};
