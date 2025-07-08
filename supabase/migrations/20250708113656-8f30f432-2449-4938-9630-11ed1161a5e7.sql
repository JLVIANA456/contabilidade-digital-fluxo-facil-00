
-- Adicionar coluna responsavel_fechamento na tabela status_mensal
ALTER TABLE public.status_mensal 
ADD COLUMN responsavel_fechamento text;

-- Opcional: Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.status_mensal.responsavel_fechamento IS 'Colaborador responsável pelo fechamento do mês específico';
