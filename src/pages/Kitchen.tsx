
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getAllOrders, updateOrderStatus } from "@/services/orderService";
import { OrderSummary } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { Loader } from "lucide-react";

const Kitchen = () => {
  const [allOrders, setAllOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'preparing' | 'ready' | 'delivered'>('new');
  const { toast } = useToast();

  // Carregar todas as ordens independentemente do status
  const loadOrders = async () => {
    try {
      setLoading(true);
      const fetchedOrders = await getAllOrders();
      setAllOrders(fetchedOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos: " + (error.message || error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    
    // Configurar polling para atualizar os pedidos a cada 30 segundos
    const intervalId = setInterval(loadOrders, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Filtrar ordens com base no status selecionado
  const filteredOrders = allOrders.filter(order => order.status === activeTab);
  
  // Contar ordens por status para as abas
  const orderCounts = {
    new: allOrders.filter(o => o.status === 'new').length,
    preparing: allOrders.filter(o => o.status === 'preparing').length,
    ready: allOrders.filter(o => o.status === 'ready').length,
    delivered: allOrders.filter(o => o.status === 'delivered').length
  };

  const handleUpdateStatus = async (orderId: string, newStatus: 'new' | 'preparing' | 'ready' | 'delivered') => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      toast({
        title: "Status atualizado",
        description: `Pedido atualizado para ${newStatus}`,
      });
      
      // Atualizar todas as ordens no estado local em vez de apenas remover
      setAllOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Novo';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  const getActionButtonText = (status: string) => {
    switch (status) {
      case 'new': return 'Iniciar preparo';
      case 'preparing': return 'Marcar como pronto';
      case 'ready': return 'Marcar como entregue';
      default: return 'Atualizar status';
    }
  };

  const renderOrderCard = (order: OrderSummary) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>
            Pedido #{order.dayOrderNumber || '?'}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {formatDateTime(order.createdAt)}
          </div>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {getStatusText(order.status)}
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
            {getActionButtonText(order.status)}
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const renderTabContent = (status: 'new' | 'preparing' | 'ready' | 'delivered') => {
    const statusOrders = allOrders.filter(o => o.status === status);
    
    if (loading && statusOrders.length === 0) {
      return <div className="flex justify-center items-center py-10">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando pedidos...</span>
      </div>;
    }
    
    if (statusOrders.length === 0) {
      return <div className="text-center py-10">
        Nenhum pedido {getStatusText(status).toLowerCase()} no momento.
      </div>;
    }
    
    return statusOrders.map(renderOrderCard);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Cozinha</h1>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="new">
            Novos ({orderCounts.new})
          </TabsTrigger>
          <TabsTrigger value="preparing">
            Em preparo ({orderCounts.preparing})
          </TabsTrigger>
          <TabsTrigger value="ready">
            Prontos ({orderCounts.ready})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Entregues ({orderCounts.delivered})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-4">
          {renderTabContent('new')}
        </TabsContent>
        
        <TabsContent value="preparing" className="mt-4">
          {renderTabContent('preparing')}
        </TabsContent>
        
        <TabsContent value="ready" className="mt-4">
          {renderTabContent('ready')}
        </TabsContent>
        
        <TabsContent value="delivered" className="mt-4">
          {renderTabContent('delivered')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Kitchen;
