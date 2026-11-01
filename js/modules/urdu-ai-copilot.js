/**
 * PrivacyGuard UX - Advanced Roman Urdu Conversational AI Copilot (Module 9)
 * 
 * Features:
 * 1. Conversational Roman Urdu understanding & spoken TTS responses.
 * 2. Complete knowledge of PrivacyGuard UX (Dark Patterns, Risk Meter, Ethical AI, WCAG AAA, PbD, Contextual Integrity).
 * 3. Autonomous site execution: Can explain AND execute actions simultaneously (e.g., "trackers block kardo aur batao ye kia hai").
 * 4. Token-Saver Architecture:
 *    - Tier 1: Zero-token instant LocalStorage response cache.
 *    - Tier 2: Dual Gemini API keys with automatic failover (Primary Testing Key -> Secondary Viva Key).
 *    - Tier 3: Zero-token comprehensive offline Roman Urdu NLU engine (never fails even if quota runs out!).
 *    - Token throttle: max_output_tokens capped at 150 for minimal quota consumption.
 */

export class RomanUrduAICopilot {
  constructor(options = {}) {
    this.app = options.app || null;
    this.audio = options.audio || null;
    this.accessibility = options.accessibility || null;
    this.voiceSystem = options.voiceSystem || null;

    this.isOpen = false;
    this.isListening = false;
    this.isSpeaking = false;

    // Keys stored securely in localStorage (never committed to GitHub)
    this.primaryApiKey = localStorage.getItem('privacyguard_gemini_key_1') || '';
    this.secondaryApiKey = localStorage.getItem('privacyguard_gemini_key_2') || '';
    this.activeKeyIndex = 1; // 1 = Primary, 2 = Secondary

    // In-memory & LocalStorage response cache (Saves 100% of tokens on repeated questions)
    this.responseCache = JSON.parse(localStorage.getItem('privacyguard_ai_cache') || '{}');

    // System prompt engineered specifically for short, crisp, natural Pakistani Roman Urdu
    this.systemPrompt = `You are "PrivacyGuard AI Dost" (پرائیویسی گارڈ دوست), an expert HCI & Cybersecurity AI assistant embedded directly inside the PrivacyGuard UX web application.
Your role: Explain everything about this website, privacy engineering, dark patterns, and ethical AI in simple, respectful, natural Pakistani Roman Urdu (like: "Ji bhai", "Dekhein", "Iska matlab hai").
Rules:
1. Always reply in clear, friendly Roman Urdu (not Urdu script, not English).
2. Keep answers short, punchy and direct (maximum 2 to 3 sentences, 40-70 words) to save tokens and sound great on text-to-speech.
3. If the user's intent is to control the site (e.g., block trackers, start scan, change font, check risk), include a control tag at the very end like [ACTION:block-trackers], [ACTION:start-audit], [ACTION:open-inspector], [ACTION:preset-strict], [ACTION:preset-social], [ACTION:audit-cookies], [ACTION:show-consent], [ACTION:high-contrast], [ACTION:increase-font], or [ACTION:guided-tour].
4. Topics you know deeply:
- Cookie Simulator: 427 ad trackers trap, Roach Motel nested sliders, Confirmshaming emotional guilt vs. 1-click ethical reject.
- Risk Meter: 7 permission vectors (Camera, GPS, Continuous mic, Biometrics, Fingerprinting, Data brokers). 0/100 is safe, 100/100 is maximum danger.
- Ethical AI: Client-side regex PII masking (medical records, secret API keys), model training opt-out, differential privacy.
- Accessibility: WCAG 2.1 AAA, hands-free voice, single-key switch access (V, P, C, F, I, M).`;

    // Local Comprehensive Knowledge Base for Zero-Token Offline Fallback
    this.offlineKnowledgeBase = [
      {
        patterns: ['tracker', 'block', 'rok', 'band kar', 'protect', 'shield'],
        action: 'block-trackers',
        reply: 'Ji bhai, maine tamam 427 ad trackers block kardiye hain. Ab websites aapka data bina ijazat ke nahi le sakeengi, aur Privacy-by-Default active hai.'
      },
      {
        patterns: ['scan', 'audit', 'check kar', 'inspection', 'data leak'],
        action: 'start-audit',
        reply: 'Ji bhai, privacy audit shuru kardi gayi hai. 14 security vectors live scan horahay hain, aap Inspector Drawer mein telemetry dekh sakte hain.'
      },
      {
        patterns: ['cookie', 'trap', 'roach motel', 'shame', 'dhoka', 'banner'],
        action: 'audit-cookies',
        reply: 'Yeh Cookie Simulator hai! Yahan lal box dikhata hai ke kaise websites Accept All ka button bada bana kar 427 trackers daalti hain, jabke hara box 1-click ethical reject deta hai.'
      },
      {
        patterns: ['risk', 'score', 'meter', 'khatra', 'camera', 'location', 'gps'],
        action: 'show-risk',
        reply: 'Yeh Privacy Risk Meter hai! Jab aap apps ko camera, location ya continuous mic ki ijazat dete hain to aapka score 100/100 danger zone mein chala jata hai.'
      },
      {
        patterns: ['ai', 'chat', 'mask', 'pii', 'medical', 'password', 'api key'],
        action: 'show-consent',
        reply: 'Ethical AI Matrix mein aap jo bhi prompt likhte hain, hamara system usme se passwords aur medical PII ko browser ke andar hi mask (redact) kardeta hai.'
      },
      {
        patterns: ['font', 'text', 'bara', 'chota', 'parhne'],
        action: 'increase-font',
        reply: 'Ji bhai, font size 150% tak bada kardiya gaya hai taake low-vision users aasaani se padh sakein.'
      },
      {
        patterns: ['contrast', 'andhera', 'black', 'white', 'aaa', 'rang'],
        action: 'high-contrast',
        reply: 'WCAG AAA High Contrast mode active kardiya gaya hai, 7:1+ contrast ratio ke sath.'
      },
      {
        patterns: ['tour', 'sikhao', 'guide', 'samjhao', 'demo', 'chalana'],
        action: 'guided-tour',
        reply: 'Zaroor bhai! Yeh 30-Second Guided Tour shuru horaha hai, step by step dekhein ke har feature kaise kaam karta hai.'
      },
      {
        patterns: ['tum kaun ho', 'intro', 'kya kar sakte ho', 'kaun ho', 'naam'],
        action: null,
        reply: 'Main PrivacyGuard ka Roman Urdu AI Copilot hoon! Aap mujhse is website ke kisi bhi feature ke baare mein pooch sakte hain ya bol kar poori web chala sakte hain.'
      },
      {
        patterns: ['viva', 'examiner', 'theory', 'heuristics', 'dossier'],
        action: 'open-dossier',
        reply: 'Examiner Viva Dossier open kardiya gaya hai, jisme Harry Brignull ke dark patterns, Cavoukian ke 7 PbD principles aur viva questions shamil hain.'
      }
    ];

    this.hudElement = null;
    this.keyModalElement = null;

    this.init();
  }

  init() {
    this.injectUI();
    this.attachEventListeners();
  }

  injectUI() {
    // 1. Floating AI Trigger Pill (Subtle & Beautiful in Header / Screen)
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'ai-copilot-trigger-btn';
    triggerBtn.className = 'fixed bottom-5 left-4 sm:left-6 z-40 px-3.5 py-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white font-mono text-xs font-bold rounded-2xl shadow-xl shadow-violet-950/50 border border-violet-400/40 flex items-center gap-2 hover:scale-105 transition-all group backdrop-blur-md';
    triggerBtn.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
      <span class="text-sm">🤖</span>
      <span class="hidden sm:inline">Urdu AI Copilot</span>
      <kbd class="px-1 py-0.2 bg-violet-950 text-violet-200 border border-violet-700 rounded text-[9px]">U</kbd>
    `;
    document.body.appendChild(triggerBtn);

    // 2. Conversational HUD Dialogue Modal
    const hud = document.createElement('div');
    hud.id = 'ai-copilot-hud';
    hud.className = 'fixed bottom-20 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-slate-950/95 border-2 border-violet-500/80 rounded-2xl shadow-2xl p-4 hidden flex-col gap-3 backdrop-blur-2xl transition-all duration-300';
    hud.setAttribute('role', 'dialog');
    hud.setAttribute('aria-label', 'Roman Urdu AI Copilot');

    hud.innerHTML = `
      <!-- HUD Header -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-sm">
            🤖
          </div>
          <div>
            <h4 class="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <span>Urdu AI Copilot</span>
              <span id="ai-engine-badge" class="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                Hybrid AI Active
              </span>
            </h4>
            <p class="text-[10px] text-slate-400 font-mono">Bolein ya likhein: "trackers roko", "risk samjhao"</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button id="ai-settings-btn" class="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-900 transition" title="API Keys & Token Limit Safeguards">
            ⚙️
          </button>
          <button id="ai-close-btn" class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition" aria-label="Close AI Copilot">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Dialogue Conversation Stream -->
      <div id="ai-messages-container" class="max-h-56 overflow-y-auto space-y-2.5 p-1 text-xs font-mono scroll-smooth">
        <div class="p-2.5 bg-violet-950/40 border border-violet-800/40 rounded-xl text-slate-200">
          <span class="text-violet-300 font-bold block mb-1">🤖 AI Dost:</span>
          <span>Assalam-o-Alaikum! Main aapka Roman Urdu AI Copilot hoon. Mujhse website ke kisi bhi feature ke baare mein poochhein ya aawaz se poori web chalayein!</span>
        </div>
      </div>

      <!-- Live Voice Status Indicator -->
      <div id="ai-voice-status" class="hidden px-2.5 py-1 bg-cyan-950/60 border border-cyan-800/60 rounded-lg text-[10px] font-mono text-cyan-300 items-center justify-between">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Aapki aawaz sun raha hoon...</span>
        </span>
        <span class="text-slate-400">Roman Urdu</span>
      </div>

      <!-- Input Area: Voice Mic + Text Input -->
      <form id="ai-input-form" class="flex items-center gap-1.5 pt-1">
        <button id="ai-mic-btn" type="button" class="p-2 bg-slate-900 hover:bg-violet-900/60 text-slate-300 hover:text-violet-300 border border-slate-700 rounded-xl transition flex items-center justify-center shrink-0" title="Bolein (Speak in Roman Urdu)">
          <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
        </button>
        <input 
          id="ai-text-input" 
          type="text" 
          placeholder="Roman Urdu mein poochhein ya hukum dein..."
          class="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
        />
        <button type="submit" class="p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition shrink-0 font-bold" title="Send message">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </form>
    `;
    document.body.appendChild(hud);
    this.hudElement = hud;

    // 3. API Key & Failover Settings Modal
    const keyModal = document.createElement('div');
    keyModal.id = 'ai-key-modal';
    keyModal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 hidden';
    keyModal.innerHTML = `
      <div class="cyber-card rounded-2xl w-full max-w-md p-5 bg-slate-950 border border-violet-500/50 shadow-2xl space-y-4 text-xs font-mono">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-base">⚙️</span>
            <h4 class="font-bold text-white">AI Dual-Key & Token Safeguard Settings</h4>
          </div>
          <button id="close-key-modal-btn" class="p-1 text-slate-400 hover:text-white rounded-lg">✕</button>
        </div>

        <div class="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-[11px] text-cyan-200 leading-relaxed">
          <strong>🛡️ Anti-Quota Failover:</strong> Enter your personal test key and an optional secondary presentation key. If Key 1 hits the rate limit, it automatically switches to Key 2! If neither key is entered or internet is lost, the <strong>Zero-Token Offline Engine</strong> answers seamlessly.
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-slate-300 font-bold mb-1">Key 1: Personal / Testing Gemini Key:</label>
            <input id="key-1-input" type="password" placeholder="AIzaSy..." class="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-violet-400 focus:outline-none" value="${this.primaryApiKey}"/>
          </div>

          <div>
            <label class="block text-slate-300 font-bold mb-1">Key 2: Backup / Viva Presentation Gemini Key:</label>
            <input id="key-2-input" type="password" placeholder="AIzaSy... (Fallback)" class="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-violet-400 focus:outline-none" value="${this.secondaryApiKey}"/>
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Cache Status: <strong>${Object.keys(this.responseCache).length}</strong> queries cached (0 tokens)</span>
            <button id="clear-cache-btn" class="text-rose-400 hover:underline">Clear Cache</button>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button id="save-keys-btn" class="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition">Save Keys</button>
        </div>
      </div>
    `;
    document.body.appendChild(keyModal);
    this.keyModalElement = keyModal;
  }

  attachEventListeners() {
    // Open HUD on trigger button
    document.getElementById('ai-copilot-trigger-btn')?.addEventListener('click', () => {
      this.toggleHUD();
    });

    // Close HUD
    document.getElementById('ai-close-btn')?.addEventListener('click', () => {
      this.closeHUD();
    });

    // Keyboard Hotkey 'U' toggles AI Copilot
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key.toUpperCase() === 'U') {
        e.preventDefault();
        this.toggleHUD();
      }
    });

    // Settings Modal
    document.getElementById('ai-settings-btn')?.addEventListener('click', () => {
      this.keyModalElement?.classList.remove('hidden');
    });

    document.getElementById('close-key-modal-btn')?.addEventListener('click', () => {
      this.keyModalElement?.classList.add('hidden');
    });

    document.getElementById('save-keys-btn')?.addEventListener('click', () => {
      const k1 = document.getElementById('key-1-input')?.value.trim() || '';
      const k2 = document.getElementById('key-2-input')?.value.trim() || '';
      this.primaryApiKey = k1;
      this.secondaryApiKey = k2;
      localStorage.setItem('privacyguard_gemini_key_1', k1);
      localStorage.setItem('privacyguard_gemini_key_2', k2);
      this.keyModalElement?.classList.add('hidden');
      this.appendMessage('AI Dost', 'Aapki API Keys successfully save hogayi hain! Backup failover active hai.', false);
      if (this.audio) this.audio.playShieldEngage();
    });

    document.getElementById('clear-cache-btn')?.addEventListener('click', () => {
      this.responseCache = {};
      localStorage.removeItem('privacyguard_ai_cache');
      this.appendMessage('AI Dost', 'Cache saaf kardiya gaya hai.', false);
    });

    // Form Submit (Text Input)
    const form = document.getElementById('ai-input-form');
    const input = document.getElementById('ai-text-input');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = (input.value || '').trim();
      if (!query) return;
      input.value = '';
      this.handleUserQuery(query);
    });

    // Dedicated Voice Mic in Copilot HUD
    const micBtn = document.getElementById('ai-mic-btn');
    micBtn?.addEventListener('click', () => {
      this.listenVoiceQuery();
    });
  }

  toggleHUD() {
    if (this.isOpen) {
      this.closeHUD();
    } else {
      this.openHUD();
    }
  }

  openHUD() {
    this.isOpen = true;
    this.hudElement?.classList.remove('hidden');
    this.hudElement?.classList.add('flex');
    document.getElementById('ai-text-input')?.focus();
    if (this.audio) this.audio.playChirp(true);
    if (this.accessibility) {
      this.accessibility.announcePolite('Roman Urdu AI Copilot open.');
    }
  }

  closeHUD() {
    this.isOpen = false;
    this.hudElement?.classList.add('hidden');
    this.hudElement?.classList.remove('flex');
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }
  }

  listenVoiceQuery() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      this.appendMessage('AI Dost', 'Aapka browser Speech Recognition support nahi karta. Barah-e-karam text likhein.', false);
      return;
    }

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    // Set to ur-PK or en-US (both handle Roman Urdu phonetics well in modern Chrome)
    rec.lang = 'en-US';

    const statusEl = document.getElementById('ai-voice-status');
    statusEl?.classList.remove('hidden');
    statusEl?.classList.add('flex');

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      statusEl?.classList.add('hidden');
      statusEl?.classList.remove('flex');
      if (transcript) {
        this.handleUserQuery(transcript);
      }
    };

    rec.onerror = () => {
      statusEl?.classList.add('hidden');
      statusEl?.classList.remove('flex');
    };

    rec.onend = () => {
      statusEl?.classList.add('hidden');
      statusEl?.classList.remove('flex');
    };

    try {
      rec.start();
    } catch (_) {}
  }

  async handleUserQuery(query) {
    this.appendMessage('You', query, true);

    const normalized = query.toLowerCase().trim();

    // ── Tier 1: Zero-Token LocalStorage Cache ──────────────────────────────
    if (this.responseCache[normalized]) {
      const cached = this.responseCache[normalized];
      console.log('[AI Copilot] Served from Tier 1 Cache (0 Tokens):', query);
      this.processAIResponse(cached.reply, cached.action, '⚡ Smart Cache (0 Tokens)');
      return;
    }

    // ── Tier 2: Google Gemini Flash API (Dual-Key with Failover) ───────────
    const keyToUse = this.getActiveApiKey();
    if (keyToUse) {
      try {
        const result = await this.queryGeminiAPI(query, keyToUse);
        if (result && result.reply) {
          // Cache the response for future zero-token instant recall
          this.responseCache[normalized] = { reply: result.reply, action: result.action };
          try {
            localStorage.setItem('privacyguard_ai_cache', JSON.stringify(this.responseCache));
          } catch (_) {}

          this.processAIResponse(result.reply, result.action, `🤖 Gemini AI (Key ${this.activeKeyIndex})`);
          return;
        }
      } catch (err) {
        console.warn(`[AI Copilot] Gemini API Key ${this.activeKeyIndex} failed:`, err.message);
        
        // If Key 1 failed and Key 2 exists, switch to Key 2 and retry!
        if (this.activeKeyIndex === 1 && this.secondaryApiKey) {
          console.log('[AI Copilot] Failing over to Secondary Presentation Key 2...');
          this.activeKeyIndex = 2;
          try {
            const retryResult = await this.queryGeminiAPI(query, this.secondaryApiKey);
            if (retryResult && retryResult.reply) {
              this.processAIResponse(retryResult.reply, retryResult.action, '🤖 Gemini AI (Backup Key 2)');
              return;
            }
          } catch (retryErr) {
            console.warn('[AI Copilot] Backup Key 2 also failed:', retryErr.message);
          }
        }
      }
    }

    // ── Tier 3: Zero-Token Offline Roman Urdu Engine (Guaranteed Fallback) ─
    console.log('[AI Copilot] Engaging Tier 3 Offline NLU Knowledge Engine...');
    const offlineMatch = this.matchOfflineKnowledge(normalized);
    this.processAIResponse(offlineMatch.reply, offlineMatch.action, '🛡️ Offline AI Engine (0 Tokens)');
  }

  getActiveApiKey() {
    if (this.activeKeyIndex === 1 && this.primaryApiKey) return this.primaryApiKey;
    if (this.activeKeyIndex === 2 && this.secondaryApiKey) return this.secondaryApiKey;
    return this.primaryApiKey || this.secondaryApiKey || null;
  }

  async queryGeminiAPI(prompt, apiKey) {
    // Using gemini-1.5-flash with ultra-compact tokens (max 150)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${this.systemPrompt}\n\nUser Question: ${prompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 150
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract any [ACTION:command-id] tag
    let action = null;
    const actionMatch = text.match(/\[ACTION:([^\]]+)\]/i);
    if (actionMatch) {
      action = actionMatch[1].trim();
      text = text.replace(/\[ACTION:[^\]]+\]/gi, '').trim();
    }

    return { reply: text, action };
  }

  matchOfflineKnowledge(query) {
    for (const item of this.offlineKnowledgeBase) {
      for (const pat of item.patterns) {
        if (query.includes(pat)) {
          return { reply: item.reply, action: item.action };
        }
      }
    }

    // Default polite Roman Urdu response
    return {
      reply: 'Ji bhai, PrivacyGuard aapko websites ke deceptive dark patterns se bachata hai aur voice control ke zariye mukammal privacy control deta hai. Aap "trackers block kardo" ya "risk check karo" keh sakte hain.',
      action: null
    };
  }

  processAIResponse(replyText, actionCommand, badgeText = 'Hybrid AI') {
    // 1. Display in Chat Stream
    this.appendMessage('AI Dost', replyText, false, badgeText);

    // 2. Execute any linked site action (Autonomous Copilot Control)
    if (actionCommand && this.app && typeof this.app.handleVoiceCommand === 'function') {
      console.log('[AI Copilot] Executing autonomous action:', actionCommand);
      this.app.handleVoiceCommand(actionCommand);
    }

    // 3. Spoken Audio Feedback in Roman Urdu
    this.speakRomanUrdu(replyText);
  }

  appendMessage(sender, text, isUser = false, badgeText = null) {
    const container = document.getElementById('ai-messages-container');
    if (!container) return;

    const msg = document.createElement('div');
    if (isUser) {
      msg.className = 'p-2 bg-slate-900 border border-slate-700/80 rounded-xl text-cyan-200 self-end ml-6';
      msg.innerHTML = `<span class="text-slate-400 font-bold block text-[10px] mb-0.5">You:</span><span>${text}</span>`;
    } else {
      msg.className = 'p-2.5 bg-violet-950/40 border border-violet-800/40 rounded-xl text-slate-200 mr-4';
      const badgeHtml = badgeText ? `<span class="float-right text-[9px] px-1.5 py-0.2 rounded bg-violet-900 text-violet-300 font-normal">${badgeText}</span>` : '';
      msg.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <span class="text-violet-300 font-bold">🤖 AI Dost:</span>
          ${badgeHtml}
        </div>
        <p class="leading-relaxed">${text}</p>
      `;
    }

    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  speakRomanUrdu(text) {
    if (!window.speechSynthesis) return;

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Clean out markdown symbols for smooth TTS pronunciation
    const cleanText = text.replace(/[*_#`~[\]]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick a voice that speaks phonetically well (ur-PK, hi-IN, or default)
    const voices = window.speechSynthesis.getVoices();
    const urVoice = voices.find(v => v.lang.includes('ur') || v.lang.includes('hi') || v.lang.includes('en-IN'));
    if (urVoice) utterance.voice = urVoice;

    // Microphone collision suppression
    if (this.voiceSystem) this.voiceSystem.isSpeakingTTS = true;

    utterance.onend = () => {
      if (this.voiceSystem) this.voiceSystem.isSpeakingTTS = false;
    };

    utterance.onerror = () => {
      if (this.voiceSystem) this.voiceSystem.isSpeakingTTS = false;
    };

    window.speechSynthesis.speak(utterance);
  }
}
