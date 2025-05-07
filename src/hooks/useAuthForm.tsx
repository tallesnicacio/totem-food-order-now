
import { useState, FormEvent } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export const useAuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
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

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Retrieve name and role from localStorage (set in RegisterForm component)
      const registerName = localStorage.getItem("registerName") || name;
      const registerRole = localStorage.getItem("registerRole") || role;
      
      const { error } = await signUp(email, password, registerName, registerRole);
      
      if (!error) {
        navigate("/dashboard");
      }
      
      // Clear the stored values
      localStorage.removeItem("registerName");
      localStorage.removeItem("registerRole");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password, 
    setPassword,
    name,
    setName,
    role,
    setRole,
    loading,
    handleLogin,
    handleRegister
  };
};
