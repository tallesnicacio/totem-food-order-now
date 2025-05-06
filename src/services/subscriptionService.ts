
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionInfo {
  plan: string;
  status: string;
  amount: number;
  lastPaymentDate: string | null;
}

export const subscriptionService = {
  async checkSubscription(): Promise<SubscriptionInfo | null> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: { action: 'check_subscription' }
      });

      if (error) {
        console.error('Erro ao verificar assinatura:', error);
        return null;
      }

      return data?.subscription || null;
    } catch (err) {
      console.error('Erro ao verificar assinatura:', err);
      return null;
    }
  },

  async createCheckoutSession(planId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: {
          action: 'create_checkout',
          data: {
            planId,
            successUrl: `${window.location.origin}/subscription?success=true`,
            cancelUrl: `${window.location.origin}/subscription?canceled=true`
          }
        }
      });

      if (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        return null;
      }

      return data?.url || null;
    } catch (err) {
      console.error('Erro ao criar sessão de checkout:', err);
      return null;
    }
  },

  async createPortalSession(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: {
          action: 'create_portal',
          data: {
            returnUrl: `${window.location.origin}/subscription`
          }
        }
      });

      if (error) {
        console.error('Erro ao criar sessão do portal:', error);
        return null;
      }

      return data?.url || null;
    } catch (err) {
      console.error('Erro ao criar sessão do portal:', err);
      return null;
    }
  },

  // Função para atualizar manualmente o status da assinatura (útil para testes)
  async updateSubscriptionStatus(establishmentId: string, status: string, plan: string, amount: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-subscription', {
        body: {
          action: 'update_subscription_status',
          data: { establishmentId, status, plan, amount }
        }
      });

      if (error) {
        console.error('Erro ao atualizar status da assinatura:', error);
        return false;
      }

      return data?.updated || false;
    } catch (err) {
      console.error('Erro ao atualizar status da assinatura:', err);
      return false;
    }
  }
};
