// ─── CONFIGURAÇÃO SUPABASE ────────────────────────────────────────────────────
// Substitua os valores abaixo após criar o projeto no Supabase
const SUPA_URL  = 'https://nfvrblbpaqbgmsxobgbj.supabase.co';       // ex: https://xyzabc.supabase.co
const SUPA_KEY  = 'sb_publishable_K4dlufSe2SQZClDa1GAcfw_LfAOVkRh';           // chave anon/public

// ─── CLIENTE REST SUPABASE ────────────────────────────────────────────────────
const supa = {
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPA_KEY,
    'Authorization': `Bearer ${SUPA_KEY}`,
    'Prefer': 'return=representation',
  },

  async select(tabela, params = '') {
    const r = await fetch(`${SUPA_URL}/rest/v1/${tabela}?${params}`, {
      headers: this.headers,
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },

  async insert(tabela, dados) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${tabela}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(dados),
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },

  async update(tabela, filtro, dados) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${tabela}?${filtro}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(dados),
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },

  async delete(tabela, filtro) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${tabela}?${filtro}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!r.ok) throw await r.json();
    return true;
  },
};

// ─── HELPERS GLOBAIS ──────────────────────────────────────────────────────────
function genCodigo(lista) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c;
  do {
    c = 'ARB-';
    for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  } while (lista.find(v => v.codigo === c));
  return c;
}

function expiryFromQtd(qtd, unit) {
  const ms = unit === 'd' ? 86400000 : unit === 'h' ? 3600000 : 60000;
  return new Date(Date.now() + qtd * ms).toISOString();
}

function isExpirado(expiryIso) {
  return new Date(expiryIso) < new Date();
}

function tempoRestante(expiryIso) {
  const diff = Math.max(0, new Date(expiryIso) - Date.now());
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return { txt: `${d}`, unit: `dia${d !== 1 ? 's' : ''}`, raw: diff };
  if (h > 0) return { txt: `${h}h ${m}m`, unit: '', raw: diff };
  return { txt: `${m}m ${sec}s`, unit: '', raw: diff };
}

function progressoPct(criadoIso, expiryIso) {
  const total   = new Date(expiryIso) - new Date(criadoIso);
  const restante = new Date(expiryIso) - Date.now();
  return Math.min(100, Math.max(0, (restante / total) * 100));
}

function corPct(pct) {
  return pct > 50 ? '#2E8B57' : pct > 20 ? '#C8941A' : '#C0392B';
}

function toast(msg, tipo = 'ok') {
  let el = document.getElementById('toast-global');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast-global';
    el.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(20px);padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;font-family:Montserrat,sans-serif;opacity:0;transition:all .3s;pointer-events:none;z-index:9999;white-space:nowrap;letter-spacing:.3px';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = tipo === 'erro' ? '#8B1A1A' : '#0B2E73';
  el.style.color = '#fff';
  el.classList.remove('_show');
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2800);
}

// CSS base compartilhado — injetado via <style> em cada página
const CSS_BASE = `
  :root {
    --azul: #0B2E73;
    --verde: #2E8B57;
    --verde-escuro: #1A5C3A;
    --teal: #10B6AC;
    --teal-escuro: #007A87;
    --dourado: #C8941A;
    --cinza-claro: #F4F6F9;
    --cinza-borda: #DDE3EE;
    --cinza-texto: #6B7A99;
    --perigo: #C0392B;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Montserrat', sans-serif; background: var(--cinza-claro); color: #1a1a2e; min-height: 100vh; }
  a { text-decoration: none; }

  /* HEADER */
  header { background: var(--azul); padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 16px rgba(11,46,115,.20); position: sticky; top: 0; z-index: 100; }
  .logo-wrap { display: flex; align-items: center; gap: 11px; }
  .logo-symbol { width: 40px; height: 40px; flex-shrink: 0; }
  .logo-brand { font-size: 18px; font-weight: 900; color: #fff; font-style: italic; letter-spacing: -.5px; text-transform: uppercase; display: block; line-height: 1; }
  .logo-sub { font-size: 9px; font-weight: 600; color: var(--teal); text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-top: 2px; }
  .nav-btn { color: rgba(255,255,255,.65); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .6px; padding: 6px 13px; border: 1px solid rgba(255,255,255,.18); border-radius: 6px; transition: all .2s; font-family: 'Montserrat',sans-serif; background: transparent; cursor: pointer; }
  .nav-btn:hover { color: #fff; border-color: var(--teal); background: rgba(16,182,172,.1); }

  /* HERO STRIP */
  .hero-strip { background: linear-gradient(135deg, var(--azul) 0%, var(--verde-escuro) 100%); padding: 2.5rem 1.5rem 2rem; text-align: center; position: relative; overflow: hidden; }
  .hero-strip::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 48px); }
  .hero-eyebrow { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: var(--teal); margin-bottom: 8px; position: relative; }
  .hero-h1 { font-size: clamp(22px,4vw,36px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: -1.5px; line-height: .9; position: relative; }
  .hero-h1 em { color: var(--teal); font-style: normal; }

  /* CARD */
  .card { background: #fff; border: 1px solid var(--cinza-borda); border-radius: 16px; padding: 1.75rem; box-shadow: 0 2px 24px rgba(11,46,115,.05); }
  .card-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--cinza-texto); margin-bottom: 1.25rem; padding-bottom: .75rem; border-bottom: 1px solid var(--cinza-borda); }

  /* FORM */
  .field { margin-bottom: 1rem; }
  .field label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: var(--azul); margin-bottom: 6px; }
  .field input, .field select, .field textarea { width: 100%; border: 1.5px solid var(--cinza-borda); border-radius: 8px; padding: 11px 14px; font-size: 14px; font-family: 'Montserrat',sans-serif; color: #1a1a2e; background: #fff; outline: none; transition: border .2s, box-shadow .2s; }
  .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(16,182,172,.12); }
  .field textarea { resize: vertical; min-height: 70px; }
  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* BUTTONS */
  .btn { width: 100%; padding: 13px; border: none; border-radius: 10px; font-family: 'Montserrat',sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: all .2s; }
  .btn-primary { background: var(--verde-escuro); color: #fff; }
  .btn-primary:hover { background: var(--verde); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,92,58,.28); }
  .btn-primary:active { transform: none; }
  .btn-blue { background: var(--azul); color: #fff; }
  .btn-blue:hover { background: #0d3899; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(11,46,115,.28); }
  .btn[disabled] { opacity: .5; cursor: not-allowed; transform: none !important; }

  /* ALERTS */
  .alert { border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 500; margin-bottom: 1rem; }
  .alert-error { background: #FDEDEC; color: var(--perigo); border: 1px solid #F1948A; }
  .alert-success { background: #E8F8F0; color: var(--verde-escuro); border: 1px solid #97C459; }

  /* BADGE */
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
  .badge-valid { background: #D4F4E2; color: var(--verde-escuro); }
  .badge-expired { background: #FEE2E2; color: #8B1A1A; }

  /* LOADING SPINNER */
  .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; vertical-align: -4px; margin-right: 6px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* FOOTER */
  footer { text-align: center; padding: 2rem; font-size: 11px; color: var(--cinza-texto); font-weight: 500; text-transform: uppercase; letter-spacing: .5px; border-top: 1px solid var(--cinza-borda); margin-top: auto; }
  footer em { color: var(--verde); font-style: normal; }

  main { max-width: 580px; margin: 0 auto; padding: 2rem 1rem 3rem; }
  main.wide { max-width: 960px; }

  @media(max-width:480px) { .row-2 { grid-template-columns: 1fr; } }
`;
