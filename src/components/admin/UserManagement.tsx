
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatDateTime } from "@/utils/format";
import { UserForm } from "./UserForm";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  establishment_id: string | null;
  establishment_name?: string;
};

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [establishments, setEstablishments] = useState<{id: string; name: string}[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      const { data, error } = await supabase
        .from('establishments')
        .select('id, name')
        .order('name');

      if (error) throw error;

      setEstablishments(data || []);
    } catch (error: any) {
      console.error("Error fetching establishments:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os estabelecimentos.",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");
      
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          establishments(name)
        `);

      if (userProfilesError) {
        console.error("Error details:", userProfilesError);
        throw userProfilesError;
      }
      
      console.log("Fetched user data:", userProfiles);

      const mappedUsers = userProfiles.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        establishment_id: user.establishment_id,
        establishment_name: user.establishments?.name || null
      }));

      setUsers(mappedUsers);
      setFilteredUsers(mappedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários: " + (error.message || error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply all filters
    let result = users;

    if (searchTerm) {
      result = result.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter]);

  const handleSaveUser = async (userData: any) => {
    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('user_profiles')
          .update({
            name: userData.name,
            role: userData.role,
            establishment_id: userData.establishment_id || null
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso.",
        });
      } else {
        // In a real app, you would need to create a user in auth and then add to user_profiles
        toast({
          title: "Funcionalidade não implementada",
          description: "A criação de usuários requer integração com o sistema de autenticação.",
        });
      }

      setIsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário: " + (error.message || error),
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      // In a real app, you would delete the user from auth as well
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(prev => prev.filter(user => user.id !== id));
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário: " + (error.message || error),
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
  };

  if (loading) {
    return <div className="text-center py-10">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gerenciar Usuários</CardTitle>
            <Button onClick={handleNewUser}>
              <Plus className="mr-2 h-4 w-4" /> Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="col-span-1 md:col-span-2">
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  className="flex-1 p-2 border rounded"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">Todos os perfis</option>
                  <option value="master">Master</option>
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="kitchen">Cozinha</option>
                </select>
                
                <Button variant="outline" onClick={resetFilters}>
                  Limpar
                </Button>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Nenhum usuário encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Restaurante</TableHead>
                      <TableHead>Data Cadastro</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.role === 'master' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'manager' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.role === 'master' ? 'Master' :
                            user.role === 'admin' ? 'Administrador' :
                            user.role === 'manager' ? 'Gerente' :
                            'Cozinha'}
                          </span>
                        </TableCell>
                        <TableCell>{user.establishment_name || "-"}</TableCell>
                        <TableCell>{formatDateTime(user.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
          </DialogHeader>
          <UserForm 
            user={editingUser} 
            establishments={establishments}
            onSave={handleSaveUser} 
            onCancel={() => setIsDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
