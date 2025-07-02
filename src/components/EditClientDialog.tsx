
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { Cliente } from "@/hooks/useClientes";

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  onUpdateCliente: (cliente: Cliente) => Promise<void>;
}

const EditClientDialog = ({
  open,
  onOpenChange,
  cliente,
  onUpdateCliente
}: EditClientDialogProps) => {
  const [dadosEdicao, setDadosEdicao] = useState<Cliente | null>(cliente);
  const [salvando, setSalvando] = useState(false);

  // Atualizar dados quando o cliente muda
  useState(() => {
    setDadosEdicao(cliente);
  }, [cliente]);

  const handleSalvar = async () => {
    if (!dadosEdicao) return;

    setSalvando(true);
    try {
      await onUpdateCliente(dadosEdicao);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setSalvando(false);
    }
  };

  if (!dadosEdicao) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Edite as informações do cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome/Razão Social</Label>
            <Input
              id="nome"
              value={dadosEdicao.nome}
              onChange={e => setDadosEdicao(prev => prev ? {
                ...prev,
                nome: e.target.value
              } : null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ/CPF</Label>
            <Input
              id="cnpj"
              value={dadosEdicao.cnpj_cpf || ''}
              onChange={e => setDadosEdicao(prev => prev ? {
                ...prev,
                cnpj_cpf: e.target.value
              } : null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regime">Regime Tributário</Label>
            <Select
              value={dadosEdicao.regime_tributario}
              onValueChange={(value: any) => setDadosEdicao(prev => prev ? {
                ...prev,
                regime_tributario: value
              } : null)}
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
              onValueChange={(value: any) => setDadosEdicao(prev => prev ? {
                ...prev,
                colaborador_responsavel: value
              } : null)}
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
              onChange={e => setDadosEdicao(prev => prev ? {
                ...prev,
                data_entrada: e.target.value
              } : null)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={dadosEdicao.ativo}
              onCheckedChange={checked => setDadosEdicao(prev => prev ? {
                ...prev,
                ativo: checked
              } : null)}
            />
            <Label htmlFor="ativo">Cliente Ativo</Label>
          </div>

          {!dadosEdicao.ativo && (
            <div className="space-y-2">
              <Label htmlFor="dataSaida">Data de Saída</Label>
              <Input
                id="dataSaida"
                type="date"
                value={dadosEdicao.data_saida || ''}
                onChange={e => setDadosEdicao(prev => prev ? {
                  ...prev,
                  data_saida: e.target.value
                } : null)}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSalvar}
            disabled={salvando}
            className="bg-red-600 hover:bg-red-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
