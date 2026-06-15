// ─── PROTEÇÃO POR SENHA — PÁGINAS ADMIN ──────────────────────────────────────
// Defina sua senha aqui. Para trocar: altere este valor e faça push no GitHub.
const SENHA_ADMIN = 'Arbustus@2026';

// Chave de sessão — não altere
const SESSION_KEY = 'arb_adm_auth';

// CSS da tela de login (injetado antes do body aparecer)
const LOGIN_CSS = `
  #login-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: #0B2E73;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    font-family: 'Montserrat', sans-serif;
  }
  #login-overlay::before {
    content: '';
    position: absolute; inset: 0;
    background:
      repeating-linear-gradient(90deg, rgba(255,255,255,.025) 0, rgba(255,255,255,.025) 1px, transparent 1px, transparent 48px),
      repeating-linear-gradient(0deg,  rgba(255,255,255,.015) 0, rgba(255,255,255,.015) 1px, transparent 1px, transparent 48px);
  }
  .login-box {
    background: #fff;
    border-radius: 20px;
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 380px;
    position: relative;
    z-index: 1;
    box-shadow: 0 24px 80px rgba(0,0,0,0.3);
    text-align: center;
  }
  .login-logo {
    margin: 0 auto 1.5rem;
    display: block;
  }
  .login-eyebrow {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 3px; color: #10B6AC; margin-bottom: 6px;
  }
  .login-title {
    font-size: 22px; font-weight: 900; color: #0B2E73;
    text-transform: uppercase; letter-spacing: -1px; margin-bottom: 4px;
  }
  .login-sub {
    font-size: 12px; color: #6B7A99; margin-bottom: 1.75rem; line-height: 1.5;
  }
  .login-field { margin-bottom: 1rem; position: relative; }
  .login-input {
    width: 100%;
    border: 2px solid #DDE3EE;
    border-radius: 10px;
    padding: 13px 44px 13px 14px;
    font-size: 16px;
    font-family: 'Montserrat', sans-serif;
    color: #1a1a2e;
    background: #F4F6F9;
    outline: none;
    letter-spacing: 2px;
    text-align: center;
    transition: border .2s, box-shadow .2s;
  }
  .login-input:focus {
    border-color: #10B6AC;
    box-shadow: 0 0 0 4px rgba(16,182,172,.12);
    background: #fff;
  }
  .login-toggle {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 4px;
    color: #6B7A99; font-size: 18px; line-height: 1;
    font-family: sans-serif;
  }
  .login-btn {
    width: 100%;
    padding: 14px;
    background: #1A5C3A;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'Montserrat', sans-serif;
    font-size: 13px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px;
    cursor: pointer;
    transition: all .2s;
    margin-top: 4px;
  }
  .login-btn:hover { background: #2E8B57; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,92,58,.28); }
  .login-btn:active { transform: none; }
  .login-error {
    background: #FDEDEC; color: #C0392B;
    border: 1px solid #F1948A;
    border-radius: 8px; padding: 10px 14px;
    font-size: 12px; font-weight: 600;
    margin-top: 10px; display: none;
  }
  .login-error.show { display: block; animation: shake .4s ease; }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60%  { transform: translateX(-6px); }
    40%,80%  { transform: translateX(6px); }
  }
  .login-attempts {
    font-size: 11px; color: #6B7A99; margin-top: 10px;
  }
`;

// ─── FUNÇÃO PRINCIPAL ─────────────────────────────────────────────────────────
function protegerPagina() {
  // Se já autenticado na sessão, libera imediatamente
  if (sessionStorage.getItem(SESSION_KEY) === 'ok') return;

  // Injeta CSS antes de qualquer render
  const style = document.createElement('style');
  style.textContent = LOGIN_CSS;
  document.head.appendChild(style);

  // Cria overlay de login
  const overlay = document.createElement('div');
  overlay.id = 'login-overlay';
  overlay.innerHTML = `
    <div class="login-box">
      <svg class="login-logo" width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="28" r="28" fill="#0B2E73"/>
        <circle cx="28" cy="28" r="22" fill="#2E8B57"/>
        <rect x="14" y="27" width="28" height="2.5" fill="rgba(255,255,255,0.55)" rx="1.25"/>
        <rect x="27" y="14" width="2.5" height="28" fill="rgba(255,255,255,0.55)" rx="1.25"/>
        <ellipse cx="28" cy="28" rx="8" ry="12" fill="none" stroke="rgba(255,255,255,0.38)" stroke-width="2"/>
        <circle cx="28" cy="28" r="4" fill="#fff"/>
      </svg>
      <div class="login-eyebrow">Área restrita</div>
      <div class="login-title">Acesso Admin</div>
      <div class="login-sub">Arbustus Gramados Sintéticos<br>Digite a senha para continuar</div>
      <div class="login-field">
        <input type="password" id="login-senha" class="login-input"
          placeholder="••••••••••••"
          onkeydown="if(event.key==='Enter')tentarLogin()"
          autocomplete="current-password">
        <button class="login-toggle" onclick="toggleSenha()" tabindex="-1" aria-label="Mostrar senha">👁</button>
      </div>
      <button class="login-btn" onclick="tentarLogin()">Entrar</button>
      <div class="login-error" id="login-error">Senha incorreta. Tente novamente.</div>
      <div class="login-attempts" id="login-attempts"></div>
    </div>
  `;

  // Aguarda o DOM estar pronto para inserir
  const inserir = () => {
    document.body.insertBefore(overlay, document.body.firstChild);
    setTimeout(() => document.getElementById('login-senha').focus(), 100);
  };

  if (document.body) {
    inserir();
  } else {
    document.addEventListener('DOMContentLoaded', inserir);
  }
}

let tentativas = 0;

function tentarLogin() {
  const input = document.getElementById('login-senha');
  const erro  = document.getElementById('login-error');
  const info  = document.getElementById('login-attempts');

  if (!input) return;
  const digitado = input.value;

  if (digitado === SENHA_ADMIN) {
    sessionStorage.setItem(SESSION_KEY, 'ok');
    const overlay = document.getElementById('login-overlay');
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .3s';
    setTimeout(() => overlay.remove(), 300);
    tentativas = 0;
  } else {
    tentativas++;
    input.value = '';
    erro.classList.add('show');
    setTimeout(() => erro.classList.remove('show'), 3000);

    if (tentativas >= 3) {
      info.textContent = `${tentativas} tentativas incorretas.`;
    }

    // Bloqueio temporário após 5 tentativas
    if (tentativas >= 5) {
      const btn = document.querySelector('.login-btn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Aguarde 30s…';
        info.textContent = 'Muitas tentativas. Aguarde 30 segundos.';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = 'Entrar';
          tentativas = 0;
          info.textContent = '';
        }, 30000);
      }
    }
  }
}

function toggleSenha() {
  const input = document.getElementById('login-senha');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  input.focus();
}

// Executa imediatamente ao carregar o script
protegerPagina();
