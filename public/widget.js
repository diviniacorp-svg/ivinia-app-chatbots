/**
 * DIVINIA Chatbot Widget
 * Uso: <script src="https://tu-app.vercel.app/widget.js" data-id="CHATBOT_ID" defer></script>
 */
(function () {
  const script = document.currentScript || document.querySelector('script[data-id]');
  if (!script) return;

  const chatbotId = script.getAttribute('data-id');
  if (!chatbotId) return;

  const baseUrl = script.src.replace('/widget.js', '');

  // Estilos
  const style = document.createElement('style');
  style.textContent = `
    #divinia-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #divinia-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 60px; height: 60px; border-radius: 50%; cursor: pointer;
      border: none; display: flex; align-items: center; justify-content: center;
      font-size: 26px; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      transition: transform 0.2s; color: white;
    }
    #divinia-btn:hover { transform: scale(1.08); }
    #divinia-window {
      position: fixed; bottom: 96px; right: 24px; z-index: 9998;
      width: 360px; height: 480px; border-radius: 16px; overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18); display: none; flex-direction: column;
      background: #fff; transition: opacity 0.2s;
    }
    #divinia-window.open { display: flex; }
    #divinia-header {
      padding: 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    #divinia-header .avatar {
      width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    #divinia-header .info p { margin: 0; }
    #divinia-header .name { font-weight: 700; font-size: 14px; color: white; }
    #divinia-header .status { font-size: 12px; color: rgba(255,255,255,0.75); display: flex; align-items: center; gap: 4px; }
    #divinia-header .dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; }
    #divinia-messages {
      flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px;
      background: #f8f9fa;
    }
    .divinia-msg { max-width: 82%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
    .divinia-msg.bot { background: white; color: #1a1a1a; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .divinia-msg.user { color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
    .divinia-msg.typing { background: white; color: #999; font-style: italic; align-self: flex-start; }
    #divinia-input-area {
      padding: 12px; border-top: 1px solid #eee; display: flex; gap: 8px; background: white; flex-shrink: 0;
    }
    #divinia-input {
      flex: 1; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 10px 14px;
      font-size: 14px; outline: none; color: #1a1a1a;
    }
    #divinia-input:focus { border-color: var(--divinia-color, #6366f1); }
    #divinia-send {
      border: none; border-radius: 10px; padding: 0 16px; cursor: pointer;
      font-size: 16px; color: white; transition: opacity 0.2s;
    }
    #divinia-send:hover { opacity: 0.85; }
    #divinia-send:disabled { opacity: 0.4; cursor: not-allowed; }
    @media (max-width: 420px) {
      #divinia-window { width: calc(100vw - 24px); right: 12px; bottom: 88px; }
    }
  `;
  document.head.appendChild(style);

  // Estructura HTML
  const container = document.createElement('div');
  container.id = 'divinia-widget';
  container.innerHTML = `
    <button id="divinia-btn" title="Chatbot">💬</button>
    <div id="divinia-window">
      <div id="divinia-header">
        <div class="avatar">🤖</div>
        <div class="info">
          <p class="name">Asistente</p>
          <p class="status"><span class="dot"></span>En línea</p>
        </div>
      </div>
      <div id="divinia-messages"></div>
      <div id="divinia-input-area">
        <input id="divinia-input" type="text" placeholder="Escribí tu consulta..." autocomplete="off" />
        <button id="divinia-send">↑</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  const btn = document.getElementById('divinia-btn');
  const win = document.getElementById('divinia-window');
  const messagesEl = document.getElementById('divinia-messages');
  const input = document.getElementById('divinia-input');
  const send = document.getElementById('divinia-send');

  let color = '#6366f1';
  let history = [];
  let initialized = false;

  // Aplicar color desde sessionStorage si existe
  const cached = sessionStorage.getItem('divinia_' + chatbotId);
  if (cached) {
    try {
      const d = JSON.parse(cached);
      color = d.color || color;
      history = d.history || [];
    } catch (e) {}
  }

  function applyColor(c) {
    color = c;
    btn.style.background = c;
    document.getElementById('divinia-header').style.background = `linear-gradient(135deg, ${c}, ${c}dd)`;
    send.style.background = c;
    document.documentElement.style.setProperty('--divinia-color', c);
  }

  function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = 'divinia-msg ' + type;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msg;
  }

  function saveHistory() {
    sessionStorage.setItem('divinia_' + chatbotId, JSON.stringify({ color, history }));
  }

  async function init() {
    if (initialized) return;
    initialized = true;

    try {
      const res = await fetch(`${baseUrl}/api/chatbot/${chatbotId}`);
      const data = await res.json();
      if (data.color) applyColor(data.color);
      if (data.company_name) {
        document.querySelector('#divinia-header .name').textContent = data.company_name;
      }
      const welcome = data.welcome || '¡Hola! ¿En qué puedo ayudarte?';
      addMessage(welcome, 'bot');
      history.push({ role: 'assistant', content: welcome });
      saveHistory();
    } catch (e) {
      applyColor(color);
      addMessage('¡Hola! ¿En qué puedo ayudarte?', 'bot');
    }

    // Restaurar historial si existe
    if (history.length > 1) {
      messagesEl.innerHTML = '';
      history.forEach(m => addMessage(m.content, m.role === 'user' ? 'user' : 'bot'));
    }
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || send.disabled) return;

    input.value = '';
    send.disabled = true;
    addMessage(text, 'user');
    history.push({ role: 'user', content: text });

    const typing = addMessage('Escribiendo...', 'typing');

    try {
      const res = await fetch(`${baseUrl}/api/chatbot/${chatbotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-8) }),
      });
      const data = await res.json();
      const reply = data.response || 'No pude procesar tu consulta.';
      messagesEl.removeChild(typing);
      addMessage(reply, 'bot');
      history.push({ role: 'assistant', content: reply });
      saveHistory();
    } catch (e) {
      messagesEl.removeChild(typing);
      addMessage('Hubo un error. Intentá de nuevo.', 'bot');
    } finally {
      send.disabled = false;
      input.focus();
    }
  }

  // Inicializar colores base
  applyColor(color);

  btn.addEventListener('click', () => {
    win.classList.toggle('open');
    if (win.classList.contains('open')) {
      init();
      input.focus();
    }
  });

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
})();
