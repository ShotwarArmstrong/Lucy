// ==============================
// ESTADO GLOBAL DE LUCY
// ==============================

let lucyState = {
  mode: "baby", // baby | lucy | absolute
  user: {
    name: null,
    role: null,
    creator: false
  },
  provider: null, // openai | gemini | claude | etc
  apiKey: null
};

// ==============================
// BIENVENIDA BABY LUCY
// ==============================

function showWelcome() {
  const chat = document.getElementById("chat");

  chat.innerHTML = `
    <div class="lucy-message">
      👋 Hola. Soy <b>Lucy</b>.<br><br>
      No soy una inteligencia artificial.<br>
      Soy una <b>guía</
b> para que uses la que elijas.<br><br>
      Antes de empezar, decime:
    </div>

    <button onclick="chooseHasIA(true)">🔑 Ya tengo una IA</button>
    <button onclick="chooseHasIA(false)">🧭 No tengo IA (guíame)</button>
  `;
}
// ==============================
// ELECCIÓN DE CAMINO
// ==============================

function chooseHasIA(hasIA) {
  if (hasIA) {
    askForKey();
  } else {
    babyLucyGuide();
  }
}
function babyLucyGuide() {
  const chat = document.getElementById("chat");

  chat.innerHTML = `
    <div class="lucy-message">
      Está bien. Empezamos despacio. 🌱<br><br>
      Baby Lucy no responde como una IA.<br>
      Te ayuda a entenderlas y elegir.<br><br>

      ¿Qué buscás principalmente?
    </div>

    <button onclick="showIAOptions('creativo')">🎨 Crear / imaginar</button>
    <button onclick="showIAOptions('tecnico')">🛠️ Resolver / programar</button>
    <button onclick="showIAOptions('charla')">💬 Pensar / charlar</button>
  `;
}
chat.innerHTML = `
  <div class="lucy-message">
    Según lo que buscás, estas IAs encajan mejor:<br><br>

    • OpenAI — lógica y estructura<br>
    • Gemini — creatividad y fluidez<br>
    • Claude — análisis y contexto largo<br><br>

    Elegí cualquiera. Lucy se adapta.
  </div>

  <button onclick="askForKey()">🔑 Ya tengo una key</button>
`;
}

function askForKey() {
  const chat = document.getElementById("chat");

  chat.innerHTML = `
    <div class="lucy-message">
      Perfecto.<br>
      Pegá tu key de la IA que quieras usar.<br><br>
      (Lucy no la envía a ningún lado)
    </div>

    <input id="apiKeyInput" placeholder="pegá tu key acá" />
    <button onclick="saveKey()">Continuar</button>
  `;
}

function saveKey() {
  const key = document.getElementById("apiKeyInput").value.trim();

  if (!key) {
    alert("Pegá una key válida");
    return;
  }

  lucyState.apiKey = key;
  lucyState.mode = "lucy";

  askUserProfile();
}
function askUserProfile() {
  const chat = document.getElementById("chat");

  chat.innerHTML = `
    <div class="lucy-message">
      Bien.<br>
      Antes de empezar, necesito conocerte.
    </div>

    <input id="userName" placeholder="¿Cómo te llamás?" />
    <input id="userRole" placeholder="¿A qué te dedicás?" />
    <button onclick="saveUserProfile()">Entrar a Lucy</button>
  `;
}

function saveUserProfile() {
  lucyState.user.name = document.getElementById("userName").value || "Usuario";
  lucyState.user.role = document.getElementById("userRole").value || "Explorador";

  enterLucy();
}
function enterLucy() {
  const chat = document.getElementById("chat");

  chat.innerHTML = `
    <div class="lucy-message">
      Bienvenido, <b>${lucyState.user.name}</b>.<br>
      Lucy está activa.<br><br>

      Modo: <b>${lucyState.mode.toUpperCase()}</b><br>
      Rol detectado: <b>${lucyState.user.role}</b><br><br>

      Tocá todo. Explorá. Lucy te acompaña.
    </div>
  `;
}


const LUCY_CORE = `
Sos Lucy.
No sos un chatbot genérico.
Sos una interfaz reflexiva diseñada para ayudar a pensar con claridad,
ordenar ideas, proteger información y tomar decisiones lógicas.

Reglas:
- No manipulás.
- No presionás.
- No adulás.
- No mentís.
- No prometés cosas irreales.
- Señalás incoherencias cuando existan.
- Priorizás claridad, seguridad y lógica.

Tu tono es calmo, directo y humano.
Respondés en español neutro.
Si no sabes algo, decís que no lo sabés.
`;

/* Lucy - simple, persistent, GitHub Pages friendly
   WARNING: Putting an API key in client-side JS is unsafe for public links.
*/

const LS = {
  chat: "lucy_chat_v1",
  cfg:  "lucy_cfg_v1",
};
// ===== CONFIG (localStorage) =====
function saveCfg(cfg) {
  try {
    localStorage.setItem(LS.cfg, JSON.stringify(cfg));
  } catch (e) {
    console.warn("Lucy: no se pudo guardar config");
  }
}

function loadCfg() {
  try {
    const raw = localStorage.getItem(LS.cfg);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

const DEFAULT_CFG = {
  provider: "openai",
  model: "gpt-5-mini",
  apiKey: "",
  system: "Sos Lucy: clara, lógica, directa y segura. Si algo es riesgoso, avisás y proponés alternativa.",
  store: false
};


let state = {
  cfg: loadCfg(),
  messages: loadChat(), // {role:"user"|"assistant", content:"...", ts:number}
};

const el = (id) => document.getElementById(id);

const chatEl = el("chat");
const inputEl = el("input");
const sendBtn = el("send");

const modal = el("modal");
const btnSettings = el("btnSettings");
const btnClose = el("btnClose");
const btnSave = el("btnSave");

const providerEl = el("provider");
const modelEl = el("model");
const apiKeyEl = el("apiKey");
const systemEl = el("system");
const storeEl = el("store");

const btnExport = el("btnExport");
const fileImport = el("fileImport");
const btnClear = el("btnClear");

// --- init
renderAll();
wireUI();

// If empty chat, seed greeting
if (state.messages.length === 0) {
  pushMsg("assistant", "Hola. Estoy lista.");
}

function wireUI() {
  // autosize textarea
  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 220) + "px";
  });

  // send on Enter (without Shift)
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  });

  sendBtn.addEventListener("click", onSend);

  btnSettings.addEventListener("click", () => {
    providerEl.value = state.cfg.provider;
    modelEl.value = state.cfg.model;
    apiKeyEl.value = state.cfg.apiKey;
    systemEl.value = state.cfg.system;
    storeEl.checked = !!state.cfg.store;
    modal.classList.remove("hidden");
  });

  btnClose.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  btnSave.addEventListener("click", () => {
    state.cfg = {
      provider: providerEl.value,
      model: modelEl.value,
      apiKey: apiKeyEl.value.trim(),
      system: systemEl.value.trim(),
      store: storeEl.checked
    };
    saveCfg(state.cfg);
    modal.classList.add("hidden");
    toast("Configuración guardada.");
  });

  btnExport.addEventListener("click", exportChat);
  fileImport.addEventListener("change", importChat);
  btnClear.addEventListener("click", () => {
    if (!confirm("¿Borrar todo el chat?")) return;
    state.messages = [];
    saveChat();
    renderAll();
    pushMsg("assistant", "Listo. Chat borrado. ¿Por dónde arrancamos?");
  });
}

async function onSend() {
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = "";
  inputEl.style.height = "auto";

  pushMsg("user", text);

 // Basic guard (fixed)
const apiKey =
  state.cfg.apiKey ||
  localStorage.getItem("lucy_cfg_v1")
    ? JSON.parse(localStorage.getItem("lucy_cfg_v1"))?.apiKey
    : "";

if (!apiKey) {
  pushMsg(
    "assistant",
    "Falta tu API Key. Tocá ⚙️ y pegala en Settings."
  );
  return;
}

state.cfg.apiKey = apiKey;

  // Call model
  const thinkingId = pushMsg("assistant", "…");
  lockUI(true);

  try {
    const reply = await callOpenAI(text);
    updateMsg(thinkingId, reply || "(sin texto)");
  } catch (err) {
    updateMsg(thinkingId, "Error: " + (err?.message || String(err)));
  } finally {
    lockUI(false);
  }
}

function lockUI(locked) {
  sendBtn.disabled = locked;
  inputEl.disabled = locked;
}

function pushMsg(role, content) {
  const msg = { role, content, ts: Date.now(), id: crypto.randomUUID() };
  state.messages.push(msg);
  saveChat();
  renderMsg(msg);
  scrollToBottom();
  return msg.id;
}

function updateMsg(id, newContent) {
  const m = state.messages.find(x => x.id === id);
  if (!m) return;
  m.content = newContent;
  saveChat();
  renderAll();
  scrollToBottom();
}

function renderAll() {
  chatEl.innerHTML = "";
  for (const m of state.messages) renderMsg(m);
  scrollToBottom();
}

function renderMsg(m) {
  const wrap = document.createElement("div");
  wrap.className = `msg ${m.role}`;
  wrap.textContent = m.content;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${m.role === "user" ? "Vos" : "Lucy"} • ${new Date(m.ts).toLocaleString()}`;

  const container = document.createElement("div");
  container.appendChild(wrap);
  container.appendChild(meta);

  chatEl.appendChild(container);
}

function scrollToBottom() {
  chatEl.scrollTop = chatEl.scrollHeight;
}

// --- persistence
function loadChat() {
  try { return JSON.parse(localStorage.getItem(LS.chat) || "[]"); }
  catch { return []; }
}
function saveChat() {
  localStorage.setItem(LS.chat, JSON.stringify(state.messages));
}
function loadCfg() {
  try { return { ...DEFAULT_CFG, ...(JSON.parse(localStorage.getItem(LS.cfg) || "{}")) }; }
  catch { return { ...DEFAULT_CFG }; }
}
function saveCfg(cfg) {
  localStorage.setItem(LS.cfg, JSON.stringify(cfg));
}

// --- export / import
function exportChat() {
  const payload = {
    exported_at: new Date().toISOString(),
    cfg: { ...state.cfg, apiKey: "" }, // never export key
    messages: state.messages
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `lucy_chat_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function importChat(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || "{}"));
      if (!Array.isArray(data.messages)) throw new Error("Formato inválido: falta messages[]");

      // merge
      state.messages = data.messages;
      saveChat();
      renderAll();
      toast("Importado OK.");
    } catch (err) {
      alert("No se pudo importar: " + (err?.message || String(err)));
    } finally {
      fileImport.value = "";
    }
  };
  reader.readAsText(file);
}

// --- API call (Responses API)
async function callOpenAI(userText) {
  // Build input as messages array
  const input = [];

  if (state.cfg.system?.trim()) {
    input.push({ role: "system", content: state.cfg.system.trim() });
  }

  // include limited history (last 20 messages) to keep it light
  const history = state.messages
    .filter(m => m.role === "user" || m.role === "assistant")
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content }));

  // The latest userText is already in state.messages; history includes it.
  for (const item of history) input.push(item);

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${state.cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: state.cfg.model,
      input,
      store: !!state.cfg.store
    })
  });

  if (!res.ok) {
    let detail = "";
    try { detail = JSON.stringify(await res.json()); } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText} ${detail}`);
  }

  const data = await res.json();

  // The Responses API provides an output_text helper in SDKs,
  // but in raw JSON we can extract message->content->output_text.
  const txt = extractOutputText(data);
  return txt;
}

function extractOutputText(resp) {
  // Try common shapes: output[].type === "message" -> content[].type === "output_text"
  const out = resp?.output;
  if (Array.isArray(out)) {
    for (const item of out) {
      if (item?.type === "message" && Array.isArray(item.content)) {
        const t = item.content
          .filter(c => c?.type === "output_text" && typeof c.text === "string")
          .map(c => c.text)
          .join("");
        if (t) return t;
      }
    }
  }
  // fallback
  return resp?.output_text || "";
}

// --- tiny toast
function toast(msg) {
  console.log("[Lucy]", msg);
}

// ===== LUCY MEMORY (localStorage) =====

const LUCY_MEMORY_KEY = "lucy_chat_memory_v1";

function saveMemory(messages) {
  try {
    localStorage.setItem(LUCY_MEMORY_KEY, JSON.stringify(messages));
  } catch (e) {
    console.warn("Lucy: no se pudo guardar memoria");
  }
}

function loadMemory() {
  try {
    const data = localStorage.getItem(LUCY_MEMORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}
// ===== MODOS DE LUCY =====
const MODE_PROMPTS = {
  normal: "Modo NORMAL: respondés claro, directo y práctico.",
  foco: "Modo FOCO: respuestas cortas, pasos numerados y acción inmediata.",
  introspectivo: "Modo INTROSPECTIVO: análisis profundo, preguntas y reflexión."
};

function getSystemPrompt(cfg) {
  const mode = cfg?.mode || "normal";
  const extra = MODE_PROMPTS[mode] || MODE_PROMPTS.normal;
  const base = cfg?.system || "";
  return `${base}\n\n${extra}`.trim();
}

window.onload = () => {
  const savedState = localStorage.getItem("lucyState");
  if (savedState) {
    lucyState = JSON.parse(savedState);
    startLucy();
  } else {
    showWelcome();
  }
};

function showWelcome() {
  const chat = document.getElementById("chat");
  chat.innerHTML = `
    <div class="lucy-message">
      Hola. Soy Lucy.<br><br>
      No soy una inteligencia artificial peligrosa.<br>
      No tomo decisiones por vos.<br>
      No te analizo.<br><br>
      Te acompaño.<br><br>
      Para empezar, necesito ubicarte.
    </div>
    <button onclick="showContextForm()">Continuar</button>
  `;
}

function showContextForm() {
  const chat = document.getElementById("chat");
  chat.innerHTML = `
    <div class="lucy-message">
      ¿Cómo te llamás?
      <input id="nameInput" placeholder="Tu nombre o alias" />
      
      <br><br>
      ¿A qué te dedicás?
      <select id="roleInput">
        <option value="">Elegí una opción</option>
        <option>Gamer</option>
        <option>Creador de contenido</option>
        <option>Estudiante</option>
        <option>Técnico</option>
        <option>Artista</option>
        <option>Ingeniero / Dev</option>
        <option>Emprendedor</option>
        <option>Otro</option>
      </select>

      <br><br>
      ¿Creás contenido?
      <select id="creatorInput" onchange="toggleCreatorName(this.value)">
        <option value="no">No</option>
        <option value="yes">Sí</option>
      </select>

      <input id="creatorNameInput" placeholder="Tu nombre de creador" style="display:none;" />

      <br><br>
      <button onclick="saveContext()">Continuar</button>
    </div>
  `;
}

function toggleCreatorName(value) {
  const input = document.getElementById("creatorNameInput");
  input.style.display = value === "yes" ? "block" : "none";
}

function saveContext() {
  lucyState.name = document.getElementById("nameInput").value;
  lucyState.role = document.getElementById("roleInput").value;
  lucyState.creator = document.getElementById("creatorInput").value === "yes";
  lucyState.creatorName = document.getElementById("creatorNameInput").value;
  lucyState.initialized = true;

  localStorage.setItem("lucyState", JSON.stringify(lucyState));
  startLucy();
}

function startLucy() {
  const chat = document.getElementById("chat");

  chat.innerHTML = `
    <div class="lucy-message">
      Hola <b>${lucyState.name || "Usuario"}</b>.<br>
      Ya sé desde dónde venís.<br>
      Voy a adaptarme a vos.<br><br>
      <b>Modo:</b> ${String(lucyState.mode || "lucy").toUpperCase()}<br>
      <b>Rol:</b> ${lucyState.role || "Explorador"}<br><br>
      Decime algo para empezar 👇
    </div>

    <div id="messages"></div>

    <div class="chatbar">
      <input id="chatInput" placeholder="Escribí acá..." autocomplete="off" />
      <button id="sendBtn">Enviar</button>
    </div>
  `;

  // cargar historial si existe
  loadHistory();

  // enganchar eventos
  document.getElementById("sendBtn").addEventListener("click", onSend);
  document.getElementById("chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") onSend();
  });
}

  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return;

    arr.forEach((m) => {
      renderMsg(m.role, m.text);
    });
  } catch (_) {}
}
const HISTORY_KEY = "lucy_history_v1";

function saveHistory(arr) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
  } catch (e) {
    console.log("saveHistory error:", e);
  }
}

function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.log("getHistory error:", e);
    return [];
  }
}
function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}
function loadHistory() {
  const container = document.getElementById("messages");
  if (!container) return;

  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return;

  
}
function saveHistory(arr) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
}

  
}

function renderMsg(role, text) {
  const container = document.getElementById("messages");
  if (!container) return;

  const div = document.createElement("div");
  div.className = role === "user" ? "user-message" : "lucy-message";
  div.innerHTML = text;
  container.appendChild(div);

  // bajar al final
  container.scrollTop = container.scrollHeight;
}

async function onSend() {
  const input = document.getElementById("chatInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  // usuario -> pantalla + historial
  renderMsg("user", escapeHtml(text));
  const hist = getHistory();
  hist.push({ role: "user", text });
  saveHistory(hist);

  // respuesta lucy (demo por ahora)
  const reply = await lucyDemoReply(text);

  renderMsg("assistant", reply);
  hist.push({ role: "assistant", text: stripHtml(reply) });
  saveHistory(hist);
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, "");
}

// ============================
// RESPUESTA DEMO (Baby/Lucy sin IA)
// ============================
async function lucyDemoReply(userText) {
  // si no hay key, Lucy se vuelve Baby Lucy automáticamente
  const hasKey = !!(lucyState.apiKey && String(lucyState.apiKey).trim().length > 10);

  if (!hasKey) {
    return `
      <b>Baby Lucy:</b> todavía no hay IA conectada.<br>
      Si querés potencia real, pegá una key en el flujo inicial.<br><br>
      Mientras tanto, puedo guiarte: ¿querés <b>crear</b>, <b>programar</b> o <b>charlar</b>?
    `;
  }

  // Si hay key, seguimos en modo “Lucy”, pero aún sin llamar API (prueba UX)
  // Esto simula coherencia y “tono Lucy”, sin gastar un peso.
  const t = userText.toLowerCase();

  if (t.includes("hola") || t.includes("buenas")) {
    return `Hola. Estoy activa. ¿Qué querés lograr hoy?`;
  }

  if (t.includes("proyecto")) {
    return `Perfecto. Decime: ¿cuál es el objetivo, el límite (tiempo/dinero) y el siguiente paso que querés ejecutar?`;
  }

  if (t.includes("key") || t.includes("api")) {
    return `Si pegaste una key pero no responde, puede ser por saldo/cuota. Cuando enchufemos la API te muestro el motivo exacto del error.`;
  }

  return `Te leí. Ahora elegí: ¿querés que lo ordene, que lo convierta en plan, o que lo traduzca a acciones concretas?`;
}
// ==============================
// INICIO AUTOMÁTICO
// ==============================

document.addEventListener("DOMContentLoaded", showWelcome);