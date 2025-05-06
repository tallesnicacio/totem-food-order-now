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
    // 1. Create the order first
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        table_id: tableId,
        payment_method: paymentMethod,
        total: total,
        status: 'new'
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

// Nova função para carregar todos os pedidos independentemente do status
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
          categoryId: item.products.category_id
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
          categoryId: item.products.category_id
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
