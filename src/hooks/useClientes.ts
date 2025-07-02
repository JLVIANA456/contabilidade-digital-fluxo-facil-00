
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Cliente {
  id: string;
  nome: string;
  cnpj_cpf: string | null;
  regime_tributario: 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';
  colaborador_responsavel: 'Sheila' | 'Bruna' | 'Nilcea' | 'Natiele';
  data_entrada: string | null;
  data_saida: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatusMensal {
  id: string;
  cliente_id: string;
  mes: string;
  ano: number;
  data_fechamento: string | null;
  integracao_fiscal: boolean;
  integracao_fopag: boolean;
  sem_movimento_fopag: boolean;
  sm: boolean;
  forma_envio: string | null;
  anotacoes: string | null;
  created_at: string;
  updated_at: string;
}

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar clientes:', error);
        toast({
          title: "Erro ao carregar clientes",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setClientes(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao carregar clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCliente = async (novoCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          nome: novoCliente.nome,
          cnpj_cpf: novoCliente.cnpj_cpf,
          regime_tributario: novoCliente.regime_tributario,
          colaborador_responsavel: novoCliente.colaborador_responsavel,
          data_entrada: novoCliente.data_entrada,
          data_saida: novoCliente.data_saida,
          ativo: novoCliente.ativo
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar cliente:', error);
        toast({
          title: "Erro ao adicionar cliente",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      // Criar status mensal para todos os meses do ano
      const mesesDoAno = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      
      const statusMensalData = mesesDoAno.map(mes => ({
        cliente_id: data.id,
        mes,
        ano: new Date().getFullYear(),
        data_fechamento: null,
        integracao_fiscal: false,
        integracao_fopag: false,
        sem_movimento_fopag: false,
        sm: false,
        forma_envio: '',
        anotacoes: ''
      }));

      await supabase
        .from('status_mensal')
        .insert(statusMensalData);

      setClientes(prev => [...prev, data]);
      
      toast({
        title: "Cliente adicionado com sucesso!",
        description: `${data.nome} foi cadastrado.`,
      });

      return data;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao adicionar cliente",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCliente = async (cliente: Cliente) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          nome: cliente.nome,
          cnpj_cpf: cliente.cnpj_cpf,
          regime_tributario: cliente.regime_tributario,
          colaborador_responsavel: cliente.colaborador_responsavel,
          data_entrada: cliente.data_entrada,
          data_saida: cliente.data_saida,
          ativo: cliente.ativo
        })
        .eq('id', cliente.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        toast({
          title: "Erro ao atualizar cliente",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setClientes(prev => prev.map(c => c.id === cliente.id ? data : c));
      
      toast({
        title: "Cliente atualizado com sucesso!",
        description: `${data.nome} foi atualizado.`,
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao atualizar cliente",
        variant: "destructive",
      });
    }
  };

  const deleteCliente = async (clienteId: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId);

      if (error) {
        console.error('Erro ao excluir cliente:', error);
        toast({
          title: "Erro ao excluir cliente",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setClientes(prev => prev.filter(c => c.id !== clienteId));
      
      toast({
        title: "Cliente excluído com sucesso!",
        description: "Cliente foi removido do sistema.",
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao excluir cliente",
        variant: "destructive",
      });
    }
  };

  const inactivateCliente = async (clienteId: string, dataSaida: string) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          ativo: false,
          data_saida: dataSaida
        })
        .eq('id', clienteId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao inativar cliente:', error);
        toast({
          title: "Erro ao inativar cliente",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setClientes(prev => prev.map(c => c.id === clienteId ? data : c));
      
      toast({
        title: "Cliente inativado com sucesso!",
        description: `Cliente foi inativado com data de saída ${new Date(dataSaida).toLocaleDateString('pt-BR')}.`,
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao inativar cliente",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    loading,
    addCliente,
    updateCliente,
    deleteCliente,
    inactivateCliente,
    refetch: fetchClientes
  };
};
