
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Arquivo {
  id: string;
  status_mensal_id: string;
  nome_arquivo: string;
  tipo_arquivo: string | null;
  tamanho_arquivo: number | null;
  url_arquivo: string | null;
  created_at: string;
}

export const useArquivos = (statusMensalId: string | null) => {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchArquivos = async () => {
    if (!statusMensalId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('arquivos')
        .select('*')
        .eq('status_mensal_id', statusMensalId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar arquivos:', error);
        toast({
          title: "Erro ao carregar arquivos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setArquivos(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao carregar arquivos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadArquivo = async (file: File, statusMensalId: string) => {
    try {
      setUploading(true);

      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não permitido",
          description: "Apenas PDF, JPG e PNG são aceitos",
          variant: "destructive",
        });
        return null;
      }

      // Validar tamanho (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive",
        });
        return null;
      }

      // Gerar nome único para o arquivo
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `${statusMensalId}/${fileName}`;

      // Upload para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cliente-arquivos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast({
          title: "Erro no upload",
          description: uploadError.message,
          variant: "destructive",
        });
        return null;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('cliente-arquivos')
        .getPublicUrl(filePath);

      // Salvar metadados na tabela arquivos
      const { data: arquivoData, error: dbError } = await supabase
        .from('arquivos')
        .insert([{
          status_mensal_id: statusMensalId,
          nome_arquivo: file.name,
          tipo_arquivo: file.type,
          tamanho_arquivo: file.size,
          url_arquivo: publicUrl
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Erro ao salvar metadados:', dbError);
        // Remover arquivo do storage se falhou salvar metadados
        await supabase.storage
          .from('cliente-arquivos')
          .remove([filePath]);
        
        toast({
          title: "Erro ao salvar arquivo",
          description: dbError.message,
          variant: "destructive",
        });
        return null;
      }

      // Atualizar lista local
      setArquivos(prev => [arquivoData, ...prev]);
      
      toast({
        title: "Arquivo enviado com sucesso!",
        description: `${file.name} foi salvo.`,
      });

      return arquivoData;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro no upload do arquivo",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteArquivo = async (arquivo: Arquivo) => {
    try {
      // Remover do storage
      if (arquivo.url_arquivo) {
        const path = arquivo.url_arquivo.split('/').slice(-2).join('/');
        await supabase.storage
          .from('cliente-arquivos')
          .remove([path]);
      }

      // Remover da tabela
      const { error } = await supabase
        .from('arquivos')
        .delete()
        .eq('id', arquivo.id);

      if (error) {
        console.error('Erro ao excluir arquivo:', error);
        toast({
          title: "Erro ao excluir arquivo",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Atualizar lista local
      setArquivos(prev => prev.filter(a => a.id !== arquivo.id));
      
      toast({
        title: "Arquivo excluído com sucesso!",
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao excluir arquivo",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchArquivos();
  }, [statusMensalId]);

  return {
    arquivos,
    loading,
    uploading,
    uploadArquivo,
    deleteArquivo,
    refetch: fetchArquivos
  };
};
