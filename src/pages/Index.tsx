
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, FileSpreadsheet, Calendar, TrendingUp, Search, Plus, Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ClientList from "@/components/ClientList";
import ClientDetails from "@/components/ClientDetails";
import ImportExportDialog from "@/components/ImportExportDialog";
import AddClientDialog from "@/components/AddClientDialog";
import { useAppStore } from "@/store/useAppStore";
import { useClientes, Cliente } from "@/hooks/useClientes";

const Index = () => {
  const {
    clienteSelecionado,
    setClienteSelecionado,
  } = useAppStore();
  
  const { clientes, loading, addCliente, updateCliente } = useClientes();
  
  const [busca, setBusca] = useState("");
  const [showImportExport, setShowImportExport] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (cliente.cnpj_cpf && cliente.cnpj_cpf.includes(busca)) ||
    cliente.colaborador_responsavel.toLowerCase().includes(busca.toLowerCase())
  );

  // Estatísticas do dashboard
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter(c => c.ativo).length;
  const clientesSimples = clientes.filter(c => c.regime_tributario === 'Simples Nacional' && c.ativo).length;
  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toLowerCase();

  const adicionarCliente = async (novoCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    await addCliente(novoCliente);
  };

  const importarClientesEmLote = async (clientesImportados: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>[]) => {
    console.log('Importando', clientesImportados.length, 'clientes em lote...');
    
    // Importar cada cliente individualmente
    for (const cliente of clientesImportados) {
      try {
        await addCliente(cliente);
        console.log('Cliente importado:', cliente.nome);
      } catch (error) {
        console.error('Erro ao importar cliente:', cliente.nome, error);
      }
    }
    
    console.log('Importação em lote concluída');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

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
                <h2 className="text-lg font-semibold text-gray-900 font-sans dark:text-red-500">Dashboard</h2>
                <p className="text-sm text-gray-500 font-sans dark:text-red-400">Gestão de Clientes Contábeis</p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Cards de Estatísticas Modernos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md hover:shadow-lg transition-all duration-200 dark:bg-black/80 dark:border dark:border-red-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 font-sans dark:text-red-400">Total de Clientes</CardTitle>
                  <div className="h-8 w-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 font-sans dark:text-red-500">{totalClientes}</div>
                  <p className="text-xs text-gray-500 font-sans dark:text-red-400">{clientesAtivos} ativos</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md hover:shadow-lg transition-all duration-200 dark:bg-black/80 dark:border dark:border-red-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 font-sans dark:text-red-400">Simples Nacional</CardTitle>
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 font-sans dark:text-red-500">{clientesSimples}</div>
                  <p className="text-xs text-gray-500 font-sans dark:text-red-400">
                    {clientesAtivos > 0 ? Math.round((clientesSimples / clientesAtivos) * 100) : 0}% dos ativos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md hover:shadow-lg transition-all duration-200 dark:bg-black/80 dark:border dark:border-red-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 font-sans dark:text-red-400">Folhas Atualizadas</CardTitle>
                  <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 font-sans dark:text-red-500">0</div>
                  <p className="text-xs text-gray-500 font-sans capitalize dark:text-red-400">{mesAtual}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md hover:shadow-lg transition-all duration-200 dark:bg-black/80 dark:border dark:border-red-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 font-sans dark:text-red-400">Taxa de Conclusão</CardTitle>
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 font-sans dark:text-red-500">0%</div>
                  <p className="text-xs text-gray-500 font-sans dark:text-red-400">Este mês</p>
                </CardContent>
              </Card>
            </div>

            {/* Seção de Busca Moderna */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-black/80 dark:border dark:border-red-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 font-sans dark:text-red-500">Gestão de Clientes</CardTitle>
                <CardDescription className="text-gray-600 font-sans dark:text-red-400">
                  Gerencie todos os seus clientes e acompanhe o status das obrigações contábeis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Buscar por nome, CNPJ/CPF ou colaborador responsável..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-red-300 focus:ring-red-200 font-sans text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lista de Clientes */}
            <ClientList 
              clientes={clientesFiltrados}
              onClienteClick={setClienteSelecionado}
            />
          </main>
        </SidebarInset>
      </div>

      {/* Dialogs */}
      <ImportExportDialog 
        open={showImportExport}
        onOpenChange={setShowImportExport}
        clientes={clientes}
        onImportClientes={importarClientesEmLote}
      />

      <AddClientDialog
        open={showAddClient}
        onOpenChange={setShowAddClient}
        onAddCliente={adicionarCliente}
      />
    </SidebarProvider>
  );
};

export default Index;
