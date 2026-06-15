-- ══════════════════════════════════════════════════════════════════
--  ARBUSTUS GRAMADOS SINTÉTICOS — Sistema de Vouchers
--  Execute este SQL no Supabase SQL Editor
--  Dashboard → SQL Editor → New query → cole e clique em Run
-- ══════════════════════════════════════════════════════════════════

-- 1. TABELA PRINCIPAL
CREATE TABLE IF NOT EXISTS vouchers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      text UNIQUE NOT NULL,
  nome        text NOT NULL,
  descricao   text NOT NULL,
  observacao  text,
  expiry      timestamptz NOT NULL,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- 2. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_vouchers_codigo  ON vouchers (codigo);
CREATE INDEX IF NOT EXISTS idx_vouchers_expiry  ON vouchers (expiry);
CREATE INDEX IF NOT EXISTS idx_vouchers_criado  ON vouchers (criado_em DESC);

-- 3. ROW LEVEL SECURITY
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Leitura pública: qualquer pessoa com a URL pode consultar pelo código
CREATE POLICY "leitura_publica"
  ON vouchers FOR SELECT
  USING (true);

-- Inserção e exclusão restritas à chave anon (apenas quem tem o site admin)
-- Para produção, troque pela service_role key no admin.html
CREATE POLICY "insercao_publica"
  ON vouchers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "exclusao_publica"
  ON vouchers FOR DELETE
  USING (true);

-- 4. COMENTÁRIOS
COMMENT ON TABLE  vouchers             IS 'Vouchers emitidos pela Arbustus Gramados Sintéticos';
COMMENT ON COLUMN vouchers.codigo      IS 'Código único no formato ARB-XXXXXX';
COMMENT ON COLUMN vouchers.nome        IS 'Nome do cliente';
COMMENT ON COLUMN vouchers.descricao   IS 'Serviço ou produto contemplado';
COMMENT ON COLUMN vouchers.observacao  IS 'Condições especiais (opcional)';
COMMENT ON COLUMN vouchers.expiry      IS 'Data/hora de expiração (UTC)';
COMMENT ON COLUMN vouchers.criado_em   IS 'Data/hora de emissão (UTC)';

-- ── Confirme rodando: ──────────────────────────────────────────────
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'vouchers'
ORDER BY ordinal_position;
