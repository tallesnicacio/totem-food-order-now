
import { supabase } from "@/integrations/supabase/client";
import { CartItem, OrderSummary } from "@/types";

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

// Add the missing functions that Kitchen.tsx is trying to import

// Function to get all orders with their items
export const getAllOrders = async (): Promise<OrderSummary[]> => {
  try {
    // Get all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      throw ordersError;
    }
    
    if (!orders || orders.length === 0) {
      return [];
    }
    
    // For each order, get its items
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price,
          notes,
          products:product_id (id, name, price, image, description, category_id)
        `)
        .eq('order_id', order.id);
      
      if (itemsError) {
        console.error(`Error fetching items for order ${order.id}:`, itemsError);
        throw itemsError;
      }
      
      // Map the items to the expected format
      const formattedItems = items ? items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        notes: item.notes,
        product: {
          id: item.products.id,
          name: item.products.name,
          price: item.products.price,
          image: item.products.image,
          description: item.products.description,
          categoryId: item.products.category_id
        }
      })) : [];
      
      // Return the order with its items
      return {
        id: order.id,
        dayOrderNumber: order.day_order_number,
        createdAt: order.created_at,
        status: order.status,
        total: order.total,
        paymentMethod: order.payment_method,
        tableId: order.table_id,
        customerName: order.customer_name,
        items: formattedItems
      };
    }));
    
    return ordersWithItems;
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    throw error;
  }
};

// Function to update an order status
export const updateOrderStatus = async (orderId: string, status: 'new' | 'preparing' | 'ready' | 'delivered'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    throw error;
  }
};

// Function to check if the register is open (has orders today)
export const checkRegisterOpen = async (): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there are any orders from today
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', today)
      .lt('created_at', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString())
      .limit(1);
    
    if (error) {
      console.error("Error checking register status:", error);
      throw error;
    }
    
    // If there are any orders from today, the register is open
    return data && data.length > 0;
  } catch (error) {
    console.error("Error in checkRegisterOpen:", error);
    throw error;
  }
};
