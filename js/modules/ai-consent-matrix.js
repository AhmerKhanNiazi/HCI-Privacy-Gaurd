/**
 * PrivacyGuard UX - Feature 3: Ethical AI Consent Matrix
 * 
 * Demonstrates HCI Topic 5 (Ethical AI in HCI):
 * - IEEE 7000-2021 & EU AI Act (Transparency & Human Oversight)
 * - Model Training Opt-In vs. Stealth Data Harvesting
 * - Client-Side PII Redaction & Differential Privacy Simulation
 * - Interactive AI Privacy Sandbox (Side-by-side prompt ingestion preview)
 */

import { HCI_KNOWLEDGE_BASE } from '../data/hci-ethics-data.js';

export class AIConsentMatrix {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Matrix configuration state
    this.aiConsentState = {
      modelTraining: false,      // PbD: Default OFF
      humanAnnotation: false,    // Third-party reviewers
      differentialPrivacy: true, // Noise injection active
      ephemeralMemory: true,     // Instant deletion active
      explainableRationale: true // Live feature attribution
    };
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.updateSandboxPreview();
  }

  render() {
    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Section Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
                HCI Topic 5
              </span>
              <span class="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Ethical AI in HCI
              </span>
            </div>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
              AI Privacy & Data Protection Controls
            </h2>
            <p class="text-xs md:text-sm text-slate-400 mt-0.5">
              Control exactly how AI companies use your chats. Prevent AI from training on your messages or allowing human workers to read them.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3 py-1 text-xs font-mono bg-violet-950/80 text-violet-300 border border-violet-800/60 rounded-lg">
              IEEE & EU AI Act Compliant
            </span>
          </div>
        </div>

        <!-- 2-Column Layout: Consent Matrix Toggles vs Live AI Sandbox -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          <!-- LEFT: MATRIX CONTROL TILES (6 Cols) -->
          <div class="lg:col-span-6 space-y-4">
            <div class="cyber-card rounded-2xl p-5 md:p-6 space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 class="text-sm md:text-base font-bold text-white flex items-center gap-2">
                  <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  Choose Your AI Privacy Settings (Click toggles):
                </h3>
                <span class="text-xs font-mono text-emerald-400">Your Data, Your Rules</span>
              </div>

              <!-- Matrix Item 1: Model Retraining Opt-In -->
              <div class="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs md:text-sm font-semibold text-slate-100">🧠 Train Future AI on Your Chats</span>
                    <span id="badge-model-training" class="px-2 py-0.2 text-[10px] font-mono rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Opted Out (Safe)
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 leading-tight">
                    When ON: The AI company stores your private messages and uses them to train future AI models. (Recommended: OFF).
                  </p>
                  <p class="text-[10px] text-cyan-400 font-mono">
                    Fair AI Guarantee: Turning this OFF will NEVER make the AI slower or less intelligent.
                  </p>
                </div>
                <label class="cyber-toggle shrink-0 mt-1">
                  <input type="checkbox" id="ai-opt-training">
                  <span class="cyber-toggle-slider"></span>
                </label>
              </div>

              <!-- Matrix Item 2: Human Contractors / Annotation -->
              <div class="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs md:text-sm font-semibold text-slate-100">👥 Human Workers Reading Your Chats</span>
                    <span id="badge-human-review" class="px-2 py-0.2 text-[10px] font-mono rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Restricted (Safe)
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 leading-tight">
                    When ON: External human contractors read your conversation history to grade responses. (Can expose your secrets).
                  </p>
                  <p class="text-[10px] text-slate-500 font-mono">
                    Recommended: Keep OFF to ensure zero human eyes ever read what you type.
                  </p>
                </div>
                <label class="cyber-toggle shrink-0 mt-1">
                  <input type="checkbox" id="ai-opt-human">
                  <span class="cyber-toggle-slider"></span>
                </label>
              </div>

              <!-- Matrix Item 3: Differential Privacy & Client-side Redaction -->
              <div class="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs md:text-sm font-semibold text-slate-100">🔒 Hide Passwords & Private Details (Auto-Redact)</span>
                    <span class="px-2 py-0.2 text-[10px] font-mono rounded bg-violet-950 text-violet-300 border border-violet-800">
                      Shield Active
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 leading-tight">
                    When ON: Your browser automatically detects and hides passwords, doctor names, phone numbers, and credit cards BEFORE sending.
                  </p>
                </div>
                <label class="cyber-toggle shrink-0 mt-1">
                  <input type="checkbox" id="ai-opt-diffprivacy" checked>
                  <span class="cyber-toggle-slider"></span>
                </label>
              </div>

              <!-- Matrix Item 4: Ephemeral Session Memory -->
              <div class="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs md:text-sm font-semibold text-slate-100">🧹 Auto-Delete History When You Leave</span>
                    <span class="px-2 py-0.2 text-[10px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Auto-Wipe Active
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 leading-tight">
                    When ON: Instantly erases all chat history from memory as soon as you close the tab. Zero logs remain on servers.
                  </p>
                </div>
                <label class="cyber-toggle shrink-0 mt-1">
                  <input type="checkbox" id="ai-opt-ephemeral" checked>
                  <span class="cyber-toggle-slider"></span>
                </label>
              </div>

            </div>
          </div>

          <!-- RIGHT: INTERACTIVE LIVE AI PROMPT PRIVACY SANDBOX (6 Cols) -->
          <div class="lg:col-span-6 space-y-4">
            <div class="cyber-card rounded-2xl p-5 md:p-6 space-y-4 flex flex-col justify-between h-full">
              <div>
                <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 class="text-sm md:text-base font-bold text-white flex items-center gap-2">
                    <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                    Live AI Prompt Privacy Tester
                  </h3>
                  <span class="text-xs font-mono text-slate-400">Live Preview</span>
                </div>

                <div class="space-y-3 mt-3">
                  <!-- Sample Prompt Selector -->
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-mono text-slate-400">Click a Sample to Test:</span>
                    <button class="sample-prompt-btn px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition" data-prompt="Dr. Sarah Collins diagnosed me with Type 2 Diabetes. What diet should I follow for my insulin at 555-0192?">
                      🩺 Test Doctor & Medical Report
                    </button>
                    <button class="sample-prompt-btn px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition" data-prompt="Fix my backend database connection error: const API_KEY = 'sk_live_9942a48bc7814';">
                      🔑 Test Secret Password & API Key
                    </button>
                  </div>

                  <!-- Prompt Input Field -->
                  <div class="relative">
                    <textarea id="ai-sandbox-input" rows="3" class="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-xs md:text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition" placeholder="Type or paste any sensitive prompt here..."></textarea>
                  </div>
                </div>

                <!-- Live Transmission Payload Inspector -->
                <div class="mt-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-mono font-semibold text-slate-300">What the AI Server Actually Receives (Protected):</span>
                    <span id="ai-transmission-status" class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Shield Active
                    </span>
                  </div>

                  <div id="ai-payload-preview" class="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto min-h-[90px]">
                    <!-- Real-time sanitized payload -->
                  </div>
                </div>
              </div>

              <!-- Academic Heuristic Callout -->
              <div class="mt-4 p-3 bg-violet-950/40 border border-violet-900/60 rounded-xl text-xs space-y-1">
                <div class="flex items-center gap-1.5 text-violet-300 font-bold font-mono">
                  <span>💡 HCI Ethical Guideline:</span>
                </div>
                <p class="text-slate-400 text-[11px] leading-relaxed">
                  "AI apps must NEVER force you to give up your private notes, passwords, or health queries just to use their chatbot. Privacy must always be free and protected by default."
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Toggles
    const trainingToggle = document.getElementById('ai-opt-training');
    const humanToggle = document.getElementById('ai-opt-human');
    const diffToggle = document.getElementById('ai-opt-diffprivacy');
    const ephemeralToggle = document.getElementById('ai-opt-ephemeral');
    const textarea = document.getElementById('ai-sandbox-input');

    trainingToggle?.addEventListener('change', (e) => {
      this.aiConsentState.modelTraining = e.target.checked;
      const badge = document.getElementById('badge-model-training');
      if (badge) {
        if (e.target.checked) {
          badge.className = "px-2 py-0.2 text-[10px] font-mono rounded bg-rose-950 text-rose-400 border border-rose-800";
          badge.textContent = "Harvested for Model Retraining";
        } else {
          badge.className = "px-2 py-0.2 text-[10px] font-mono rounded bg-emerald-950 text-emerald-400 border border-emerald-800";
          badge.textContent = "Opted Out (Safe)";
        }
      }
      this.updateSandboxPreview();
    });

    humanToggle?.addEventListener('change', (e) => {
      this.aiConsentState.humanAnnotation = e.target.checked;
      const badge = document.getElementById('badge-human-review');
      if (badge) {
        if (e.target.checked) {
          badge.className = "px-2 py-0.2 text-[10px] font-mono rounded bg-amber-950 text-amber-400 border border-amber-800";
          badge.textContent = "Visible to Contractors";
        } else {
          badge.className = "px-2 py-0.2 text-[10px] font-mono rounded bg-emerald-950 text-emerald-400 border border-emerald-800";
          badge.textContent = "Restricted";
        }
      }
      this.updateSandboxPreview();
    });

    diffToggle?.addEventListener('change', (e) => {
      this.aiConsentState.differentialPrivacy = e.target.checked;
      this.updateSandboxPreview();
    });

    ephemeralToggle?.addEventListener('change', (e) => {
      this.aiConsentState.ephemeralMemory = e.target.checked;
      this.updateSandboxPreview();
    });

    // Text input
    textarea?.addEventListener('input', () => {
      this.updateSandboxPreview();
    });

    // Sample buttons
    this.container.querySelectorAll('.sample-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sampleText = btn.getAttribute('data-prompt');
        if (textarea) {
          textarea.value = sampleText;
          this.updateSandboxPreview();
        }
      });
    });

    // Initial default prompt
    if (textarea) {
      textarea.value = "Dr. Sarah Collins diagnosed me with Type 2 Diabetes. What diet should I follow for my insulin at 555-0192?";
    }
  }

  updateSandboxPreview() {
    const inputEl = document.getElementById('ai-sandbox-input');
    const previewEl = document.getElementById('ai-payload-preview');
    const statusEl = document.getElementById('ai-transmission-status');
    if (!inputEl || !previewEl) return;

    const rawText = inputEl.value;
    let processedText = rawText;

    if (this.aiConsentState.differentialPrivacy) {
      // Regex masking of Names, Keys, Phone numbers, Medical terms
      processedText = processedText
        .replace(/(Dr\.\s+[A-Z][a-z]+\s+[A-Z][a-z]+|[A-Z][a-z]+\s+[A-Z][a-z]+)/g, '<span class="text-cyan-400 bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-800">[REDACTED_ENTITY]</span>')
        .replace(/(\d{3}-\d{4}|\d{3}-\d{3}-\d{4})/g, '<span class="text-cyan-400 bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-800">[REDACTED_PHONE]</span>')
        .replace(/(sk_live_[a-zA-Z0-9_]+|API_KEY\s*=\s*['"][^'"]+['"])/g, '<span class="text-rose-400 bg-rose-950/80 px-1 py-0.5 rounded border border-rose-800">[REDACTED_SECRET_KEY]</span>')
        .replace(/(Diabetes|insulin|cancer)/gi, '<span class="text-violet-400 bg-violet-950/80 px-1 py-0.5 rounded border border-violet-800">[MASKED_HEALTH_VECTOR]</span>');
    }

    // Build JSON Payload representation
    const payload = {
      model_training_allowed: this.aiConsentState.modelTraining,
      human_review_permitted: this.aiConsentState.humanAnnotation,
      ephemeral_session_seconds: this.aiConsentState.ephemeralMemory ? 0 : 7776000,
      client_differential_privacy_eps: this.aiConsentState.differentialPrivacy ? 0.05 : 0.0,
      sanitized_prompt: processedText
    };

    if (statusEl) {
      if (!this.aiConsentState.modelTraining && this.aiConsentState.differentialPrivacy) {
        statusEl.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800";
        statusEl.textContent = "Ethical Shield Active";
      } else {
        statusEl.className = "text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800";
        statusEl.textContent = "Data Harvester Exposed";
      }
    }

    previewEl.innerHTML = `
      <div class="text-slate-400">POST /v1/ai/inference HTTP/2</div>
      <div class="text-slate-500">X-AI-Consent-Policy: ${this.aiConsentState.modelTraining ? 'HARVEST_PERMITTED' : 'STRICT_NO_TRAIN'}</div>
      <div class="text-slate-500">X-Data-Retention: ${this.aiConsentState.ephemeralMemory ? 'EPHEMERAL_WIPE_ON_CLOSE' : 'PERMANENT_STORAGE'}</div>
      <div class="mt-2 text-slate-200">
        {<br>
        &nbsp;&nbsp;<span class="text-cyan-400">"model_retraining"</span>: <span class="${this.aiConsentState.modelTraining ? 'text-rose-400' : 'text-emerald-400'}">${payload.model_training_allowed}</span>,<br>
        &nbsp;&nbsp;<span class="text-cyan-400">"human_annotators"</span>: <span class="${this.aiConsentState.humanAnnotation ? 'text-rose-400' : 'text-emerald-400'}">${payload.human_review_permitted}</span>,<br>
        &nbsp;&nbsp;<span class="text-cyan-400">"ttl_seconds"</span>: <span class="text-amber-300">${payload.ephemeral_session_seconds}</span>,<br>
        &nbsp;&nbsp;<span class="text-cyan-400">"prompt"</span>: <span class="text-slate-300">"</span>
      </div>
      <div class="pl-4 pb-1 text-[11px] leading-relaxed border-l-2 border-slate-700 ml-2">${processedText}</div>
      <div class="text-slate-200">&nbsp;&nbsp;<span class="text-slate-300">"</span> }</div>
    `;
  }
}
