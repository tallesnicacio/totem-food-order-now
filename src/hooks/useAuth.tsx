
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { subscriptionService, SubscriptionInfo } from '@/services/subscriptionService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, name: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  loading: boolean;
  subscription: SubscriptionInfo | null;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Verificar sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      
      // Configurar listener para mudanças na autenticação
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          setUser(session?.user || null);
          
          if (session?.user) {
            await checkSubscription();
          }
        }
      );
      
      if (session?.user) {
        await checkSubscription();
      }
      
      setLoading(false);
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, []);
  
  const checkSubscription = async () => {
    try {
      const subscriptionData = await subscriptionService.checkSubscription();
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        await checkSubscription();
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo de volta!`,
        });
        
        navigate('/dashboard');
      }
      
      return { data: data.session, error: null };
    } catch (error: any) {
      let errorMessage = "Falha ao fazer login";
      
      if (error.message.includes("Invalid login")) {
        errorMessage = "Email ou senha incorretos";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login";
      }
      
      toast({
        title: "Erro de autenticação",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        
        toast({
          title: "Conta criada com sucesso",
          description: `Bem-vindo ao MenuTotem!`,
        });
        
        navigate('/dashboard');
      } else {
        toast({
          title: "Verificação de email",
          description: "Um link de confirmação foi enviado para o seu email",
        });
      }
      
      return { data: data.session, error: null };
    } catch (error: any) {
      let errorMessage = "Falha ao criar conta";
      
      if (error.message.includes("User already registered")) {
        errorMessage = "Este email já está cadastrado";
      } else if (error.message.includes("Password")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres";
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setSubscription(null);
    navigate('/auth');
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  const contextValue: AuthContextType = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
    subscription,
    checkSubscription,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
