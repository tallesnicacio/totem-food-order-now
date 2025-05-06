
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionInfo {
  plan: string;
  status: string;
  amount: number;
  lastPaymentDate: string | null;
  nextBillingDate?: string | null;
}

export const subscriptionService = {
  async checkSubscription(): Promise<SubscriptionInfo | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('establishment_id')
        .eq('id', session.user.id)
        .single();
        
      if (userError || !userData?.establishment_id) return null;
      
      const { data: establishmentData, error: establishmentError } = await supabase
        .from('establishments')
        .select('billing_plan, billing_status, billing_amount, last_payment_date')
        .eq('id', userData.establishment_id)
        .single();
        
      if (establishmentError || !establishmentData) return null;

      const lastPaymentDate = establishmentData.last_payment_date;
      
      // Calculate next billing date (30 days from last payment)
      let nextBillingDate = null;
      if (lastPaymentDate) {
        const date = new Date(lastPaymentDate);
        date.setMonth(date.getMonth() + 1);
        nextBillingDate = date.toISOString();
      }
      
      return {
        plan: establishmentData.billing_plan || 'free',
        status: establishmentData.billing_status || 'inactive',
        amount: Number(establishmentData.billing_amount) || 0,
        lastPaymentDate,
        nextBillingDate
      };
    } catch (err) {
      console.error('Error checking subscription:', err);
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
        console.error('Error creating checkout session:', error);
        return null;
      }

      return data?.url || null;
    } catch (err) {
      console.error('Error creating checkout session:', err);
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
        console.error('Error creating portal session:', error);
        return null;
      }

      return data?.url || null;
    } catch (err) {
      console.error('Error creating portal session:', err);
      return null;
    }
  }
};
