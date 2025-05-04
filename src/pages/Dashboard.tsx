
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCategories, useProducts, useRestaurant } from "@/hooks/useData";
import { getOrdersByStatus } from "@/services/orderService";
import { OrderSummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChefHat, ClipboardList, LayoutDashboard, Settings, Utensils } from "lucide-react";
import { formatCurrency } from "@/utils/format";

const Dashboard = () => {
  const { restaurant, loading: loadingRestaurant } = useRestaurant();
  const { categories, loading: loadingCategories } = useCategories();
  const { products, loading: loadingProducts } = useProducts();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const allOrders = await getOrdersByStatus();
        setOrders(allOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os pedidos",
          variant: "destructive",
        });
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [toast]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const newOrdersCount = orders.filter(order => order.status === 'new').length;
  const preparingOrdersCount = orders.filter(order => order.status === 'preparing').length;
  const deliveredOrdersCount = orders.filter(order => order.status === 'delivered').length;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        {loadingRestaurant ? (
          <Skeleton className="h-8 w-40" />
        ) : (
          <span className="text-lg font-medium">{restaurant?.name}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Pedidos Novos" 
          value={loadingOrders ? "..." : newOrdersCount.toString()} 
          icon={<ClipboardList className="h-8 w-8 text-blue-500" />}
          loading={loadingOrders}
        />
        <StatCard 
          title="Em Preparo" 
          value={loadingOrders ? "..." : preparingOrdersCount.toString()} 
          icon={<ChefHat className="h-8 w-8 text-yellow-500" />}
          loading={loadingOrders}
        />
        <StatCard 
          title="Pedidos Entregues" 
          value={loadingOrders ? "..." : deliveredOrdersCount.toString()} 
          icon={<Utensils className="h-8 w-8 text-green-500" />}
          loading={loadingOrders}
        />
        <StatCard 
          title="Faturamento" 
          value={loadingOrders ? "..." : formatCurrency(totalRevenue)} 
          icon={<LayoutDashboard className="h-8 w-8 text-primary" />}
          loading={loadingOrders}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Categorias</span>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
                {loadingCategories ? <Skeleton className="h-4 w-8" /> : categories.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCategories ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
            ) : (
              <ul className="space-y-2">
                {categories.slice(0, 5).map(category => (
                  <li key={category.id} className="flex items-center justify-between text-sm">
                    <span>{category.name}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded-md">
                      {products.filter(p => p.categoryId === category.id).length} produtos
                    </span>
                  </li>
                ))}
                {categories.length > 5 && (
                  <li className="text-xs text-muted-foreground text-center mt-2">
                    + {categories.length - 5} outras categorias
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Produtos</span>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
                {loadingProducts ? <Skeleton className="h-4 w-8" /> : products.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProducts ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
            ) : (
              <ul className="space-y-2">
                {products.slice(0, 5).map(product => (
                  <li key={product.id} className="text-sm flex justify-between">
                    <span>{product.name}</span>
                    <span className="font-medium">{formatCurrency(product.price)}</span>
                  </li>
                ))}
                {products.length > 5 && (
                  <li className="text-xs text-muted-foreground text-center mt-2">
                    + {products.length - 5} outros produtos
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Últimos Pedidos</span>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
                {loadingOrders ? <Skeleton className="h-4 w-8" /> : orders.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pedido realizado.</p>
            ) : (
              <ul className="space-y-2">
                {orders.slice(0, 5).map(order => (
                  <li key={order.id} className="text-sm flex justify-between">
                    <div>
                      <span className="font-medium">#{order.id.slice(0, 8)}</span>
                      <span className="text-xs ml-2 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-medium">{formatCurrency(order.total)}</span>
                  </li>
                ))}
                {orders.length > 5 && (
                  <li className="text-xs text-muted-foreground text-center mt-2">
                    + {orders.length - 5} outros pedidos
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mt-8">
        <Link to="/kitchen" className="flex-1">
          <Card className="h-24 flex items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center">
              <ChefHat className="h-6 w-6 mb-2" />
              <span className="font-medium">Área da Cozinha</span>
            </div>
          </Card>
        </Link>
        <Link to="/settings" className="flex-1">
          <Card className="h-24 flex items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center">
              <Settings className="h-6 w-6 mb-2" />
              <span className="font-medium">Configurações</span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

// Stat card component for dashboard
const StatCard = ({ 
  title, 
  value, 
  icon, 
  loading = false 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  loading?: boolean;
}) => (
  <Card>
    <CardContent className="flex items-center justify-between p-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {loading ? (
          <Skeleton className="h-8 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </div>
      {icon}
    </CardContent>
  </Card>
);

export default Dashboard;
