import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FileText, Calendar, CheckCircle, Clock, AlertCircle, Download, Users } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useClientes } from "@/hooks/useClientes";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Relatorios = () => {
  const { clientes } = useClientes();
  const [mesSelecionado, setMesSelecionado] = useState<string>("");
  const [anoSelecionado, setAnoSelecionado] = useState<string>(new Date().getFullYear().toString());
  const [tipoRelatorio, setTipoRelatorio] = useState<string>("resumo");

  const mesesDoAno = [
    { value: 'janeiro', label: 'Janeiro' },
    { value: 'fevereiro', label: 'Fevereiro' },
    { value: 'março', label: 'Março' },
    { value: 'abril', label: 'Abril' },
    { value: 'maio', label: 'Maio' },
    { value: 'junho', label: 'Junho' },
    { value: 'julho', label: 'Julho' },
    { value: 'agosto', label: 'Agosto' },
    { value: 'setembro', label: 'Setembro' },
    { value: 'outubro', label: 'Outubro' },
    { value: 'novembro', label: 'Novembro' },
    { value: 'dezembro', label: 'Dezembro' }
  ];

  // Definir mês atual como padrão
  useEffect(() => {
    const mesAtual = mesesDoAno[new Date().getMonth()].value;
    setMesSelecionado(mesAtual);
  }, []);

  const obterStatusCliente = (cliente: any, mes: string) => {
    const status = cliente.statusMensal?.[mes];
    if (!status) return {
      status: 'pendente',
      progresso: 0,
      detalhes: {
        dataFechamento: false,
        integracaoFiscal: false,
        integracaoFopag: false,
        semMovimentoFopag: false
      }
    };

    let completos = 0;
    const total = 4;

    const detalhes = {
      dataFechamento: !!status.dataFechamento,
      integracaoFiscal: !!status.integracaoFiscal,
      integracaoFopag: !!status.integracaoFopag,
      semMovimentoFopag: !!status.semMovimentoFopag
    };

    if (detalhes.dataFechamento) completos++;
    if (detalhes.integracaoFiscal) completos++;
    if (detalhes.integracaoFopag) completos++;
    if (detalhes.semMovimentoFopag) completos++;

    const progresso = (completos / total) * 100;

    if (progresso === 100) return { status: 'completo', progresso, detalhes };
    if (progresso > 0) return { status: 'parcial', progresso, detalhes };
    return { status: 'pendente', progresso: 0, detalhes };
  };

  const obterEstatisticasMes = (mes: string) => {
    const clientesAtivos = clientes.filter(c => c.ativo !== false);
    let completos = 0;
    let parciais = 0;
    let pendentes = 0;

    clientesAtivos.forEach(cliente => {
      const { status } = obterStatusCliente(cliente, mes);
      if (status === 'completo') completos++;
      else if (status === 'parcial') parciais++;
      else pendentes++;
    });

    return {
      completos,
      parciais,
      pendentes,
      total: clientesAtivos.length
    };
  };

  const gerarRelatorioCompleto = () => {
    const relatorio = mesesDoAno.map(mes => ({
      mes: mes.label,
      ...obterEstatisticasMes(mes.value)
    }));
    return relatorio;
  };

  const estatisticas = mesSelecionado ? obterEstatisticasMes(mesSelecionado) : {
    completos: 0,
    parciais: 0,
    pendentes: 0,
    total: 0
  };

  const relatorioAnual = gerarRelatorioCompleto();

  // Função utilitária para converter array de objetos em CSV
  function exportToCSV(filename: string, rows: any[], headers: string[]) {
    const csvContent = [
      headers.join(","),
      ...rows.map(row => headers.map(h => '"' + (row[h] ?? "") + '"').join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  }

  // Função para exportar relatório em PDF (visual, com tabelas)
  const handleExportPDF = () => {
    const doc = new jsPDF();
    if (tipoRelatorio === "resumo") {
      doc.text("Relatório Resumo Mensal", 14, 15);
      autoTable(doc, {
        startY: 25,
        head: [["Mês", "Completos", "Parciais", "Pendentes", "Total"]],
        body: [[
          mesesDoAno.find(m => m.value === mesSelecionado)?.label,
          estatisticas.completos,
          estatisticas.parciais,
          estatisticas.pendentes,
          estatisticas.total
        ]],
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 12 },
      });
    } else if (tipoRelatorio === "detalhado") {
      doc.text(`Relatório Detalhado - ${mesesDoAno.find(m => m.value === mesSelecionado)?.label} ${anoSelecionado}`, 14, 15);
      const body = clientes.filter(c => c.ativo !== false).map(cliente => {
        const { status, progresso, detalhes } = obterStatusCliente(cliente, mesSelecionado);
        return [
          cliente.nome,
          cliente.colaborador_responsavel,
          status,
          detalhes.dataFechamento ? "Sim" : "Não",
          detalhes.integracaoFiscal ? "Sim" : "Não",
          detalhes.integracaoFopag ? "Sim" : "Não",
          detalhes.semMovimentoFopag ? "Sim" : "Não",
          Math.round(progresso) + "%"
        ];
      });
      autoTable(doc, {
        startY: 25,
        head: [["Cliente", "Colaborador", "Status", "Data Fechamento", "Int. Fiscal", "Int. FOPAG", "Sem Mov. FOPAG", "Progresso"]],
        body,
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 10 },
      });
    } else if (tipoRelatorio === "anual") {
      doc.text(`Relatório Anual - ${anoSelecionado}`, 14, 15);
      const body = relatorioAnual.map(item => {
        const taxaConclusao = item.total > 0 ? (item.completos / item.total) * 100 : 0;
        return [
          item.mes,
          item.completos,
          item.parciais,
          item.pendentes,
          item.total,
          Math.round(taxaConclusao) + "%"
        ];
      });
      autoTable(doc, {
        startY: 25,
        head: [["Mês", "Completos", "Parciais", "Pendentes", "Total", "Taxa de Conclusão"]],
        body,
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 10 },
      });
    }
    doc.save(`relatorio_${tipoRelatorio}_${mesSelecionado || anoSelecionado}.pdf`);
  };

  // Função para exportar relatório conforme o tipo selecionado
  const handleExport = () => {
    if (tipoRelatorio === "resumo") {
      const data = [
        {
          Mês: mesesDoAno.find(m => m.value === mesSelecionado)?.label,
          Completos: estatisticas.completos,
          Parciais: estatisticas.parciais,
          Pendentes: estatisticas.pendentes,
          Total: estatisticas.total
        }
      ];
      exportToCSV(`relatorio_resumo_${mesSelecionado}_${anoSelecionado}.csv`, data, ["Mês", "Completos", "Parciais", "Pendentes", "Total"]);
    } else if (tipoRelatorio === "detalhado") {
      const data = clientes.filter(c => c.ativo !== false).map(cliente => {
        const { status, progresso, detalhes } = obterStatusCliente(cliente, mesSelecionado);
        return {
          Cliente: cliente.nome,
          Colaborador: cliente.colaborador_responsavel,
          Status: status,
          "Data Fechamento": detalhes.dataFechamento ? "Sim" : "Não",
          "Int. Fiscal": detalhes.integracaoFiscal ? "Sim" : "Não",
          "Int. FOPAG": detalhes.integracaoFopag ? "Sim" : "Não",
          "Sem Mov. FOPAG": detalhes.semMovimentoFopag ? "Sim" : "Não",
          Progresso: Math.round(progresso) + "%"
        };
      });
      exportToCSV(`relatorio_detalhado_${mesSelecionado}_${anoSelecionado}.csv`, data, ["Cliente", "Colaborador", "Status", "Data Fechamento", "Int. Fiscal", "Int. FOPAG", "Sem Mov. FOPAG", "Progresso"]);
    } else if (tipoRelatorio === "anual") {
      const data = relatorioAnual.map(item => ({
        Mês: item.mes,
        Completos: item.completos,
        Parciais: item.parciais,
        Pendentes: item.pendentes,
        Total: item.total,
        "Taxa de Conclusão": Math.round(item.total > 0 ? (item.completos / item.total) * 100 : 0) + "%"
      }));
      exportToCSV(`relatorio_anual_${anoSelecionado}.csv`, data, ["Mês", "Completos", "Parciais", "Pendentes", "Total", "Taxa de Conclusão"]);
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
                <h2 className="text-lg font-semibold text-gray-900 font-sans dark:text-red-500">Relatórios</h2>
                <p className="text-sm text-gray-500 font-sans dark:text-red-400">Visualize relatórios detalhados sobre o progresso das obrigações</p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-black/80 dark:border dark:border-red-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-gray-900 font-sans flex items-center font-thin dark:text-red-500">
                  <FileText className="h-6 w-6 mr-2 text-red-600" />
                  Configurações do Relatório
                </CardTitle>
                <CardDescription className="text-gray-600 font-sans dark:text-red-400">
                  Selecione o tipo de relatório e período desejado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tipo de Relatório</label>
                    <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resumo">Resumo Mensal</SelectItem>
                        <SelectItem value="detalhado">Detalhado por Cliente</SelectItem>
                        <SelectItem value="anual">Relatório Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {tipoRelatorio !== "anual" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Mês</label>
                        <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Selecione o mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {mesesDoAno.map(mes => (
                              <SelectItem key={mes.value} value={mes.value}>
                                {mes.label}
                              </SelectItem>
                            ))}
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
                    </>
                  )}
                  
                  <Button className="bg-red-600 hover:bg-red-700" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 ml-2" onClick={handleExportPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Relatório Resumo Mensal */}
            {tipoRelatorio === "resumo" && mesSelecionado && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-black dark:to-gray-900 dark:border-red-900">
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

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-black dark:to-gray-900 dark:border-red-900">
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

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-black dark:to-gray-900 dark:border-red-900">
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

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-black dark:to-gray-900 dark:border-red-900">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-red-400">Total</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-red-500">{estatisticas.total}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600 dark:text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Relatório Detalhado por Cliente */}
            {tipoRelatorio === "detalhado" && mesSelecionado && (
              <Card className="dark:bg-black/80 dark:border dark:border-red-900">
                <CardHeader>
                  <CardTitle className="capitalize text-xl font-light dark:text-red-500">
                    Relatório Detalhado - {mesesDoAno.find(m => m.value === mesSelecionado)?.label} {anoSelecionado}
                  </CardTitle>
                  <CardDescription className="dark:text-red-400">
                    Status detalhado de cada cliente e suas obrigações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Fechamento</TableHead>
                        <TableHead>Int. Fiscal</TableHead>
                        <TableHead>Int. FOPAG</TableHead>
                        <TableHead>Sem Mov. FOPAG</TableHead>
                        <TableHead>Progresso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientes.filter(c => c.ativo !== false).map(cliente => {
                        const { status, progresso, detalhes } = obterStatusCliente(cliente, mesSelecionado);
                        return (
                          <TableRow key={cliente.id}>
                            <TableCell className="font-medium">{cliente.nome}</TableCell>
                            <TableCell>{cliente.colaborador_responsavel}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                status === 'completo' ? 'bg-green-100 text-green-800 border-green-200' :
                                status === 'parcial' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-red-100 text-red-800 border-red-200'
                              }>
                                {status === 'completo' ? 'Completo' : status === 'parcial' ? 'Parcial' : 'Pendente'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <CheckCircle className={`h-4 w-4 ${detalhes.dataFechamento ? 'text-green-600' : 'text-gray-300'}`} />
                            </TableCell>
                            <TableCell>
                              <CheckCircle className={`h-4 w-4 ${detalhes.integracaoFiscal ? 'text-green-600' : 'text-gray-300'}`} />
                            </TableCell>
                            <TableCell>
                              <CheckCircle className={`h-4 w-4 ${detalhes.integracaoFopag ? 'text-green-600' : 'text-gray-300'}`} />
                            </TableCell>
                            <TableCell>
                              <CheckCircle className={`h-4 w-4 ${detalhes.semMovimentoFopag ? 'text-green-600' : 'text-gray-300'}`} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={progresso} className="w-16" />
                                <span className="text-sm">{Math.round(progresso)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Relatório Anual */}
            {tipoRelatorio === "anual" && (
              <Card className="dark:bg-black/80 dark:border dark:border-red-900">
                <CardHeader>
                  <CardTitle className="text-xl font-light dark:text-red-500">
                    Relatório Anual - {anoSelecionado}
                  </CardTitle>
                  <CardDescription className="dark:text-red-400">
                    Visão geral do progresso mês a mês durante o ano
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead>Completos</TableHead>
                        <TableHead>Parciais</TableHead>
                        <TableHead>Pendentes</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Taxa de Conclusão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorioAnual.map(item => {
                        const taxaConclusao = item.total > 0 ? (item.completos / item.total) * 100 : 0;
                        return (
                          <TableRow key={item.mes}>
                            <TableCell className="font-medium">{item.mes}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">{item.completos}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">{item.parciais}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800">{item.pendentes}</Badge>
                            </TableCell>
                            <TableCell>{item.total}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={taxaConclusao} className="w-20" />
                                <span className="text-sm">{Math.round(taxaConclusao)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Relatorios;
