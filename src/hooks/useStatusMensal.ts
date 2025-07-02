
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StatusMensal } from './useClientes';

export const useStatusMensal = (clienteId: string) => {
  const [statusMensal, setStatusMensal] = useState<Record<string, StatusMensal>>({});
  const [loading, setLoading] = useState(true);

  const fetchStatusMensal = async () => {
    if (!clienteId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('status_mensal')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('ano', new Date().getFullYear());

      if (error) {
        console.error('Erro ao carregar status mensal:', error);
        toast({
          title: "Erro ao carregar status mensal",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const statusRecord: Record<string, StatusMensal> = {};
      data.forEach(item => {
        statusRecord[item.mes] = item;
      });

      setStatusMensal(statusRecord);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao carregar status mensal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatusMensal = async (mes: string, updates: Partial<StatusMensal>) => {
    try {
      const existingStatus = statusMensal[mes];
      
      if (existingStatus) {
        const { data, error } = await supabase
          .from('status_mensal')
          .update(updates)
          .eq('id', existingStatus.id)
          .select()
          .single();

        if (error) {
          console.error('Erro ao atualizar status mensal:', error);
          toast({
            title: "Erro ao atualizar status mensal",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setStatusMensal(prev => ({
          ...prev,
          [mes]: data
        }));
      } else {
        const { data, error } = await supabase
          .from('status_mensal')
          .insert([{
            cliente_id: clienteId,
            mes,
            ano: new Date().getFullYear(),
            ...updates
          }])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar status mensal:', error);
          toast({
            title: "Erro ao criar status mensal",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setStatusMensal(prev => ({
          ...prev,
          [mes]: data
        }));
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao atualizar status mensal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStatusMensal();
  }, [clienteId]);

  return {
    statusMensal,
    loading,
    updateStatusMensal,
    refetch: fetchStatusMensal
  };
};
