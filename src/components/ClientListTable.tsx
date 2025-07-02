
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar } from "lucide-react";
import { Cliente } from "@/pages/Index";

interface ClientListTableProps {
  clientes: Cliente[];
  onClienteClick: (cliente: Cliente) => void;
}

const ClientListTable = ({ clientes, onClienteClick }: ClientListTableProps) => {
  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'Simples Nacional':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Lucro Presumido':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Lucro Real':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getColaboradorColor = (colaborador: string) => {
    const colors = {
      'Sheila': 'bg-red-100 text-red-800 border-red-200',
      'Bruna': 'bg-pink-100 text-pink-800 border-pink-200',
      'Nilcea': 'bg-orange-100 text-orange-800 border-orange-200',
      'Natiele': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[colaborador as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (ativo: boolean) => {
    return ativo !== false 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  if (clientes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente cadastrado</h3>
        <p className="text-gray-600">Os clientes aparecerão aqui após serem cadastrados.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-900">Cliente</TableHead>
            <TableHead className="font-semibold text-gray-900">CNPJ/CPF</TableHead>
            <TableHead className="font-semibold text-gray-900">Regime</TableHead>
            <TableHead className="font-semibold text-gray-900">Colaborador</TableHead>
            <TableHead className="font-semibold text-gray-900">Status</TableHead>
            <TableHead className="font-semibold text-gray-900">Data Entrada</TableHead>
            <TableHead className="font-semibold text-gray-900 text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{cliente.nome}</div>
                  {cliente.dataSaida && (
                    <div className="flex items-center text-sm text-red-600 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Saída: {new Date(cliente.dataSaida).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm">{cliente.cnpjCpf}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getRegimeColor(cliente.regimeTributario)}>
                  {cliente.regimeTributario}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getColaboradorColor(cliente.colaboradorResponsavel)}>
                  {cliente.colaboradorResponsavel}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(cliente.ativo)}>
                  {cliente.ativo !== false ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {cliente.dataEntrada ? new Date(cliente.dataEntrada).toLocaleDateString('pt-BR') : '-'}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Button 
                  onClick={() => onClienteClick(cliente)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientListTable;
