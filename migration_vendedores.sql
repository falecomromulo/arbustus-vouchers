-- ══════════════════════════════════════════════════════════════════
--  ARBUSTUS — MIGRATION: Vendedores + Rastreio de Emissão
--  Execute no Supabase: SQL Editor → New snippet → Run
--  Pode rodar com segurança mesmo com vouchers já existentes
-- ══════════════════════════════════════════════════════════════════

-- 1. TABELA DE VENDEDORES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendedores (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text NOT NULL,
  pin        text UNIQUE NOT NULL,          -- PIN de 4-6 dígitos (guardado como hash recomendado, aqui texto simples para MVP)
  ativo      boolean NOT NULL DEFAULT true,
  criado_em  timestamptz NOT NULL DEFAULT now()
);

-- 2. ADICIONAR COLUNA vendedor_id EM vouchers ────────────────────
ALTER TABLE vouchers
  ADD COLUMN IF NOT EXISTS vendedor_id uuid REFERENCES vendedores(id) ON DELETE SET NULL;

-- 3. ÍNDICES ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vendedores_pin       ON vendedores (pin);
CREATE INDEX IF NOT EXISTS idx_vendedores_ativo     ON vendedores (ativo);
CREATE INDEX IF NOT EXISTS idx_vouchers_vendedor    ON vouchers (vendedor_id);

-- 4. RLS PARA vendedores ──────────────────────────────────────────
ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendedores_leitura"
  ON vendedores FOR SELECT
  USING (true);

CREATE POLICY "vendedores_insercao"
  ON vendedores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "vendedores_update"
  ON vendedores FOR UPDATE
  USING (true);

CREATE POLICY "vendedores_delete"
  ON vendedores FOR DELETE
  USING (true);

-- 5. VIEW DE RELATÓRIO ────────────────────────────────────────────
-- Junta vendedores com seus vouchers para facilitar relatórios
CREATE OR REPLACE VIEW relatorio_vendedores AS
SELECT
  v.id                                              AS vendedor_id,
  v.nome                                            AS vendedor_nome,
  v.ativo,
  v.criado_em                                       AS vendedor_desde,
  COUNT(vo.id)                                      AS total_emitidos,
  COUNT(CASE WHEN vo.expiry > now() THEN 1 END)     AS total_validos,
  COUNT(CASE WHEN vo.expiry <= now() THEN 1 END)    AS total_expirados,
  MIN(vo.criado_em)                                 AS primeiro_voucher,
  MAX(vo.criado_em)                                 AS ultimo_voucher
FROM vendedores v
LEFT JOIN vouchers vo ON vo.vendedor_id = v.id
GROUP BY v.id, v.nome, v.ativo, v.criado_em
ORDER BY total_emitidos DESC;

-- 6. COMENTÁRIOS ──────────────────────────────────────────────────
COMMENT ON TABLE  vendedores          IS 'Vendedores autorizados a emitir vouchers';
COMMENT ON COLUMN vendedores.pin      IS 'PIN de acesso à página de emissão';
COMMENT ON COLUMN vendedores.ativo    IS 'false = bloqueado, não pode emitir';
COMMENT ON COLUMN vouchers.vendedor_id IS 'Quem emitiu este voucher';

-- 7. CONFIRMAR ────────────────────────────────────────────────────
SELECT 'vendedores OK' AS status, count(*) AS registros FROM vendedores
UNION ALL
SELECT 'vouchers OK',  count(*) FROM vouchers;
