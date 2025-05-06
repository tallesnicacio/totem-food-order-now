
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não está configurada');
    }

    logStep('Iniciando função');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const { action, data } = await req.json();
    let result;

    logStep(`Ação requisitada: ${action}`);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Header de autorização ausente');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      throw new Error(`Erro de autenticação: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error('Usuário não autenticado ou email não disponível');
    }

    logStep('Usuário autenticado', { userId: user.id, email: user.email });

    switch (action) {
      case 'check_subscription': {
        // Verificar se o usuário tem uma assinatura ativa
        const { data: userProfileData } = await supabase
          .from('user_profiles')
          .select('establishment_id')
          .eq('id', user.id)
          .single();
          
        if (!userProfileData?.establishment_id) {
          throw new Error('Usuário não tem um estabelecimento associado');
        }
        
        const { data: establishmentData, error: establishmentError } = await supabase
          .from('establishments')
          .select('billing_plan, billing_status, billing_amount, last_payment_date')
          .eq('id', userProfileData.establishment_id)
          .single();
          
        if (establishmentError) {
          throw new Error(`Erro ao obter dados do estabelecimento: ${establishmentError.message}`);
        }
        
        result = {
          subscription: {
            plan: establishmentData.billing_plan,
            status: establishmentData.billing_status,
            amount: establishmentData.billing_amount,
            lastPaymentDate: establishmentData.last_payment_date,
          }
        };
        break;
      }
      
      case 'create_checkout': {
        // Verificar se o usuário já existe como cliente no Stripe
        const { planId, successUrl, cancelUrl } = data;
        if (!planId) throw new Error('ID do plano não fornecido');
        
        // Obter detalhes do plano
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();
          
        if (planError) throw new Error(`Plano não encontrado: ${planError.message}`);
        
        logStep('Detalhes do plano recuperados', planData);
        
        // Verificar se o usuário já é um cliente no Stripe
        let customerId;
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          logStep('Cliente existente encontrado', { customerId });
        } else {
          // Criar um novo cliente no Stripe
          const { data: userProfileData } = await supabase
            .from('user_profiles')
            .select('name, establishment_id')
            .eq('id', user.id)
            .single();
            
          const { data: establishmentData } = await supabase
            .from('establishments')
            .select('name')
            .eq('id', userProfileData?.establishment_id)
            .single();
            
          const newCustomer = await stripe.customers.create({
            email: user.email,
            name: userProfileData?.name || 'Cliente',
            description: `Cliente para ${establishmentData?.name || 'estabelecimento'}`,
            metadata: {
              user_id: user.id,
              establishment_id: userProfileData?.establishment_id
            }
          });
          
          customerId = newCustomer.id;
          logStep('Novo cliente criado', { customerId });
        }
        
        // Criar preço no Stripe (ou usar um existente)
        let priceId;
        const price = await stripe.prices.create({
          currency: 'brl',
          unit_amount: Math.round(parseFloat(planData.price) * 100), // Converter para centavos
          recurring: {
            interval: planData.billing_cycle === 'monthly' ? 'month' : 'year',
          },
          product_data: {
            name: planData.name,
            description: `Plano ${planData.name} - ${planData.max_products} produtos`,
            metadata: {
              plan_id: planData.id,
              plan_type: planData.type
            }
          }
        });
        
        priceId = price.id;
        logStep('Preço criado ou recuperado', { priceId });
        
        // Criar sessão de checkout
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: successUrl || `${req.headers.get('origin') || 'http://localhost:3000'}/subscription?success=true`,
          cancel_url: cancelUrl || `${req.headers.get('origin') || 'http://localhost:3000'}/subscription?canceled=true`,
          allow_promotion_codes: true,
          metadata: {
            user_id: user.id,
            plan_id: planData.id,
            establishment_id: (await supabase
              .from('user_profiles')
              .select('establishment_id')
              .eq('id', user.id)
              .single()).data?.establishment_id
          }
        });
        
        logStep('Sessão de checkout criada', { sessionId: session.id, url: session.url });
        
        result = { url: session.url };
        break;
      }
      
      case 'create_portal': {
        // Criar uma sessão de portal para o cliente gerenciar sua assinatura
        // Verificar se o cliente existe no Stripe
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        
        if (customers.data.length === 0) {
          throw new Error('Nenhum cliente encontrado no Stripe com este e-mail');
        }
        
        const customerId = customers.data[0].id;
        logStep('Cliente encontrado', { customerId });
        
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: data.returnUrl || `${req.headers.get('origin') || 'http://localhost:3000'}/subscription`,
        });
        
        logStep('Sessão do portal criada', { sessionId: portalSession.id, url: portalSession.url });
        
        result = { url: portalSession.url };
        break;
      }

      case 'update_subscription_status': {
        // Atualizar o status da assinatura manualmente (útil para testes)
        const { establishmentId, status, plan, amount } = data;
        
        if (!establishmentId) throw new Error('ID do estabelecimento não fornecido');
        
        const { data: establishmentData, error: establishmentError } = await supabase
          .from('establishments')
          .update({
            billing_status: status || 'active',
            billing_plan: plan || 'monthly',
            billing_amount: amount || 29.90,
            last_payment_date: new Date().toISOString()
          })
          .eq('id', establishmentId)
          .select()
          .single();
          
        if (establishmentError) {
          throw new Error(`Erro ao atualizar status da assinatura: ${establishmentError.message}`);
        }
        
        result = { updated: true, establishment: establishmentData };
        break;
      }
      
      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
