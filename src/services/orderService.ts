
import { supabase } from "@/integrations/supabase/client";
import { CartItem, OrderSummary } from "@/types";
import { mapOrderFromDB } from "@/types/supabase";
import { toast } from "@/components/ui/use-toast";

export async function createOrder(
  items: CartItem[], 
  total: number, 
  paymentMethod: string, 
  customerName?: string, 
  tableId?: string
): Promise<OrderSummary | null> {
  try {
    // Get the next sequential number for today's orders
    const { data: dailyInventoryData, error: dailyInventoryError } = await supabase
      .from('restaurant')
      .select('establishment_id')
      .limit(1)
      .single();
    
    if (dailyInventoryError) {
      console.error("Error fetching restaurant data:", dailyInventoryError);
      throw dailyInventoryError;
    }
    
    // Get current day order count
    const today = new Date().toISOString().split('T')[0];
    const { data: orderCountData, error: orderCountError } = await supabase
      .from('orders')
      .select('day_order_number')
      .gte('created_at', today)
      .lt('created_at', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString())
      .order('day_order_number', { ascending: false })
      .limit(1);
    
    if (orderCountError) {
      console.error("Error fetching order count:", orderCountError);
      throw orderCountError;
    }
    
    const nextOrderNumber = orderCountData && orderCountData.length > 0 ? 
      (orderCountData[0].day_order_number || 0) + 1 : 1;
    
    // 1. Create the order with the sequential number
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        table_id: tableId,
        payment_method: paymentMethod,
        total: total,
        status: 'new',
        day_order_number: nextOrderNumber
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      product_id: item.product.id,
      quantity: item.quantity,
      notes: item.notes,
      price: item.product.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Return the created order
    return {
      id: orderData.id,
      items: items,
      total: Number(orderData.total),
      tableId: orderData.table_id || undefined,
      customerName: orderData.customer_name || undefined,
      status: orderData.status as 'new' | 'preparing' | 'ready' | 'delivered',
      dayOrderNumber: orderData.day_order_number,
      createdAt: new Date(orderData.created_at),
      updatedAt: new Date(orderData.updated_at)
    };

  } catch (error) {
    console.error("Error creating order:", error);
    toast({
      title: "Erro",
      description: "Não foi possível criar o pedido",
      variant: "destructive",
    });
    return null;
  }
}

// Function to get all orders regardless of status
export async function getAllOrders(): Promise<OrderSummary[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(*))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(order => {
      const orderSummary = mapOrderFromDB(order);
      
      // Map order items with products
      orderSummary.items = order.order_items.map((item: any) => ({
        product: {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          price: Number(item.products.price),
          image: item.products.image,
          categoryId: item.products.category_id,
          outOfStock: item.products.out_of_stock,
          available: item.products.available
        },
        quantity: item.quantity,
        notes: item.notes
      }));

      return orderSummary;
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar os pedidos",
      variant: "destructive",
    });
    return [];
  }
}

export async function getOrdersByStatus(status?: string): Promise<OrderSummary[]> {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(*))
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(order => {
      const orderSummary = mapOrderFromDB(order);
      
      // Map order items with products
      orderSummary.items = order.order_items.map((item: any) => ({
        product: {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          price: Number(item.products.price),
          image: item.products.image,
          categoryId: item.products.category_id,
          outOfStock: item.products.out_of_stock,
          available: item.products.available
        },
        quantity: item.quantity,
        notes: item.notes
      }));

      return orderSummary;
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar os pedidos",
      variant: "destructive",
    });
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: 'new' | 'preparing' | 'ready' | 'delivered'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar o status do pedido",
      variant: "destructive",
    });
    return false;
  }
}

// Function to reset order numbering when register is opened
export async function resetOrderNumbering(): Promise<boolean> {
  try {
    // No direct reset needed - numbers will start from 1 automatically 
    // when the first order is created after the register is opened
    return true;
  } catch (error) {
    console.error("Error resetting order numbering:", error);
    return false;
  }
}
