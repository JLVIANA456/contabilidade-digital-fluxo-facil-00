
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Save, Calendar, FileText, CheckCircle, Upload, Paperclip, MessageSquare, Plus } from "lucide-react";
import { Cliente } from "@/pages/Index";
import { toast } from "@/hooks/use-toast";
interface ClientDetailsProps {
  cliente: Cliente;
  onVoltar: () => void;
  onAtualizar: (cliente: Cliente) => void;
}
const ClientDetails = ({
  cliente,
  onVoltar,
  onAtualizar
}: ClientDetailsProps) => {
  const [dadosEdicao, setDadosEdicao] = useState<Cliente>(cliente);
  const [mesDialogAberto, setMesDialogAberto] = useState<string | null>(null);
  const mesesDoAno = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const formasEnvio = ['Gestta', 'Google Drive', 'Omie', 'Consulta eCAC', 'Físico', 'Email'];
  const salvarAlteracoes = () => {
    onAtualizar(dadosEdicao);
    toast({
      title: "Cliente atualizado com sucesso!",
      description: "As informações foram salvas."
    });
  };
  const atualizarStatusMensal = (mes: string, campo: string, valor: any) => {
    setDadosEdicao(prev => ({
      ...prev,
      statusMensal: {
        ...prev.statusMensal,
        [mes]: {
          ...prev.statusMensal[mes],
          [campo]: valor
        }
      }
    }));
  };
  const handleFileUpload = (mes: string, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      const existingFiles = dadosEdicao.statusMensal[mes]?.arquivos || [];
      atualizarStatusMensal(mes, 'arquivos', [...existingFiles, ...fileArray]);
    }
  };
  const removeFile = (mes: string, fileIndex: number) => {
    const existingFiles = dadosEdicao.statusMensal[mes]?.arquivos || [];
    const updatedFiles = existingFiles.filter((_, index) => index !== fileIndex);
    atualizarStatusMensal(mes, 'arquivos', updatedFiles);
  };
  const getStatusMes = (mes: string) => {
    const status = dadosEdicao.statusMensal[mes];
    const dataFechamentoOk = status?.dataFechamento;
    const integracaoFiscalOk = status?.integracaoFiscal;
    const integracaoFopagOk = status?.integracaoFopag;
    const semMovimentoFopagOk = status?.semMovimentoFopag;
    
    const totalCampos = 4; // Agora são 4 campos obrigatórios
    let camposCompletos = 0;
    
    if (dataFechamentoOk) camposCompletos++;
    if (integracaoFiscalOk) camposCompletos++;
    if (integracaoFopagOk) camposCompletos++;
    if (semMovimentoFopagOk) camposCompletos++;
    
    if (camposCompletos === totalCampos) {
      return {
        cor: 'text-green-600',
        icone: CheckCircle,
        status: 'Completo'
      };
    } else if (camposCompletos > 0) {
      return {
        cor: 'text-yellow-600',
        icone: Calendar,
        status: 'Parcial'
      };
    } else {
      return {
        cor: 'text-gray-400',
        icone: FileText,
        status: 'Pendente'
      };
    }
  };
  const abrirModalArquivos = (mes: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMesDialogAberto(mes);
  };
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onVoltar} className="text-red-600 hover:bg-red-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{dadosEdicao.nome}</h1>
                <p className="text-sm text-gray-600">{dadosEdicao.cnpjCpf}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                {dadosEdicao.colaboradorResponsavel}
              </Badge>
              <Badge variant="outline">
                {dadosEdicao.regimeTributario}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="acompanhamento" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="acompanhamento">Acompanhamento Mensal</TabsTrigger>
            <TabsTrigger value="dados">Dados do Cliente</TabsTrigger>
          </TabsList>

          <TabsContent value="acompanhamento" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-light">
                  <Calendar className="h-5 w-5 mr-2 text-red-600" />
                  Controle Mensal - {new Date().getFullYear()}
                </CardTitle>
                <CardDescription>
                  Acompanhe o status das obrigações fiscais e trabalhistas mês a mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mesesDoAno.map(mes => {
                  const statusInfo = getStatusMes(mes);
                  const StatusIcon = statusInfo.icone;
                  const arquivos = dadosEdicao.statusMensal[mes]?.arquivos || [];
                  return <Card key={mes} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg capitalize">{mes}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`h-5 w-5 ${statusInfo.cor}`} />
                              <Badge variant="outline" className={statusInfo.cor.replace('text-', 'text-') + ' border-current'}>
                                {statusInfo.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Forma de Envio */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Forma de Envio</Label>
                            <Select value={dadosEdicao.statusMensal[mes]?.formaEnvio || ''} onValueChange={value => atualizarStatusMensal(mes, 'formaEnvio', value)}>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Selecionar..." />
                              </SelectTrigger>
                              <SelectContent>
                                {formasEnvio.map(forma => <SelectItem key={forma} value={forma}>{forma}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Data de Fechamento */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Data de Fechamento</Label>
                            <Input type="date" value={dadosEdicao.statusMensal[mes]?.dataFechamento || ''} onChange={e => atualizarStatusMensal(mes, 'dataFechamento', e.target.value)} className="h-8 text-xs" />
                          </div>

                          {/* Integrações */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id={`integracaoFiscal-${mes}`} checked={dadosEdicao.statusMensal[mes]?.integracaoFiscal || false} onCheckedChange={checked => atualizarStatusMensal(mes, 'integracaoFiscal', checked)} />
                              <Label htmlFor={`integracaoFiscal-${mes}`} className="text-xs">
                                Integração Fiscal
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id={`integracaoFopag-${mes}`} checked={dadosEdicao.statusMensal[mes]?.integracaoFopag || false} onCheckedChange={checked => atualizarStatusMensal(mes, 'integracaoFopag', checked)} />
                              <Label htmlFor={`integracaoFopag-${mes}`} className="text-xs">
                                Integração FOPAG
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id={`semMovimentoFopag-${mes}`} checked={dadosEdicao.statusMensal[mes]?.semMovimentoFopag || false} onCheckedChange={checked => atualizarStatusMensal(mes, 'semMovimentoFopag', checked)} />
                              <Label htmlFor={`semMovimentoFopag-${mes}`} className="text-xs">
                                Sem Movimento FOPAG
                              </Label>
                            </div>
                          </div>

                          {/* Botões de Ação */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Paperclip className="h-3 w-3" />
                              <span>{arquivos.length} arquivo(s)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button variant="outline" size="sm" onClick={e => abrirModalArquivos(mes, e)} className="h-6 px-2 text-xs">
                                <Plus className="h-3 w-3 mr-1" />
                                Arquivos
                              </Button>
                              <Button variant="outline" size="sm" onClick={e => abrirModalArquivos(mes, e)} className="h-6 px-2 text-xs">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Nota
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>;
                })}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={salvarAlteracoes} className="bg-red-600 hover:bg-red-700">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dados" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Cadastrais</CardTitle>
                <CardDescription>
                  Edite os dados básicos do cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome/Razão Social</Label>
                    <Input id="nome" value={dadosEdicao.nome} onChange={e => setDadosEdicao(prev => ({
                    ...prev,
                    nome: e.target.value
                  }))} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cnpjCpf">CNPJ/CPF</Label>
                    <Input id="cnpjCpf" value={dadosEdicao.cnpjCpf} onChange={e => setDadosEdicao(prev => ({
                    ...prev,
                    cnpjCpf: e.target.value
                  }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regime">Regime Tributário</Label>
                    <Select value={dadosEdicao.regimeTributario} onValueChange={(value: any) => setDadosEdicao(prev => ({
                    ...prev,
                    regimeTributario: value
                  }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                        <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colaborador">Colaborador Responsável</Label>
                    <Select value={dadosEdicao.colaboradorResponsavel} onValueChange={(value: any) => setDadosEdicao(prev => ({
                    ...prev,
                    colaboradorResponsavel: value
                  }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sheila">Sheila</SelectItem>
                        <SelectItem value="Bruna">Bruna</SelectItem>
                        <SelectItem value="Nilcea">Nilcea</SelectItem>
                        <SelectItem value="Natiele">Natiele</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataEntrada">Data de Entrada</Label>
                    <Input id="dataEntrada" type="date" value={dadosEdicao.dataEntrada || ''} onChange={e => setDadosEdicao(prev => ({
                    ...prev,
                    dataEntrada: e.target.value
                  }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataSaida">Data de Saída</Label>
                    <Input id="dataSaida" type="date" value={dadosEdicao.dataSaida || ''} onChange={e => setDadosEdicao(prev => ({
                    ...prev,
                    dataSaida: e.target.value
                  }))} />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={salvarAlteracoes} className="bg-red-600 hover:bg-red-700">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para detalhes do mês */}
      <Dialog open={!!mesDialogAberto} onOpenChange={() => setMesDialogAberto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="capitalize">
              Detalhes de {mesDialogAberto}
            </DialogTitle>
            <DialogDescription>
              Gerencie arquivos e anotações para este mês
            </DialogDescription>
          </DialogHeader>

          {mesDialogAberto && <div className="space-y-6">
              {/* Upload de Arquivos */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-medium">Arquivos</Label>
                </div>
                
                <Input type="file" multiple accept=".pdf,.xlsx,.xls,.txt,.doc,.docx" onChange={e => handleFileUpload(mesDialogAberto, e.target.files)} className="cursor-pointer" />

                {/* Lista de arquivos */}
                <div className="space-y-2">
                  {(dadosEdicao.statusMensal[mesDialogAberto]?.arquivos || []).map((arquivo, index) => <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{arquivo.name}</span>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => removeFile(mesDialogAberto, index)}>
                        Remover
                      </Button>
                    </div>)}
                </div>
              </div>

              {/* Anotações */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <Label className="text-base font-medium">Anotações</Label>
                </div>
                
                <Textarea placeholder="Digite suas anotações para este mês..." value={dadosEdicao.statusMensal[mesDialogAberto]?.anotacoes || ''} onChange={e => atualizarStatusMensal(mesDialogAberto, 'anotacoes', e.target.value)} rows={4} />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setMesDialogAberto(null)}>
                  Fechar
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
};
export default ClientDetails;
