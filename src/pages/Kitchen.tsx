import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getOrdersByStatus, updateOrderStatus } from "@/services/orderService";
import { OrderSummary } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDateTime } from "@/utils/format";

const Kitchen = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'preparing' | 'ready' | 'delivered'>('new');
  const { toast } = useToast();

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      const fetchedOrders = await getOrdersByStatus(activeTab);
      setOrders(fetchedOrders);
      setLoading(false);
    };

    loadOrders();
    
    // Set up polling to refresh orders every 30 seconds
    const intervalId = setInterval(loadOrders, 30000);
    return () => clearInterval(intervalId);
  }, [activeTab]);

  const handleUpdateStatus = async (orderId: string, newStatus: 'new' | 'preparing' | 'ready' | 'delivered') => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      toast({
        title: "Status atualizado",
        description: `Pedido ${orderId.slice(0, 8)} atualizado para ${newStatus}`,
      });
      
      // Update the local state to remove the order from the current view
      setOrders(orders.filter(order => order.id !== orderId));
    }
  };

  const getNextStatus = (currentStatus: string): 'preparing' | 'ready' | 'delivered' => {
    switch (currentStatus) {
      case 'new': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'delivered';
      default: return 'delivered';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-500';
      case 'preparing': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const renderOrderCard = (order: OrderSummary) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Pedido #{order.id.slice(0, 8)}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {formatDateTime(order.createdAt)}
          </div>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {order.status === 'new' ? 'Novo' : 
           order.status === 'preparing' ? 'Preparando' : 
           order.status === 'ready' ? 'Pronto' : 'Entregue'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {order.tableId && (
            <div className="text-sm font-medium">Mesa: {order.tableId}</div>
          )}
          {order.customerName && (
            <div className="text-sm font-medium">Cliente: {order.customerName}</div>
          )}
          <div className="mt-2 border-t pt-2">
            <h4 className="font-medium mb-2">Itens:</h4>
            <ul className="space-y-1">
              {order.items.map((item, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{item.quantity}x</span> {item.product.name}
                  {item.notes && (
                    <div className="text-xs text-muted-foreground ml-5">
                      Obs: {item.notes}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="font-medium">
          Total: {formatCurrency(order.total)}
        </div>
        {order.status !== 'delivered' && (
          <Button 
            onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status))}
          >
            {order.status === 'new' ? 'Iniciar preparo' : 
             order.status === 'preparing' ? 'Marcar como pronto' : 'Marcar como entregue'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Cozinha</h1>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="inline-flex min-w-full border-b overflow-x-auto">
          <TabsTrigger value="new">Novos ({orders.filter(o => o.status === 'new').length})</TabsTrigger>
          <TabsTrigger value="preparing">Em preparo ({orders.filter(o => o.status === 'preparing').length})</TabsTrigger>
          <TabsTrigger value="ready">Prontos ({orders.filter(o => o.status === 'ready').length})</TabsTrigger>
          <TabsTrigger value="delivered">Entregues ({orders.filter(o => o.status === 'delivered').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-4">
          {loading ? (
            <div className="text-center py-10">Carregando pedidos...</div>
          ) : orders.filter(o => o.status === 'new').length === 0 ? (
            <div className="text-center py-10">Nenhum pedido novo no momento.</div>
          ) : (
            orders.filter(o => o.status === 'new').map(renderOrderCard)
          )}
        </TabsContent>
        
        <TabsContent value="preparing" className="mt-4">
          {loading ? (
            <div className="text-center py-10">Carregando pedidos...</div>
          ) : orders.filter(o => o.status === 'preparing').length === 0 ? (
            <div className="text-center py-10">Nenhum pedido em preparo no momento.</div>
          ) : (
            orders.filter(o => o.status === 'preparing').map(renderOrderCard)
          )}
        </TabsContent>
        
        <TabsContent value="ready" className="mt-4">
          {loading ? (
            <div className="text-center py-10">Carregando pedidos...</div>
          ) : orders.filter(o => o.status === 'ready').length === 0 ? (
            <div className="text-center py-10">Nenhum pedido pronto no momento.</div>
          ) : (
            orders.filter(o => o.status === 'ready').map(renderOrderCard)
          )}
        </TabsContent>
        
        <TabsContent value="delivered" className="mt-4">
          {loading ? (
            <div className="text-center py-10">Carregando pedidos...</div>
          ) : orders.filter(o => o.status === 'delivered').length === 0 ? (
            <div className="text-center py-10">Nenhum pedido entregue recentemente.</div>
          ) : (
            orders.filter(o => o.status === 'delivered').map(renderOrderCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Kitchen;
