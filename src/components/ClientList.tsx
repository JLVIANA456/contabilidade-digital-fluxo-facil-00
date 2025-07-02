
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User, Building2, Edit, Eye } from "lucide-react";
import { Cliente } from "@/hooks/useClientes";

interface ClientListProps {
  clientes: Cliente[];
  onClienteClick: (cliente: Cliente) => void;
  onEditCliente?: (cliente: Cliente) => void;
}

const ClientList = ({ clientes, onClienteClick, onEditCliente }: ClientListProps) => {
  if (clientes.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-black/80 dark:border dark:border-red-900">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center font-sans">
            Nenhum cliente encontrado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-black/80 dark:border dark:border-red-900">
      <CardHeader>
        <CardTitle className="text-gray-900 font-sans font-light text-xl dark:text-red-500">
          Clientes ({clientes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clientes.map((cliente) => (
            <div
              key={cliente.id}
              className="group p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all duration-200 dark:bg-black/50 dark:border-red-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900 font-sans dark:text-red-500">
                      {cliente.nome}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={cliente.ativo 
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100" 
                        : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100"
                      }
                    >
                      {cliente.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-red-400">
                    {cliente.cnpj_cpf && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="font-sans">{cliente.cnpj_cpf}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span className="font-sans">{cliente.regime_tributario}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="font-sans">{cliente.colaborador_responsavel}</span>
                    </div>
                  </div>
                  
                  {cliente.data_entrada && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 dark:text-red-400">
                      <Calendar className="h-3 w-3" />
                      <span className="font-sans">
                        Entrada: {new Date(cliente.data_entrada).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEditCliente && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCliente(cliente);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onClienteClick(cliente)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientList;
