import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Save, Calendar, FileText, CheckCircle, Upload, Paperclip, MessageSquare, Plus } from "lucide-react";
import { Cliente } from "@/hooks/useClientes";
import { useStatusMensal } from "@/hooks/useStatusMensal";
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
  const [mesArquivosAberto, setMesArquivosAberto] = useState<string | null>(null);
  const [mesAnotacoesAberto, setMesAnotacoesAberto] = useState<string | null>(null);
  const { statusMensal, updateStatusMensal } = useStatusMensal(cliente.id);
  
  const mesesDoAno = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const formasEnvio = ['Gestta', 'Google Drive', 'Omie', 'Consulta eCAC', 'Físico', 'Email'];

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (inputFileRef.current) {
        inputFileRef.current.files = e.dataTransfer.files;
        // Se já houver um handler de upload, chame aqui
        // handleFileChange(e)
      }
    }
  };

  const handleClickDropzone = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const salvarAlteracoes = () => {
    onAtualizar(dadosEdicao);
    toast({
      title: "Cliente atualizado com sucesso!",
      description: "As informações foram salvas."
    });
  };

  const atualizarStatusMensal = async (mes: string, campo: string, valor: any) => {
    await updateStatusMensal(mes, { [campo]: valor });
  };

  const getStatusMes = (mes: string) => {
    const status = statusMensal[mes];
    const dataFechamentoOk = status?.data_fechamento;
    const integracaoFiscalOk = status?.integracao_fiscal;
    const integracaoFopagOk = status?.integracao_fopag;
    const semMovimentoFopagOk = status?.sem_movimento_fopag;
    
    const totalCampos = 4;
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
    setMesArquivosAberto(mes);
  };

  const abrirModalAnotacoes = (mes: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMesAnotacoesAberto(mes);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                <p className="text-sm text-gray-600">{dadosEdicao.cnpj_cpf}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                {dadosEdicao.colaborador_responsavel}
              </Badge>
              <Badge variant="outline">
                {dadosEdicao.regime_tributario}
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
                    const status = statusMensal[mes];
                    
                    return (
                      <Card key={mes} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
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
                            <Select 
                              value={status?.forma_envio || ''} 
                              onValueChange={value => atualizarStatusMensal(mes, 'forma_envio', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Selecionar..." />
                              </SelectTrigger>
                              <SelectContent>
                                {formasEnvio.map(forma => (
                                  <SelectItem key={forma} value={forma}>{forma}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Data de Fechamento */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Data de Fechamento</Label>
                            <Input 
                              type="date" 
                              value={status?.data_fechamento || ''} 
                              onChange={e => atualizarStatusMensal(mes, 'data_fechamento', e.target.value)} 
                              className="h-8 text-xs" 
                            />
                          </div>

                          {/* Integrações */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`integracaoFiscal-${mes}`} 
                                checked={status?.integracao_fiscal || false} 
                                onCheckedChange={checked => atualizarStatusMensal(mes, 'integracao_fiscal', checked)} 
                              />
                              <Label htmlFor={`integracaoFiscal-${mes}`} className="text-xs">
                                Integração Fiscal
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`integracaoFopag-${mes}`} 
                                checked={status?.integracao_fopag || false} 
                                onCheckedChange={checked => atualizarStatusMensal(mes, 'integracao_fopag', checked)} 
                              />
                              <Label htmlFor={`integracaoFopag-${mes}`} className="text-xs">
                                Integração FOPAG
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`semMovimentoFopag-${mes}`} 
                                checked={status?.sem_movimento_fopag || false} 
                                onCheckedChange={checked => atualizarStatusMensal(mes, 'sem_movimento_fopag', checked)} 
                              />
                              <Label htmlFor={`semMovimentoFopag-${mes}`} className="text-xs">
                                Sem Movimento FOPAG
                              </Label>
                            </div>
                          </div>

                          {/* Botões de Ação */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Paperclip className="h-3 w-3" />
                              <span>0 arquivo(s)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={e => abrirModalArquivos(mes, e)} 
                                className="h-6 px-2 text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Arquivos
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={e => abrirModalAnotacoes(mes, e)} 
                                className="h-6 px-2 text-xs"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Nota
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
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
                    <Input 
                      id="nome" 
                      value={dadosEdicao.nome} 
                      onChange={e => setDadosEdicao(prev => ({
                        ...prev,
                        nome: e.target.value
                      }))} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cnpjCpf">CNPJ/CPF</Label>
                    <Input 
                      id="cnpjCpf" 
                      value={dadosEdicao.cnpj_cpf || ''} 
                      onChange={e => setDadosEdicao(prev => ({
                        ...prev,
                        cnpj_cpf: e.target.value
                      }))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regime">Regime Tributário</Label>
                    <Select 
                      value={dadosEdicao.regime_tributario} 
                      onValueChange={(value: any) => setDadosEdicao(prev => ({
                        ...prev,
                        regime_tributario: value
                      }))}
                    >
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
                    <Select 
                      value={dadosEdicao.colaborador_responsavel} 
                      onValueChange={(value: any) => setDadosEdicao(prev => ({
                        ...prev,
                        colaborador_responsavel: value
                      }))}
                    >
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
                    <Input 
                      id="dataEntrada" 
                      type="date" 
                      value={dadosEdicao.data_entrada || ''} 
                      onChange={e => setDadosEdicao(prev => ({
                        ...prev,
                        data_entrada: e.target.value
                      }))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataSaida">Data de Saída</Label>
                    <Input 
                      id="dataSaida" 
                      type="date" 
                      value={dadosEdicao.data_saida || ''} 
                      onChange={e => setDadosEdicao(prev => ({
                        ...prev,
                        data_saida: e.target.value
                      }))} 
                    />
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

      {/* Dialog para upload de arquivos */}
      <Dialog open={!!mesArquivosAberto} onOpenChange={() => setMesArquivosAberto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="capitalize flex items-center">
              <Upload className="h-5 w-5 mr-2 text-blue-600" />
              Upload de Arquivos - {mesArquivosAberto}
            </DialogTitle>
            <DialogDescription>
              Faça upload dos arquivos relacionados a este mês
            </DialogDescription>
          </DialogHeader>

          {mesArquivosAberto && (
            <div className="space-y-6">
              {/* Área de Upload */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8"
                onClick={handleClickDropzone}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                style={{ cursor: "pointer" }}
              >
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Clique para fazer upload ou arraste arquivos aqui
                    </span>
                    <input
                      ref={inputFileRef}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      // onChange={handleFileChange} // Use seu handler de upload aqui
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG, PDF até 10MB cada
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de arquivos (placeholder) */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Arquivos Enviados</Label>
                <div className="border rounded-lg p-4 text-center text-gray-500">
                  Nenhum arquivo enviado ainda
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setMesArquivosAberto(null)}
                >
                  Cancelar
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para anotações */}
      <Dialog open={!!mesAnotacoesAberto} onOpenChange={() => setMesAnotacoesAberto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="capitalize flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
              Anotações - {mesAnotacoesAberto}
            </DialogTitle>
            <DialogDescription>
              Adicione anotações e observações para este mês
            </DialogDescription>
          </DialogHeader>

          {mesAnotacoesAberto && (
            <div className="space-y-6">
              {/* Anotações */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Anotações</Label>
                <Textarea 
                  placeholder="Digite suas anotações para este mês..." 
                  value={statusMensal[mesAnotacoesAberto]?.anotacoes || ''} 
                  onChange={e => atualizarStatusMensal(mesAnotacoesAberto, 'anotacoes', e.target.value)} 
                  rows={6} 
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setMesAnotacoesAberto(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => setMesAnotacoesAberto(null)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Anotações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDetails;
