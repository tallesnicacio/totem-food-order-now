
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request body
    const { action, data } = await req.json();

    let result;
    
    switch (action) {
      case 'get_plans':
        // Get all subscription plans using RPC function
        const { data: plans, error: getError } = await supabase
          .rpc('get_subscription_plans');
          
        if (getError) throw getError;
        result = plans;
        break;
        
      case 'create_plan':
        // Create a new subscription plan using RPC function
        const { data: newPlan, error: createError } = await supabase
          .rpc('insert_subscription_plan', { plan_data: data });
          
        if (createError) throw createError;
        result = newPlan;
        break;
        
      case 'update_plan':
        // Update an existing subscription plan using RPC function
        const { id, ...updateData } = data;
        const { data: updatedPlan, error: updateError } = await supabase
          .rpc('update_subscription_plan', {
            plan_id: id,
            plan_data: updateData
          });
          
        if (updateError) throw updateError;
        result = updatedPlan;
        break;
        
      case 'delete_plan':
        // Delete a subscription plan using RPC function
        const { data: deleteResult, error: deleteError } = await supabase
          .rpc('delete_subscription_plan', { plan_id: data.id });
          
        if (deleteError) throw deleteError;
        result = { success: true };
        break;
        
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
