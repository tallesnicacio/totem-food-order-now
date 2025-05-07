
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { subscriptionService, SubscriptionInfo } from '@/services/subscriptionService';
import { useNavigate } from 'react-router-dom';

export type UserRole = "admin" | "manager" | "staff" | "customer" | "master";

interface UserWithRole extends User {
  role?: UserRole;
}

interface AuthContextType {
  session: Session | null;
  user: UserWithRole | null;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  loading: boolean;
  subscription: SubscriptionInfo | null;
  checkSubscription: () => Promise<void>;
  userRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Verificar sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        const userWithRole = { 
          ...session.user, 
          role: session.user.user_metadata?.role as UserRole || "customer" 
        };
        setUser(userWithRole);
        setUserRole(userWithRole.role);
        await checkSubscription();
      } else {
        setUser(null);
        setUserRole(null);
      }
      
      // Configurar listener para mudanças na autenticação
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          
          if (session?.user) {
            const userWithRole = { 
              ...session.user, 
              role: session.user.user_metadata?.role as UserRole || "customer" 
            };
            setUser(userWithRole);
            setUserRole(userWithRole.role);
            await checkSubscription();
          } else {
            setUser(null);
            setUserRole(null);
            setSubscription(null);
          }
        }
      );
      
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
        const userWithRole = { 
          ...data.session.user, 
          role: data.session.user.user_metadata?.role as UserRole || "customer" 
        };
        setUser(userWithRole);
        setUserRole(userWithRole.role);
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

  const signUp = async (email: string, password: string, name: string, role: string = "staff") => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        const userWithRole = { 
          ...data.session.user, 
          role: role as UserRole || "customer" 
        };
        setUser(userWithRole);
        setUserRole(userWithRole.role);
        
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
    setUserRole(null);
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
    userRole,
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
