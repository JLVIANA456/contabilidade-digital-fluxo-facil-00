
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BarChart3, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const Controle = () => {
  const {
    clientes
  } = useAppStore();
  const [mesSelecionado, setMesSelecionado] = useState<string>("");
  const [anoSelecionado, setAnoSelecionado] = useState<string>(new Date().getFullYear().toString());
  const mesesDoAno = [{
    value: 'janeiro',
    label: 'Janeiro'
  }, {
    value: 'fevereiro',
    label: 'Fevereiro'
  }, {
    value: 'março',
    label: 'Março'
  }, {
    value: 'abril',
    label: 'Abril'
  }, {
    value: 'maio',
    label: 'Maio'
  }, {
    value: 'junho',
    label: 'Junho'
  }, {
    value: 'julho',
    label: 'Julho'
  }, {
    value: 'agosto',
    label: 'Agosto'
  }, {
    value: 'setembro',
    label: 'Setembro'
  }, {
    value: 'outubro',
    label: 'Outubro'
  }, {
    value: 'novembro',
    label: 'Novembro'
  }, {
    value: 'dezembro',
    label: 'Dezembro'
  }];

  // Definir mês atual como padrão
  useEffect(() => {
    const mesAtual = mesesDoAno[new Date().getMonth()].value;
    setMesSelecionado(mesAtual);
  }, []);

  const obterStatusCliente = (cliente: any, mes: string) => {
    const status = cliente.statusMensal?.[mes];
    if (!status) return {
      status: 'pendente',
      progresso: 0
    };
    
    let completos = 0;
    const total = 4; // Agora são 4 campos obrigatórios

    // Verificar se todos os campos obrigatórios estão preenchidos/marcados
    if (status.dataFechamento) completos++;
    if (status.integracaoFiscal) completos++;
    if (status.integracaoFopag) completos++;
    if (status.semMovimentoFopag) completos++;
    
    const progresso = completos / total * 100;

    // Um cliente é considerado completo quando TODOS os 4 campos estão preenchidos/marcados
    if (progresso === 100) return {
      status: 'completo',
      progresso
    };
    if (progresso > 0) return {
      status: 'parcial',
      progresso
    };
    return {
      status: 'pendente',
      progresso: 0
    };
  };

  const obterEstatisticasMes = (mes: string) => {
    const clientesAtivos = clientes.filter(c => c.ativo !== false);
    let completos = 0;
    let parciais = 0;
    let pendentes = 0;
    clientesAtivos.forEach(cliente => {
      const {
        status
      } = obterStatusCliente(cliente, mes);
      if (status === 'completo') completos++;else if (status === 'parcial') parciais++;else pendentes++;
    });
    return {
      completos,
      parciais,
      pendentes,
      total: clientesAtivos.length
    };
  };

  const estatisticas = mesSelecionado ? obterEstatisticasMes(mesSelecionado) : {
    completos: 0,
    parciais: 0,
    pendentes: 0,
    total: 0
  };

  const progressoGeral = estatisticas.total > 0 ? estatisticas.completos / estatisticas.total * 100 : 0;

  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-sm dark:border-red-900/50 dark:bg-black/80">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="h-8 w-8 text-gray-600 hover:text-red-600 transition-colors dark:text-red-400 dark:hover:text-red-500" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 font-sans dark:text-red-500">Controle de Obrigações</h2>
                <p className="text-sm text-gray-500 font-sans dark:text-red-400">Acompanhe o progresso das obrigações fiscais e trabalhistas</p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-black/80 dark:border dark:border-red-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-900 font-sans flex items-center font-thin dark:text-red-500">
                  <BarChart3 className="h-6 w-6 mr-2 text-red-600" />
                  Filtros de Controle
                </CardTitle>
                <CardDescription className="text-gray-600 font-sans dark:text-red-400">
                  Selecione o mês e ano para visualizar o progresso das obrigações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mês</label>
                    <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                      <SelectContent>
                        {mesesDoAno.map(mes => <SelectItem key={mes.value} value={mes.value}>
                            {mes.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Ano</label>
                    <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {mesSelecionado && <>
                {/* Resumo Geral */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:bg-black/80 dark:border dark:border-red-900">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600 dark:text-red-400">Completos</p>
                          <p className="text-2xl font-bold text-green-700 dark:text-red-500">{estatisticas.completos}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-red-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:bg-black/80 dark:border dark:border-red-900">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-600 dark:text-red-400">Parciais</p>
                          <p className="text-2xl font-bold text-yellow-700 dark:text-red-500">{estatisticas.parciais}</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600 dark:text-red-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:bg-black/80 dark:border dark:border-red-900">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">Pendentes</p>
                          <p className="text-2xl font-bold text-red-700 dark:text-red-500">{estatisticas.pendentes}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:bg-black/80 dark:border dark:border-red-900">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600 dark:text-red-400">Progresso Geral</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-red-500">{Math.round(progressoGeral)}%</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-600 dark:text-red-500" />
                      </div>
                      <Progress value={progressoGeral} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de Clientes */}
                <Card className="dark:bg-black/80 dark:border dark:border-red-900">
                  <CardHeader>
                    <CardTitle className="capitalize text-xl font-light dark:text-red-500">
                      Status dos Clientes - {mesesDoAno.find(m => m.value === mesSelecionado)?.label} {anoSelecionado}
                    </CardTitle>
                    <CardDescription className="dark:text-red-400">
                      Acompanhe o progresso individual de cada cliente. Um cliente é considerado completo quando todos os 4 campos estão preenchidos/marcados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientes.filter(c => c.ativo !== false).map(cliente => {
                    const {
                      status,
                      progresso
                    } = obterStatusCliente(cliente, mesSelecionado);
                    return <div key={cliente.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-medium text-gray-900">{cliente.nome}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {cliente.colaboradorResponsavel}
                                </Badge>
                                <Badge variant="outline" className={status === 'completo' ? 'bg-green-100 text-green-800 border-green-200' : status === 'parcial' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'}>
                                  {status === 'completo' ? 'Completo' : status === 'parcial' ? 'Parcial' : 'Pendente'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{cliente.cnpjCpf}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-medium">{Math.round(progresso)}%</p>
                                <Progress value={progresso} className="w-24" />
                              </div>
                            </div>
                          </div>;
                  })}
                    </div>
                  </CardContent>
                </Card>
              </>}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>;
};

export default Controle;
