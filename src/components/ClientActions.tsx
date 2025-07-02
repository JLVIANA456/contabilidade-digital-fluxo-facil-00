
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserX, Trash2 } from "lucide-react";
import { Cliente, useClientes } from "@/hooks/useClientes";
import { useToast } from "@/hooks/use-toast";

interface ClientActionsProps {
  cliente: Cliente;
}

export function ClientActions({ cliente }: ClientActionsProps) {
  const { deleteCliente, inactivateCliente } = useClientes();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInactivateDialog, setShowInactivateDialog] = useState(false);
  const [dataSaida, setDataSaida] = useState("");

  const handleDelete = async () => {
    await deleteCliente(cliente.id);
    setShowDeleteDialog(false);
  };

  const handleInactivate = async () => {
    if (!dataSaida) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, informe a data de saída do cliente.",
        variant: "destructive",
      });
      return;
    }

    await inactivateCliente(cliente.id, dataSaida);
    setShowInactivateDialog(false);
    setDataSaida("");
  };

  if (!cliente.ativo) {
    return (
      <div className="flex gap-2">
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Excluir Cliente
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowInactivateDialog(true)}
          className="flex items-center gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
        >
          <UserX className="h-4 w-4" />
          Inativar Cliente
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Excluir Cliente
        </Button>
      </div>

      {/* Dialog para inativar cliente */}
      <Dialog open={showInactivateDialog} onOpenChange={setShowInactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inativar Cliente</DialogTitle>
            <DialogDescription>
              Informe a data de saída do cliente {cliente.nome}. O cliente será marcado como inativo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dataSaida">Data de Saída</Label>
              <Input
                id="dataSaida"
                type="date"
                value={dataSaida}
                onChange={(e) => setDataSaida(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInactivateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInactivate} className="bg-orange-600 hover:bg-orange-700">
              Inativar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para excluir cliente */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente o cliente {cliente.nome}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
