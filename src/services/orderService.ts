
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types";

export const createOrder = async (
  items: CartItem[],
  total: number, 
  paymentMethod: string, 
  customerName?: string,
  tableId?: string
) => {
  try {
    // Get the next sequential order number for the day
    const { data: lastOrderData, error: lastOrderError } = await supabase
      .from('orders')
      .select('day_order_number')
      .order('day_order_number', { ascending: false })
      .limit(1);
    
    if (lastOrderError) {
      console.error("Error getting last order number:", lastOrderError);
      throw lastOrderError;
    }
    
    // Calculate next order number (start from 1 if no orders exist)
    const nextOrderNumber = lastOrderData && lastOrderData.length > 0 && lastOrderData[0].day_order_number 
      ? lastOrderData[0].day_order_number + 1 
      : 1;
    
    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        total,
        payment_method: paymentMethod,
        customer_name: customerName,
        table_id: tableId,
        day_order_number: nextOrderNumber,
        status: 'new'
      })
      .select()
      .single();
      
    if (orderError) {
      console.error("Error creating order:", orderError);
      throw orderError;
    }
    
    // Insert all order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      notes: item.notes
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw itemsError;
    }
    
    return order;
  } catch (error) {
    console.error("Error in createOrder:", error);
    throw error;
  }
};

// Function to reset order numbering (used when opening the register)
export const resetOrderNumbering = async () => {
  try {
    // No direct way to reset numbering other than next order will start from 1
    // We'll clear any existing orders for today to ensure a fresh start
    const today = new Date().toISOString().split('T')[0];
    
    // First, get all order IDs from today to delete their items
    const { data: todaysOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', today)
      .lt('created_at', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString());
    
    if (ordersError) {
      console.error("Error fetching today's orders:", ordersError);
      throw ordersError;
    }
    
    if (todaysOrders && todaysOrders.length > 0) {
      // Delete all order items for today's orders
      const orderIds = todaysOrders.map(order => order.id);
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds);
      
      if (itemsError) {
        console.error("Error deleting order items:", itemsError);
        throw itemsError;
      }
      
      // Delete all orders for today
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .gte('created_at', today)
        .lt('created_at', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString());
      
      if (deleteError) {
        console.error("Error deleting orders:", deleteError);
        throw deleteError;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error resetting order numbering:", error);
    throw error;
  }
};
