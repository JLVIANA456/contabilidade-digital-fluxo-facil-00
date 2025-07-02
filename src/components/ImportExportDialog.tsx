import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Cliente } from "@/pages/Index";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientes: Cliente[];
  onImportClientes: (clientes: Cliente[]) => void;
}

const ImportExportDialog = ({ open, onOpenChange, clientes, onImportClientes }: ImportExportDialogProps) => {
  const [arquivo, setArquivo] = useState<File | null>(null);

  const baixarModelo = () => {
    const cabecalho = ['Razão Social *'];
    const linhaExemplo = ['Empresa Exemplo Ltda'];

    // Criar CSV
    const csvContent = [
      cabecalho.join(','),
      linhaExemplo.join(',')
    ].join('\n');

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_clientes_contabilidade.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Modelo baixado com sucesso!",
      description: "Use este arquivo como base para importar seus clientes. Apenas Razão Social é obrigatória.",
    });
  };

  const exportarClientes = () => {
    if (clientes.length === 0) {
      toast({
        title: "Nenhum cliente para exportar",
        description: "Adicione clientes antes de fazer a exportação.",
        variant: "destructive",
      });
      return;
    }

    const cabecalho = [
      'Razão Social',
      'CNPJ/CPF', 
      'Regime Tributário',
      'Colaborador Responsável',
      'Data Entrada',
      'Data Saída'
    ];

    const linhas = clientes.map(cliente => [
      cliente.nome,
      cliente.cnpjCpf,
      cliente.regimeTributario,
      cliente.colaboradorResponsavel,
      cliente.dataEntrada || '',
      cliente.dataSaida || ''
    ]);

    const csvContent = [
      cabecalho.join(','),
      ...linhas.map(linha => linha.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Clientes exportados com sucesso!",
      description: `${clientes.length} clientes foram exportados.`,
    });
  };

  const importarClientes = async () => {
    if (!arquivo) {
      toast({
        title: "Selecione um arquivo",
        description: "Escolha um arquivo CSV para importar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const texto = await arquivo.text();
      const linhas = texto.split('\n');
      
      if (linhas.length < 2) {
        throw new Error('Arquivo deve conter pelo menos uma linha de dados além do cabeçalho');
      }

      // Pular o cabeçalho
      const dadosClientes = linhas.slice(1).filter(linha => linha.trim());
      
      const mesesDoAno = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      
      const clientesImportados: Cliente[] = dadosClientes.map((linha, index) => {
        const colunas = linha.split(',').map(col => col.trim().replace(/"/g, ''));
        
        // Validar apenas Razão Social como campo obrigatório
        if (!colunas[0]) {
          throw new Error(`Linha ${index + 2}: Razão Social é obrigatória`);
        }

        const statusMensalInicial = mesesDoAno.reduce((acc, mes) => {
          acc[mes] = {
            dataFechamento: null,
            integracaoFiscal: false,
            integracaoFopag: false,
            semMovimentoFopag: false,
            sm: false,
            formaEnvio: '',
            arquivos: [],
            anotacoes: ''
          };
          return acc;
        }, {} as Cliente['statusMensal']);

        return {
          id: Date.now().toString() + index,
          nome: colunas[0],
          cnpjCpf: '',
          regimeTributario: 'Simples Nacional' as any,
          colaboradorResponsavel: 'Sheila' as any,
          dataEntrada: '',
          dataSaida: '',
          ativo: true,
          statusMensal: statusMensalInicial
        };
      });

      onImportClientes([...clientes, ...clientesImportados]);
      setArquivo(null);
      onOpenChange(false);

      toast({
        title: "Importação concluída!",
        description: `${clientesImportados.length} clientes foram importados com sucesso.`,
      });

    } catch (error) {
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Verifique o formato do arquivo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center font-sans">
            <FileSpreadsheet className="h-5 w-5 mr-2 text-red-600" />
            Importar/Exportar Clientes
          </DialogTitle>
          <DialogDescription className="font-sans">
            Gerencie seus dados através de planilhas CSV
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exportar */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center font-sans">
                <Download className="h-4 w-4 mr-2 text-green-600" />
                Exportar
              </CardTitle>
              <CardDescription className="font-sans">
                Baixe seus dados ou um modelo em branco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={baixarModelo}
                variant="outline" 
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 font-sans transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Modelo
              </Button>
              
              <Button 
                onClick={exportarClientes}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 font-sans"
                disabled={clientes.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Clientes ({clientes.length})
              </Button>
            </CardContent>
          </Card>

          {/* Importar */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center font-sans">
                <Upload className="h-4 w-4 mr-2 text-red-600" />
                Importar
              </CardTitle>
              <CardDescription className="font-sans">
                Carregue uma planilha com dados dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="arquivo" className="font-sans">Selecionar Arquivo CSV</Label>
                <Input
                  id="arquivo"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  className="font-sans"
                />
              </div>
              
              <Button 
                onClick={importarClientes}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 font-sans"
                disabled={!arquivo}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Dados
              </Button>
            </CardContent>
          </Card>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="font-sans text-blue-800">
            <strong>Formato esperado:</strong> O arquivo CSV deve conter a coluna <strong>Razão Social *</strong> que é obrigatória. 
            Os demais campos serão preenchidos com valores padrão.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExportDialog;
