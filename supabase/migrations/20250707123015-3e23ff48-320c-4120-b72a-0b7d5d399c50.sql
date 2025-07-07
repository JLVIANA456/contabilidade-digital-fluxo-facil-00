
-- Criar bucket de storage para arquivos dos clientes
INSERT INTO storage.buckets (id, name, public)
VALUES ('cliente-arquivos', 'cliente-arquivos', true);

-- Política para permitir que qualquer um possa visualizar os arquivos (público)
CREATE POLICY "Arquivos públicos para visualização" ON storage.objects
FOR SELECT USING (bucket_id = 'cliente-arquivos');

-- Política para permitir upload de arquivos
CREATE POLICY "Permitir upload de arquivos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'cliente-arquivos');

-- Política para permitir atualização de arquivos
CREATE POLICY "Permitir atualização de arquivos" ON storage.objects
FOR UPDATE USING (bucket_id = 'cliente-arquivos');

-- Política para permitir exclusão de arquivos
CREATE POLICY "Permitir exclusão de arquivos" ON storage.objects
FOR DELETE USING (bucket_id = 'cliente-arquivos');
