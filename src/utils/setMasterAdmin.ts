
import { supabase } from "@/integrations/supabase/client";

export const setMasterAdmin = async (email: string) => {
  try {
    // Call the Edge Function to set the user as master admin
    const { data, error } = await supabase.functions.invoke("set_master_user", {
      body: { email },
    });
    
    if (error) {
      console.error("Error setting master admin:", error);
      throw new Error(error.message || "Failed to set master admin");
    }
    
    return data;
  } catch (error) {
    console.error("Error invoking edge function:", error);
    throw error;
  }
};
