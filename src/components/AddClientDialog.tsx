
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save } from "lucide-react";
import { Cliente } from "@/hooks/useClientes";
import { toast } from "@/hooks/use-toast";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => void;
}

const AddClientDialog = ({ open, onOpenChange, onAddCliente }: AddClientDialogProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj_cpf: '',
    regime_tributario: 'Simples Nacional' as const,
    colaborador_responsavel: 'Sheila' as const,
    data_entrada: '',
    data_saida: '',
    ativo: true
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      cnpj_cpf: '',
      regime_tributario: 'Simples Nacional',
      colaborador_responsavel: 'Sheila',
      data_entrada: '',
      data_saida: '',
      ativo: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Razão social é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    onAddCliente(formData);
    resetForm();
    onOpenChange(false);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2 text-red-600" />
            Adicionar Novo Cliente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações básicas do cliente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Razão Social *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Digite a razão social"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
              <Input
                id="cnpj_cpf"
                value={formData.cnpj_cpf}
                onChange={(e) => handleChange('cnpj_cpf', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regime">Regime Tributário</Label>
              <Select
                value={formData.regime_tributario}
                onValueChange={(value: any) => handleChange('regime_tributario', value)}
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
                value={formData.colaborador_responsavel}
                onValueChange={(value: any) => handleChange('colaborador_responsavel', value)}
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
              <Label htmlFor="data_entrada">Data de Entrada</Label>
              <Input
                id="data_entrada"
                type="date"
                value={formData.data_entrada}
                onChange={(e) => handleChange('data_entrada', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
