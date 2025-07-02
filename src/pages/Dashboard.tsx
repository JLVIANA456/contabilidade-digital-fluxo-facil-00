import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileSpreadsheet, Calendar, TrendingUp, Building2, UserX, PieChart, BarChart3, Activity } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAppStore } from "@/store/useAppStore";
import { useClientes } from "@/hooks/useClientes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { clientes } = useClientes();
  const [analisesSelecionada, setAnalisesSelecionada] = useState("regime-tributario");
  const [statusMensalData, setStatusMensalData] = useState<Record<string, any>>({});

  // Fetch status mensal data
  useEffect(() => {
    const fetchStatusMensal = async () => {
      const { data, error } = await supabase
        .from('status_mensal')
        .select('*')
        .eq('ano', new Date().getFullYear());

      if (!error && data) {
        const statusByClient: Record<string, Record<string, any>> = {};
        data.forEach(status => {
          if (!statusByClient[status.cliente_id]) {
            statusByClient[status.cliente_id] = {};
          }
          statusByClient[status.cliente_id][status.mes] = status;
        });
        setStatusMensalData(statusByClient);
      }
    };

    if (clientes.length > 0) {
      fetchStatusMensal();
    }
  }, [clientes]);

  // Estatísticas do dashboard
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter(c => c.ativo !== false).length;
  const clientesInativos = clientes.filter(c => c.ativo === false).length;
  const clientesSimples = clientes.filter(c => c.regime_tributario === 'Simples Nacional' && c.ativo !== false).length;
  const clientesLucroPresumido = clientes.filter(c => c.regime_tributario === 'Lucro Presumido' && c.ativo !== false).length;
  const clientesLucroReal = clientes.filter(c => c.regime_tributario === 'Lucro Real' && c.ativo !== false).length;
  const mesAtual = new Date().toLocaleString('pt-BR', {
    month: 'long'
  }).toLowerCase();
  
  const clientesComFolhaAtualizada = clientes.filter(c => {
    if (c.ativo === false) return false;
    const clienteStatus = statusMensalData[c.id];
    return clienteStatus && clienteStatus[mesAtual] && clienteStatus[mesAtual].data_fechamento;
  }).length;

  // Dados para os diferentes tipos de análises
  const dadosAnalises = {
    "regime-tributario": {
      titulo: "Distribuição por Regime Tributário",
      tipo: "percentual",
      dados: [
        { nome: 'Simples Nacional', quantidade: clientesSimples, cor: 'bg-blue-500', porcentagem: clientesAtivos > 0 ? Math.round(clientesSimples / clientesAtivos * 100) : 0 },
        { nome: 'Lucro Presumido', quantidade: clientesLucroPresumido, cor: 'bg-orange-500', porcentagem: clientesAtivos > 0 ? Math.round(clientesLucroPresumido / clientesAtivos * 100) : 0 },
        { nome: 'Lucro Real', quantidade: clientesLucroReal, cor: 'bg-purple-500', porcentagem: clientesAtivos > 0 ? Math.round(clientesLucroReal / clientesAtivos * 100) : 0 }
      ]
    },
    "evolucao-clientes": {
      titulo: "Indicadores dos Clientes",
      tipo: "cards",
      dados: [
        { nome: 'Total Clientes', quantidade: totalClientes, cor: 'bg-red-500', icone: Users, descricao: 'Clientes cadastrados' },
        { nome: 'Ativos', quantidade: clientesAtivos, cor: 'bg-green-500', icone: TrendingUp, descricao: 'Clientes ativos' },
        { nome: 'Inativos', quantidade: clientesInativos, cor: 'bg-gray-500', icone: UserX, descricao: 'Clientes inativos' },
        { nome: 'Folhas Atualizadas', quantidade: clientesComFolhaAtualizada, cor: 'bg-yellow-500', icone: FileSpreadsheet, descricao: 'Concluídas este mês' }
      ]
    },
    "status-clientes": {
      titulo: "Status Detalhado dos Clientes",
      tipo: "tabela",
      dados: [
        { categoria: 'Clientes Ativos', valor: clientesAtivos, total: totalClientes, cor: 'text-green-600' },
        { categoria: 'Clientes Inativos', valor: clientesInativos, total: totalClientes, cor: 'text-gray-600' },
        { categoria: 'Taxa de Atividade', valor: clientesAtivos, total: totalClientes, cor: 'text-blue-600', isPercentual: true },
        { categoria: 'Folhas Concluídas', valor: clientesComFolhaAtualizada, total: clientesAtivos, cor: 'text-indigo-600', isPercentual: true }
      ]
    },
    "taxa-conclusao": {
      titulo: "Análise de Produtividade Mensal",
      tipo: "progresso",
      dados: [
        {
          nome: 'Taxa de Conclusão Geral',
          atual: clientesComFolhaAtualizada,
          meta: clientesAtivos,
          cor: 'bg-green-500',
          porcentagem: clientesAtivos > 0 ? Math.round(clientesComFolhaAtualizada / clientesAtivos * 100) : 0
        },
        {
          nome: 'Pendências',
          atual: clientesAtivos - clientesComFolhaAtualizada,
          meta: clientesAtivos,
          cor: 'bg-yellow-500',
          porcentagem: clientesAtivos > 0 ? Math.round((clientesAtivos - clientesComFolhaAtualizada) / clientesAtivos * 100) : 0
        }
      ]
    }
  };

  const analiseAtual = dadosAnalises[analisesSelecionada as keyof typeof dadosAnalises];

  const renderAnalise = () => {
    switch (analiseAtual.tipo) {
      case 'percentual':
        return (
          <div className="grid gap-4">
            {analiseAtual.dados.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${item.cor}`}></div>
                  <span className="font-medium text-gray-700">{item.nome}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-900">{item.quantidade}</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {item.porcentagem}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        );

      case 'cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analiseAtual.dados.map((item, index) => {
              const IconComponent = item.icone;
              return (
                <div key={index} className="relative">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />
                  <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md hover:shadow-lg transition-all duration-200 relative">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{item.nome}</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">{item.quantidade}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.descricao}</p>
                        </div>
                        <div className={`h-12 w-12 ${item.cor} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        );

      case 'tabela':
        return (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentual
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analiseAtual.dados.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${item.cor}`}>{item.categoria}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gray-900">{item.valor}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant="outline" className={item.cor.replace('text-', 'border-')}>
                        {item.total > 0 ? Math.round(item.valor / item.total * 100) : 0}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'progresso':
        return (
          <div className="space-y-6">
            {analiseAtual.dados.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">{item.nome}</span>
                  <span className="text-sm text-gray-500">{item.atual} de {item.meta}</span>
                </div>
                <Progress value={item.porcentagem} className="h-3 mb-2" />
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {item.porcentagem}%
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {item.porcentagem >= 80 ? 'Excelente' : item.porcentagem >= 60 ? 'Bom' : 'Precisa melhorar'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header Moderno */}
          <header className="sticky top-0 z-40 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="h-8 w-8 text-gray-600 hover:text-red-600 transition-colors" />
              <div className="flex-1">
                <h2 className="text-lg text-gray-900 font-sans font-light">Dashboard</h2>
                <p className="text-sm text-gray-500 font-sans">Visão geral dos clientes e indicadores</p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Cards de Estatísticas Modernos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 - Total de Clientes */}
              <div className="relative">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md hover:shadow-lg transition-all duration-200 relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 font-sans">Total de Clientes</CardTitle>
                    <div className="h-8 w-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600 font-sans">{totalClientes}</div>
                    <p className="text-xs text-gray-500 font-sans">Total cadastrado</p>
                  </CardContent>
                </Card>
              </div>

              {/* Card 2 - Ativos */}
              <div className="relative">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md hover:shadow-lg transition-all duration-200 relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 font-sans">Ativos</CardTitle>
                    <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 font-sans">{clientesAtivos}</div>
                    <p className="text-xs text-gray-500 font-sans">Clientes ativos</p>
                  </CardContent>
                </Card>
              </div>

              {/* Card 3 - Simples Nacional */}
              <div className="relative">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md hover:shadow-lg transition-all duration-200 relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 font-sans">Simples Nacional</CardTitle>
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 font-sans">{clientesSimples}</div>
                    <p className="text-xs text-gray-500 font-sans">
                      {clientesAtivos > 0 ? Math.round(clientesSimples / clientesAtivos * 100) : 0}% dos ativos
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Card 4 - Taxa de Conclusão */}
              <div className="relative">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md hover:shadow-lg transition-all duration-200 relative">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 font-sans">Taxa de Conclusão</CardTitle>
                    <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-indigo-600 font-sans">
                      {clientesAtivos > 0 ? Math.round(clientesComFolhaAtualizada / clientesAtivos * 100) : 0}%
                    </div>
                    <p className="text-xs text-gray-500 font-sans">Este mês</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Seletor e Análises */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Selecione a análise:</label>
                <Select value={analisesSelecionada} onValueChange={setAnalisesSelecionada}>
                  <SelectTrigger className="w-80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regime-tributario">Distribuição por Regime Tributário</SelectItem>
                    <SelectItem value="evolucao-clientes">Indicadores dos Clientes</SelectItem>
                    <SelectItem value="status-clientes">Status Detalhado dos Clientes</SelectItem>
                    <SelectItem value="taxa-conclusao">Análise de Produtividade Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 font-sans text-xl font-light flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gray-600" />
                    {analiseAtual.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderAnalise()}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
