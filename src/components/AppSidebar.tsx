import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, FileSpreadsheet, Settings, Plus, TrendingUp, Calendar, BarChart3, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import ImportExportDialog from "@/components/ImportExportDialog";
import AddClientDialog from "@/components/AddClientDialog";
import SettingsDialog from "@/components/SettingsDialog";
import { Cliente, useClientes } from "@/hooks/useClientes";

export function AppSidebar() {
  const { state } = useSidebar();
  const { clientes, addCliente } = useClientes();
  const [showImportExport, setShowImportExport] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const location = useLocation();
  
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter(c => c.ativo).length;
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      badge: null,
    },
    {
      title: "Clientes",
      icon: Plus,
      href: "/clientes",
      badge: null,
    },
    {
      title: "Gestão de Clientes",
      icon: Users,
      href: "/gestao-clientes",
      badge: clientesAtivos > 0 ? clientesAtivos.toString() : null,
    },
    {
      title: "Controle",
      icon: BarChart3,
      href: "/controle",
      badge: null,
    },
    {
      title: "Relatórios",
      icon: FileText,
      href: "/relatorios",
      badge: null,
    },
    {
      title: "Importar/Exportar",
      icon: FileSpreadsheet,
      action: () => setShowImportExport(true),
      badge: null,
    },
    {
      title: "Configurações",
      icon: Settings,
      action: () => setShowSettings(true),
      badge: null,
    },
  ];

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

  return (
    <>
      <Sidebar className="border-r border-gray-200/50 bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 dark:border-gray-800/50">
        <SidebarHeader className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            {state !== "collapsed" && (
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white font-sans">ContábilPro</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">Gestão Contábil</p>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 dark:text-gray-400 font-medium font-sans">
              Menu Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.href ? (
                      <SidebarMenuButton asChild className={`w-full justify-start font-sans hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors duration-200 ${location.pathname === item.href ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-medium' : ''}`}>
                        <Link to={item.href}>
                          <item.icon className="h-5 w-5" />
                          {state !== "collapsed" && (
                            <>
                              <span className="font-medium">{item.title}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="ml-auto bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        onClick={item.action}
                        className="w-full justify-start font-sans hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors duration-200"
                      >
                        <item.icon className="h-5 w-5" />
                        {state !== "collapsed" && (
                          <>
                            <span className="font-medium">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
      </Sidebar>

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

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </>
  );
}
