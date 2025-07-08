
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

      // Validar tipo de arquivo - INCLUINDO ARQUIVOS EXCEL
      const allowedTypes = [
        'application/pdf', 
        'image/jpeg', 
        'image/png', 
        'image/jpg',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
        'text/csv' // .csv
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não permitido",
          description: "Apenas PDF, JPG, PNG, XLSX, XLS, XLSM e CSV são aceitos",
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

      // Sanitizar nome do arquivo para evitar caracteres problemáticos
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Remove caracteres especiais
        .replace(/\s+/g, '_') // Remove espaços
        .replace(/_+/g, '_') // Remove underscores duplos
        .toLowerCase();

      // Gerar nome único e caminho seguro
      const timestamp = new Date().getTime();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = sanitizedFileName.split('.').pop();
      const fileName = `${timestamp}_${randomId}.${fileExtension}`;
      
      // Usar caminho mais simples e seguro
      const filePath = `arquivos/${fileName}`;

      console.log('Fazendo upload do arquivo:', {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type
      });

      // Upload para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cliente-arquivos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast({
          title: "Erro no upload",
          description: `Erro ao fazer upload: ${uploadError.message}`,
          variant: "destructive",
        });
        return null;
      }

      console.log('Upload realizado com sucesso:', uploadData);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('cliente-arquivos')
        .getPublicUrl(filePath);

      console.log('URL pública gerada:', publicUrl);

      // Salvar metadados na tabela arquivos
      const { data: arquivoData, error: dbError } = await supabase
        .from('arquivos')
        .insert([{
          status_mensal_id: statusMensalId,
          nome_arquivo: file.name, // Manter nome original para exibição
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
          description: `Erro na base de dados: ${dbError.message}`,
          variant: "destructive",
        });
        return null;
      }

      console.log('Metadados salvos com sucesso:', arquivoData);

      // Atualizar lista local
      setArquivos(prev => [arquivoData, ...prev]);
      
      toast({
        title: "Arquivo enviado com sucesso!",
        description: `${file.name} foi salvo.`,
      });

      return arquivoData;
    } catch (error) {
      console.error('Erro inesperado no upload:', error);
      toast({
        title: "Erro inesperado",
        description: `Erro no upload do arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteArquivo = async (arquivo: Arquivo) => {
    try {
      // Extrair caminho do arquivo da URL
      let pathToDelete = '';
      if (arquivo.url_arquivo) {
        const url = new URL(arquivo.url_arquivo);
        const pathParts = url.pathname.split('/');
        // Pegar a parte após 'cliente-arquivos'
        const bucketIndex = pathParts.findIndex(part => part === 'cliente-arquivos');
        if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
          pathToDelete = pathParts.slice(bucketIndex + 1).join('/');
        }
      }

      console.log('Deletando arquivo do storage:', pathToDelete);

      // Remover do storage se temos o caminho
      if (pathToDelete) {
        const { error: storageError } = await supabase.storage
          .from('cliente-arquivos')
          .remove([pathToDelete]);
        
        if (storageError) {
          console.warn('Erro ao remover do storage:', storageError);
        }
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
      console.error('Erro inesperado ao deletar:', error);
      toast({
        title: "Erro inesperado",
        description: `Erro ao excluir arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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
