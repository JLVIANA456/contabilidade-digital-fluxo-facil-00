
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ClientList from "@/components/ClientList";
import ClientDetails from "@/components/ClientDetails";
import ImportExportDialog from "@/components/ImportExportDialog";
import AddClientDialog from "@/components/AddClientDialog";
import { useAppStore } from "@/store/useAppStore";
import { Cliente, useClientes } from "@/hooks/useClientes";

const ClientManagement = () => {
  const {
    clienteSelecionado,
    setClienteSelecionado,
  } = useAppStore();
  
  const { clientes, addCliente, updateCliente } = useClientes();
  const [busca, setBusca] = useState("");
  const [showImportExport, setShowImportExport] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) || 
    (cliente.cnpj_cpf && cliente.cnpj_cpf.includes(busca)) || 
    cliente.colaborador_responsavel.toLowerCase().includes(busca.toLowerCase())
  );

  const adicionarCliente = async (novoCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    await addCliente(novoCliente);
  };

  if (clienteSelecionado) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
          <AppSidebar />
          <SidebarInset>
            <ClientDetails 
              cliente={clienteSelecionado} 
              onVoltar={() => setClienteSelecionado(null)} 
              onAtualizar={updateCliente} 
            />
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

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
                <h2 className="text-lg text-gray-900 font-sans font-light dark:text-red-500">Gestão de Clientes</h2>
                <p className="text-sm text-gray-500 font-sans dark:text-red-400">Gerencie todos os seus clientes e acompanhe o status das obrigações contábeis</p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Seção de Busca Moderna */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-black/80 dark:border dark:border-red-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 font-sans font-light text-xl dark:text-red-500">Buscar Clientes</CardTitle>
                <CardDescription className="text-gray-600 font-sans dark:text-red-400">
                  Encontre rapidamente o cliente que você procura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    placeholder="Buscar por nome, CNPJ/CPF ou colaborador responsável..." 
                    value={busca} 
                    onChange={e => setBusca(e.target.value)} 
                    className="pl-12 h-12 border-gray-200 focus:border-red-300 focus:ring-red-200 font-sans text-base" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lista de Clientes */}
            <ClientList clientes={clientesFiltrados} onClienteClick={setClienteSelecionado} />
          </main>
        </SidebarInset>
      </div>

      {/* Dialogs */}
      <ImportExportDialog 
        open={showImportExport} 
        onOpenChange={setShowImportExport} 
        clientes={clientes} 
        onImportClientes={() => {}} 
      />

      <AddClientDialog 
        open={showAddClient} 
        onOpenChange={setShowAddClient} 
        onAddCliente={adicionarCliente} 
      />
    </SidebarProvider>
  );
};

export default ClientManagement;
