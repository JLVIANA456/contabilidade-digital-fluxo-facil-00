
-- Criar enum para regime tributário
CREATE TYPE public.regime_tributario AS ENUM ('Simples Nacional', 'Lucro Presumido', 'Lucro Real');

-- Criar enum para colaboradores responsáveis
CREATE TYPE public.colaborador_responsavel AS ENUM ('Sheila', 'Bruna', 'Nilcea', 'Natiele');

-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj_cpf TEXT,
  regime_tributario regime_tributario NOT NULL DEFAULT 'Simples Nacional',
  colaborador_responsavel colaborador_responsavel NOT NULL DEFAULT 'Sheila',
  data_entrada DATE,
  data_saida DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de status mensal
CREATE TABLE public.status_mensal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  mes TEXT NOT NULL, -- janeiro, fevereiro, março, etc.
  ano INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  data_fechamento DATE,
  integracao_fiscal BOOLEAN NOT NULL DEFAULT false,
  integracao_fopag BOOLEAN NOT NULL DEFAULT false,
  sem_movimento_fopag BOOLEAN NOT NULL DEFAULT false,
  sm BOOLEAN NOT NULL DEFAULT false,
  forma_envio TEXT DEFAULT '',
  anotacoes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cliente_id, mes, ano)
);

-- Criar tabela de arquivos
CREATE TABLE public.arquivos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status_mensal_id UUID REFERENCES public.status_mensal(id) ON DELETE CASCADE NOT NULL,
  nome_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT,
  tamanho_arquivo BIGINT,
  url_arquivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Desabilitar RLS em todas as tabelas
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_mensal DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.arquivos DISABLE ROW LEVEL SECURITY;

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar updated_at
CREATE TRIGGER clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER status_mensal_updated_at
  BEFORE UPDATE ON public.status_mensal
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Criar índices para melhor performance
CREATE INDEX idx_clientes_ativo ON public.clientes(ativo);
CREATE INDEX idx_clientes_colaborador ON public.clientes(colaborador_responsavel);
CREATE INDEX idx_status_mensal_cliente_mes ON public.status_mensal(cliente_id, mes, ano);
CREATE INDEX idx_arquivos_status_mensal ON public.arquivos(status_mensal_id);
