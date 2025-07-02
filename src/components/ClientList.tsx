
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, User, Building2, Calendar } from "lucide-react";
import { Cliente } from "@/pages/Index";
import { ClientActions } from "@/components/ClientActions";

interface ClientListProps {
  clientes: Cliente[];
  onClienteClick: (cliente: Cliente) => void;
}

const ClientList = ({ clientes, onClienteClick }: ClientListProps) => {
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
      <Card>
        <CardContent className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-600">Adicione seu primeiro cliente ou ajuste os filtros de busca.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clientes.map((cliente) => (
        <Card key={cliente.id} className={`hover:shadow-lg transition-shadow duration-200 border-l-4 ${cliente.ativo === false ? 'border-l-red-500 opacity-75' : 'border-l-green-500'}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {cliente.nome}
                  </h3>
                  <Badge variant="outline" className={getStatusColor(cliente.ativo)}>
                    {cliente.ativo !== false ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 font-mono">{cliente.cnpjCpf}</p>
                {cliente.dataSaida && (
                  <div className="flex items-center text-sm text-red-600 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Saída: {new Date(cliente.dataSaida).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <Badge variant="outline" className={getColaboradorColor(cliente.colaboradorResponsavel)}>
                  {cliente.colaboradorResponsavel}
                </Badge>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="h-4 w-4 mr-2" />
                <Badge variant="outline" className={getRegimeColor(cliente.regimeTributario)}>
                  {cliente.regimeTributario}
                </Badge>
              </div>

              {cliente.dataEntrada && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Entrada: {new Date(cliente.dataEntrada).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => onClienteClick(cliente)}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
              
              <ClientActions cliente={cliente} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientList;
