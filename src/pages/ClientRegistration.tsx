import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AddClientDialog from "@/components/AddClientDialog";
import ClientListTable from "@/components/ClientListTable";
import { useAppStore } from "@/store/useAppStore";
import { Cliente, useClientes } from "@/hooks/useClientes";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EditClientDialog from "@/components/EditClientDialog";

const ClientRegistration = () => {
  const { setClienteSelecionado } = useAppStore();
  const { clientes, addCliente, updateCliente, deleteCliente } = useClientes();
  const [showAddClient, setShowAddClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
  const navigate = useNavigate();

  const adicionarCliente = async (novoCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    await addCliente(novoCliente);
  };

  const handleClienteClick = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    navigate('/gestao-clientes');
  };

  const handleEditCliente = (cliente: Cliente) => {
    setClienteParaEditar(cliente);
    setShowEditClient(true);
  };

  const handleDeleteCliente = (cliente: Cliente) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"? Essa ação não pode ser desfeita.`)) {
      deleteCliente(cliente.id);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-sm dark:border-red-900/50 dark:bg-black/80">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="h-8 w-8 text-gray-600 hover:text-red-600 transition-colors dark:text-red-400 dark:hover:text-red-500" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 font-sans dark:text-red-500">Cadastro de Clientes</h2>
                <p className="text-sm text-gray-500 font-sans dark:text-red-400">Cadastre novos clientes no sistema</p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Card de Cadastro */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-black/80 dark:border dark:border-red-900">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 font-sans font-light dark:text-red-500">Cadastrar Novo Cliente</CardTitle>
                <CardDescription className="text-gray-600 font-sans dark:text-red-400">
                  Adicione um novo cliente ao sistema preenchendo as informações necessárias
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={() => setShowAddClient(true)} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200" size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Cadastrar Cliente
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Clientes em Formato de Tabela */}
            {clientes.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-black/80 dark:border dark:border-red-900">
                <CardHeader>
                  <CardTitle className="text-gray-900 font-sans text-xl font-light dark:text-red-500">Clientes Cadastrados</CardTitle>
                  <CardDescription className="text-gray-600 font-sans dark:text-red-400">
                    Lista de todos os clientes cadastrados no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientListTable 
                    clientes={clientes} 
                    onClienteClick={handleClienteClick}
                    onEditCliente={handleEditCliente}
                    onDeleteCliente={handleDeleteCliente}
                  />
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>

      {/* Dialog de Cadastro */}
      <AddClientDialog open={showAddClient} onOpenChange={setShowAddClient} onAddCliente={adicionarCliente} />
      <EditClientDialog 
        open={showEditClient} 
        onOpenChange={setShowEditClient} 
        cliente={clienteParaEditar}
        onUpdateCliente={updateCliente}
      />
    </SidebarProvider>
  );
};

export default ClientRegistration;
