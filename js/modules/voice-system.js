/**
 * PrivacyGuard UX - Two-Way Voice System (Speech Recognition & Spoken TTS)
 * 
 * God-Level Hands-Free Multimodal Interaction Engine:
 * - Phonetic & fuzzy tolerance for headphone noise & ESL accents
 * - Full hands-free voice control across Simulator, Risk Calculator, AI Matrix, and Examiner Dossier
 * - Interactive visual Action HUD with glowing real-time feedback
 * - Microphone feedback loop suppression during TTS playback
 * - Crash-proof debounced auto-reconnection in Chromium
 */

export class VoiceSystem {
  constructor(options = {}) {
    this.audio = options.audio || null;
    this.accessibility = options.accessibility || null;
    this.onCommand = options.onCommand || null;

    this.recognition = null;
    this.isListening = false;
    this.isSpeakingTTS = false;
    this.restartTimer = null;
    this.hudTimer = null;

    this.speechSynthesis = window.speechSynthesis || null;
    this.ttsMuted = localStorage.getItem('privacyguard_tts_muted') === 'true';

    // UI elements
    this.floatingBadge = null;
    this.transcriptEl = null;
    this.stateDot = null;
    this.actionHudEl = null;

    this.lastSpokenText = '';
    this.lastSpokenTime = 0;

    this.initRecognition();
    this.injectFloatingWidget();
    this.injectActionHUD();
  }

  initRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.log('[VoiceSystem] SpeechRecognition API not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateUIState();
        if (this.audio) this.audio.playChirp(true);
        if (this.accessibility) {
          this.accessibility.announcePolite('Voice control active. Listening for commands.');
        }
      };

      this.recognition.onend = () => {
        // Debounced smooth restart to prevent Chrome InvalidStateError crashes
        if (this.isListening) {
          clearTimeout(this.restartTimer);
          this.restartTimer = setTimeout(() => {
            if (this.isListening) {
              try {
                this.recognition.start();
              } catch (e) {
                // Ignore transient duplicate start attempts
              }
            }
          }, 200);
        } else {
          this.updateUIState();
          if (this.audio) this.audio.playChirp(false);
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isListening = false;
          this.updateUIState();
          this.speak('Microphone access was denied. Please allow microphone permissions in browser settings.');
        }
      };

      this.recognition.onresult = (event) => {
        // Discard incoming audio while system TTS is actively speaking (prevents self-looping)
        if (this.isSpeakingTTS) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const activeText = (finalTranscript || interimTranscript).trim();
        if (this.transcriptEl && activeText) {
          this.transcriptEl.textContent = `"${activeText}"`;
        }

        if (finalTranscript) {
          this.handleVoiceCommand(finalTranscript);
        }
      };
    } catch (err) {
      console.warn('[VoiceSystem] Could not initialize speech recognition:', err);
    }
  }

  toggleListening() {
    if (!this.recognition) {
      this.speak('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return false;
    }

    if (this.isListening) {
      this.isListening = false;
      clearTimeout(this.restartTimer);
      try {
        this.recognition.stop();
      } catch (e) {}
      this.updateUIState();
      this.speak('Voice control deactivated.');
      this.showActionHUD('🎤 Voice Control Off', 'Microphone listening has stopped', 'info');
      return false;
    } else {
      try {
        this.isListening = true;
        this.recognition.start();
        this.showActionHUD('🎤 Voice Control Active', 'Listening for commands... (Say "Help" for complete list)', 'success');
        return true;
      } catch (e) {
        console.warn('[VoiceSystem] Error starting recognition:', e);
        return false;
      }
    }
  }

  /**
   * Phonetic cleaner for noisy headphone microphones & ESL accents
   */
  normalizeNoise(raw) {
    let t = raw.toLowerCase().trim();

    // Common phonetic distortions from headphone background noise
    t = t.replace(/\b(low crackers|lock trackers|jack tracker|black tracker|block track|low tracker|lock tracker)\b/g, 'block trackers');
    t = t.replace(/\b(start can|dart scan|tart scan|star scan)\b/g, 'start scan');
    t = t.replace(/\b(privy scan|private scan|preview scan)\b/g, 'privacy scan');
    t = t.replace(/\b(cokie|cooky|coke)\b/g, 'cookie');
    t = t.replace(/\b(battery|metrics|matter)\b/g, 'matrix');
    t = t.replace(/\b(dosier|docier)\b/g, 'dossier');
    t = t.replace(/\b(resect|re set)\b/g, 'reset');

    return t;
  }

  /**
   * God-Level Multi-Modal Voice Router
   * Maps spoken speech to every interactive UI feature of the application
   */
  handleVoiceCommand(rawTranscript) {
    const text = this.normalizeNoise(rawTranscript);
    console.log('[VoiceSystem] Normalized speech:', text, `(Raw: "${rawTranscript}")`);

    // =========================================================================
    // 1. SPECIFIC COOKIE SIMULATOR COMMANDS (Checked before generic "audit")
    // =========================================================================
    if (/\b(cookie|cookies|dark pattern|dark patterns|simulator banner)\b/.test(text) &&
        !text.includes('accept') && !text.includes('reject') && !text.includes('preference') && !text.includes('shame')) {
      this.triggerCommand('audit-cookies', 'Navigating to Deceptive Banner Simulator. Inspecting manipulative UX patterns.', '🍪 Deceptive Pattern Simulator');
      return;
    }

    if (text.includes('accept all') || text.includes('accept cookie') || text.includes('accept cookies') || text.includes('accept trap') || text.includes('fall in trap')) {
      this.triggerCommand('sim-accept-trap', 'Triggered deceptive trap: accepted 427 ad trackers with 1 click.', '⚠️ Dark Pattern Accepted (+427 Trackers)');
      return;
    }

    if (text.includes('reject all') || text.includes('reject cookie') || text.includes('reject cookies') || text.includes('reject optional') || text.includes('ethical reject') || text.includes('reject non-essential')) {
      this.triggerCommand('sim-reject-ethical', 'Ethical Privacy Preserved: all optional tracking rejected in one click.', '✅ Ethical Reject (Zero Telemetry)');
      return;
    }

    if (text.includes('open settings') || text.includes('show preference') || text.includes('cookie preference') || text.includes('show options') || text.includes('roach motel')) {
      this.triggerCommand('sim-open-settings', 'Roach Motel preferences opened. Manual unticking of 427 vendors required.', '⚠️ Roach Motel Obstruction Opened');
      return;
    }

    if (text.includes('confirm shame') || text.includes('confirmshame') || text.includes('dislike safe') || text.includes('shame')) {
      this.triggerCommand('sim-confirmshame', 'Confirmshaming triggered: emotional guilt applied to privacy refusal.', '⚠️ Confirmshaming Identified');
      return;
    }

    if (text.includes('reset simulator') || text.includes('restart simulator') || text.includes('clear simulator')) {
      this.triggerCommand('sim-reset', 'Cookie Banner Simulator reset to initial benchmark.', '🔄 Simulator Reset');
      return;
    }

    // =========================================================================
    // 2. BLOCK TRACKERS / PRIVACY BY DEFAULT (Noise-resilient)
    // =========================================================================
    if (text.includes('block tracker') || text.includes('block trackers') ||
        /\b(trackers?|crackers?)\b/.test(text) ||
        /\b(block|protect|shield|stop tracking|privacy by default)\b/.test(text)) {
      this.triggerCommand('block-trackers', 'Third-party tracking blocked across all vectors. Privacy-by-Design default parameters enforced.', '🛡️ All 427 Trackers Blocked');
      return;
    }

    // =========================================================================
    // 3. PRIVACY RISK CALCULATOR & THREAT SENSORS
    // =========================================================================
    if (text.includes('preset strict') || text.includes('strict mode') || text.includes('fortified')) {
      this.triggerCommand('calc-preset-strict', 'Privacy-by-Default preset active. All invasive sensors disabled.', '🛡️ Preset: Privacy-by-Default');
      return;
    }

    if (text.includes('preset balanced') || text.includes('balanced preset') || text.includes('moderate')) {
      this.triggerCommand('calc-preset-balanced', 'Balanced preset active: standard telemetry with 30-day retention.', '⚖️ Preset: Balanced');
      return;
    }

    if (text.includes('preset social') || text.includes('preset predatory') || text.includes('social media preset') || text.includes('maximum risk') || text.includes('max risk')) {
      this.triggerCommand('calc-preset-social', 'Predatory social media preset active: maximum surveillance score.', '🚨 Preset: Predatory Social Media');
      return;
    }

    if (text.includes('toggle biometric') || text.includes('biometric') || text.includes('facial emotion')) {
      this.triggerCommand('calc-toggle-biometric', 'Biometric & Facial Emotion mesh permission toggled.', '👁️ Biometric Profiling Toggled');
      return;
    }

    if (text.includes('toggle location') || text.includes('location') || text.includes('gps')) {
      this.triggerCommand('calc-toggle-location', 'High-Precision GPS location telemetry toggled.', '📍 Geolocation Sensor Toggled');
      return;
    }

    if (text.includes('toggle audio') || text.includes('microphone stream') || text.includes('ambient audio')) {
      this.triggerCommand('calc-toggle-audio', 'Continuous ambient microphone capture toggled.', '🎙️ Audio Eavesdropping Toggled');
      return;
    }

    if (text.includes('toggle broker') || text.includes('data broker') || text.includes('brokerage')) {
      this.triggerCommand('calc-toggle-broker', 'Third-party data brokerage syndication toggled.', '💰 Data Broker Selling Toggled');
      return;
    }

    if (text.includes('toggle fingerprint') || text.includes('canvas fingerprint') || text.includes('fingerprint')) {
      this.triggerCommand('calc-toggle-fingerprint', 'Browser canvas fingerprinting vector toggled.', '🖥️ Canvas Fingerprint Toggled');
      return;
    }

    if (/\b(risk|calculator|meter|threat score|gauge)\b/.test(text)) {
      this.triggerCommand('show-calculator', 'Displaying Quantitative Privacy Risk Score Meter.', '📊 Privacy Risk Score Meter');
      return;
    }

    // =========================================================================
    // 4. ETHICAL AI CONSENT MATRIX (Topic 5)
    // =========================================================================
    if (text.includes('toggle training') || text.includes('model training') || text.includes('retraining')) {
      this.triggerCommand('ai-toggle-training', 'LLM training dataset scraping permission toggled.', '🤖 Model Retraining Toggled');
      return;
    }

    if (text.includes('toggle human review') || text.includes('human annotation') || text.includes('human reviewer')) {
      this.triggerCommand('ai-toggle-human', 'Third-party human RLHF review permission toggled.', '👥 Human Review Toggled');
      return;
    }

    if (text.includes('toggle differential privacy') || text.includes('pii masking') || text.includes('differential privacy')) {
      this.triggerCommand('ai-toggle-diffprivacy', 'Client-side differential privacy & PII masking toggled.', '🔒 Differential Privacy Toggled');
      return;
    }

    if (text.includes('toggle ephemeral') || text.includes('ephemeral context') || text.includes('session wipe')) {
      this.triggerCommand('ai-toggle-ephemeral', 'Zero-persistence ephemeral context cache toggled.', '⏳ Ephemeral Memory Toggled');
      return;
    }

    if (text.includes('sample medical') || text.includes('medical prompt') || text.includes('test medical')) {
      this.triggerCommand('ai-sample-medical', 'Injected sensitive medical prompt with doctor name and health vectors.', '🩺 Medical PII Sample Loaded');
      return;
    }

    if (text.includes('sample key') || text.includes('secret key') || text.includes('api key')) {
      this.triggerCommand('ai-sample-key', 'Injected secret API token prompt for client-side redaction test.', '🔑 Secret Key Sample Loaded');
      return;
    }

    if (/\b(ai|consent|matrix|llm|consent log)\b/.test(text)) {
      this.triggerCommand('show-consent', 'Navigating to Ethical AI Consent Matrix and prompt telemetry log.', '🧠 Ethical AI Consent Matrix');
      return;
    }

    // =========================================================================
    // 5. ACADEMIC INSPECTOR DRAWER & SIMULATION ACTIONS
    // =========================================================================
    if (text.includes('fast scan') || text.includes('60x scan') || text.includes('run fast scan') || text.includes('fast audit')) {
      this.triggerCommand('fast-audit', 'Fast-forward audit running at 60x speed across 14 telemetry pipelines.', '⚡ 60x Fast Audit Running');
      return;
    }

    if (text.includes('inject tracker') || text.includes('tracker alert') || text.includes('simulate tracker')) {
      this.triggerCommand('inject-tracker', 'Injected rogue third-party tracking beacon. Contextual Integrity alert raised.', '🚨 Rogue Tracker Injected');
      return;
    }

    if (text.includes('simulate breach') || text.includes('trigger breach') || text.includes('breach simulation')) {
      this.triggerCommand('simulate-breach', 'Simulated data breach intercepted and mitigated client-side.', '⚠️ Breach Mitigation Tested');
      return;
    }

    if (text.includes('reset telemetry') || text.includes('reset inspector')) {
      this.triggerCommand('reset-telemetry', 'Academic inspector telemetry reset to baseline.', '🔄 Telemetry Reset');
      return;
    }

    if (/\b(open inspector|inspector|drawer|telemetry)\b/.test(text)) {
      this.triggerCommand('open-inspector', 'Academic Privacy Inspector drawer opened. Contextual Integrity metrics loaded.', '📋 Academic Privacy Inspector');
      return;
    }

    // Generic Privacy Scan / Deep Audit
    if (/\b(scan|audit|start scan|run scan|privacy scan|deep scan)\b/.test(text)) {
      this.triggerCommand('start-audit', 'Privacy audit initiated. Scanning 14 tracking vectors across network pipelines.', '⚡ Running Deep Privacy Scan');
      return;
    }

    // =========================================================================
    // 6. EXAMINER VIVA DOSSIER & TAB NAVIGATION
    // =========================================================================
    if (text.includes('tab pattern') || text.includes('deceptive patterns tab')) {
      this.triggerCommand('dossier-tab-patterns', 'Opened Deceptive Patterns taxonomy tab.', '😈 Brignull Taxonomy Tab');
      return;
    }

    if (text.includes('tab pbd') || text.includes('privacy by design tab') || text.includes('tab principles')) {
      this.triggerCommand('dossier-tab-pbd', 'Opened 7 Privacy by Design Principles tab.', '🛡️ 7 Principles of PbD Tab');
      return;
    }

    if (text.includes('tab heuristic') || text.includes('nielsen tab') || text.includes('usability tab')) {
      this.triggerCommand('dossier-tab-heuristics', 'Opened Jakob Nielsen Usability Heuristics tab.', '📐 Nielsen Heuristics Tab');
      return;
    }

    if (text.includes('tab viva') || text.includes('viva qa') || text.includes('questions tab')) {
      this.triggerCommand('dossier-tab-viva', 'Opened Examiner Viva Defense Q&A tab.', '🎓 Examiner Viva Q&A Tab');
      return;
    }

    if (/\b(dossier|viva|theory|examiner|framework|frameworks)\b/.test(text)) {
      this.triggerCommand('show-dossier', 'Opening Examiner Viva Dossier and Academic Heuristics.', '🎓 Examiner Viva Dossier');
      return;
    }

    // =========================================================================
    // 7. PAGE NAVIGATION & SMOOTH SCROLLING
    // =========================================================================
    if (text.includes('scroll top') || text.includes('go to top') || text.includes('top of page') || text.includes('back to top')) {
      this.triggerCommand('scroll-top', 'Scrolling to top of page.', '⬆️ Scrolled to Top');
      return;
    }

    if (text.includes('scroll bottom') || text.includes('go to bottom') || text.includes('footer')) {
      this.triggerCommand('scroll-bottom', 'Scrolling to page footer.', '⬇️ Scrolled to Bottom');
      return;
    }

    if (text.includes('scroll down') || text.includes('go down') || text.includes('page down')) {
      this.triggerCommand('scroll-down', 'Scrolling down page.', '⬇️ Page Down');
      return;
    }

    if (text.includes('scroll up') || text.includes('go up') || text.includes('page up')) {
      this.triggerCommand('scroll-up', 'Scrolling up page.', '⬆️ Page Up');
      return;
    }

    // =========================================================================
    // 8. ACCESSIBILITY, AUDIO & SYSTEM CONTROLS
    // =========================================================================
    if (/\b(contrast|high contrast|black and white|accessibility)\b/.test(text)) {
      this.triggerCommand('high-contrast', 'High contrast mode toggled. Contrast ratio elevated to WCAG AAA standard.', '🌓 WCAG AAA High Contrast');
      return;
    }

    if (/\b(increase font|larger font|bigger text|zoom text|scale text)\b/.test(text)) {
      this.triggerCommand('increase-font', 'Typography scaled up for enhanced readability.', '🔤 Font Scaled Up');
      return;
    }

    if (/\b(decrease font|smaller font|reduce font)\b/.test(text)) {
      this.triggerCommand('decrease-font', 'Typography scale reduced.', '🔤 Font Scaled Down');
      return;
    }

    if (/\b(reset font|normal font|100 percent)\b/.test(text)) {
      this.triggerCommand('reset-font', 'Typography scale restored to 100 percent baseline.', '🔤 Font Reset to 100%');
      return;
    }

    if (text.includes('unmute') || text.includes('sound on') || text.includes('enable audio')) {
      this.triggerCommand('unmute-sound', 'Procedural acoustic sound effects enabled.', '🔊 Sound Effects Active');
      return;
    }

    if (/\b(mute|silent|silence)\b/.test(text)) {
      this.triggerCommand('mute-sound', 'Procedural acoustic sound effects muted.', '🔇 Sound Effects Muted');
      return;
    }

    if (text.includes('toggle examiner mode') || text.includes('examiner mode')) {
      this.triggerCommand('toggle-examiner-mode', 'Global Examiner Mode highlights toggled.', '🔍 Examiner Mode Toggled');
      return;
    }

    if (text.includes('stop voice') || text.includes('turn off voice') || text.includes('stop listening') || text.includes('deactivate voice') || text.includes('stop mic')) {
      this.triggerCommand('stop-voice', 'Voice control deactivated.', '🎤 Voice Control Deactivated');
      return;
    }

    if (/\b(close|exit|dismiss|cancel|hide)\b/.test(text)) {
      this.triggerCommand('close-overlays', 'Overlays and active dialogs closed.', '✕ Dialogs Closed');
      return;
    }

    if (/\b(help|commands|shortcuts|what can i say|voice help)\b/.test(text)) {
      this.triggerCommand('help', 'Opening voice commands and keyboard switch navigation help palette.', '❓ Voice & Switch Access Help');
      return;
    }

    // Unrecognized fallback feedback
    if (this.transcriptEl) {
      this.transcriptEl.textContent = `Unrecognized: "${text}" (Say "Help")`;
    }
    this.showActionHUD('⚠️ Unrecognized Command', `Heard: "${text}". Say "Help" for all commands.`, 'warning');
  }

  triggerCommand(commandId, spokenFeedback, hudTitle = '') {
    if (this.audio) this.audio.playShieldEngage();

    // Show visual HUD notification immediately
    if (hudTitle) {
      this.showActionHUD(hudTitle, spokenFeedback, 'action');
    }

    // Audible spoken confirmation
    this.speak(spokenFeedback);

    // Execute application action
    if (this.onCommand) {
      this.onCommand(commandId);
    }
  }

  /**
   * Spoken Text-to-Speech Output (window.speechSynthesis)
   * Suppresses microphone input while speaking to prevent feedback loops.
   */
  speak(text) {
    if (!this.speechSynthesis || this.ttsMuted || !text) return;

    // Rate-limit identical utterances within 1.5 seconds
    const now = Date.now();
    if (text === this.lastSpokenText && now - this.lastSpokenTime < 1500) {
      return;
    }
    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    try {
      this.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.95;

      // Suppress mic input while computer is speaking
      this.isSpeakingTTS = true;

      utterance.onend = () => {
        // Resume listening 300ms after audio finishes
        setTimeout(() => {
          this.isSpeakingTTS = false;
        }, 300);
      };

      utterance.onerror = () => {
        this.isSpeakingTTS = false;
      };

      const applyVoice = () => {
        const voices = this.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') ||
           v.name.includes('Samantha') || v.name.includes('Daniel'))
        );
        if (preferredVoice) utterance.voice = preferredVoice;
      };

      if (this.speechSynthesis.getVoices().length > 0) {
        applyVoice();
        this.speechSynthesis.speak(utterance);
      } else {
        this.speechSynthesis.onvoiceschanged = () => {
          applyVoice();
          this.speechSynthesis.speak(utterance);
          this.speechSynthesis.onvoiceschanged = null;
        };
        setTimeout(() => {
          if (!utterance.voice) {
            this.speechSynthesis.speak(utterance);
          }
        }, 350);
      }
    } catch (e) {
      this.isSpeakingTTS = false;
      console.warn('[VoiceSystem] Speech synthesis error:', e);
    }
  }

  toggleTTSMute() {
    this.ttsMuted = !this.ttsMuted;
    localStorage.setItem('privacyguard_tts_muted', String(this.ttsMuted));
    if (this.ttsMuted && this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.isSpeakingTTS = false;
    }
    return this.ttsMuted;
  }

  /**
   * On-Screen Live Action Notification (HUD Toast)
   * Visually displays the voice action executing in real-time
   */
  injectActionHUD() {
    const hud = document.createElement('div');
    hud.id = 'voice-action-hud';
    hud.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 opacity-0 -translate-y-4';
    hud.innerHTML = `
      <div id="voice-hud-card" class="px-5 py-3 rounded-2xl bg-slate-950/95 border-2 border-cyan-400 text-white shadow-2xl backdrop-blur-xl flex items-center gap-3 font-mono">
        <div id="voice-hud-icon" class="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-base shrink-0">
          ⚡
        </div>
        <div>
          <div id="voice-hud-title" class="text-xs sm:text-sm font-bold text-cyan-300">
            Voice Action Executing
          </div>
          <div id="voice-hud-subtitle" class="text-[11px] text-slate-300 font-sans max-w-sm sm:max-w-md truncate">
            Details loading...
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(hud);
    this.actionHudEl = hud;
  }

  showActionHUD(title, subtitle, type = 'action') {
    if (!this.actionHudEl) return;

    const titleEl = document.getElementById('voice-hud-title');
    const subtitleEl = document.getElementById('voice-hud-subtitle');
    const cardEl = document.getElementById('voice-hud-card');
    const iconEl = document.getElementById('voice-hud-icon');

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;

    if (cardEl && iconEl) {
      if (type === 'warning') {
        cardEl.className = 'px-5 py-3 rounded-2xl bg-slate-950/95 border-2 border-amber-400 text-white shadow-2xl backdrop-blur-xl flex items-center gap-3 font-mono ring-4 ring-amber-500/20';
        iconEl.className = 'w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base shrink-0';
        iconEl.textContent = '⚠️';
      } else if (type === 'info') {
        cardEl.className = 'px-5 py-3 rounded-2xl bg-slate-950/95 border-2 border-slate-600 text-white shadow-2xl backdrop-blur-xl flex items-center gap-3 font-mono';
        iconEl.className = 'w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-base shrink-0';
        iconEl.textContent = 'ℹ️';
      } else if (type === 'success') {
        cardEl.className = 'px-5 py-3 rounded-2xl bg-slate-950/95 border-2 border-emerald-400 text-white shadow-2xl backdrop-blur-xl flex items-center gap-3 font-mono ring-4 ring-emerald-500/20';
        iconEl.className = 'w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base shrink-0 animate-pulse';
        iconEl.textContent = '✅';
      } else {
        cardEl.className = 'px-5 py-3 rounded-2xl bg-slate-950/95 border-2 border-cyan-400 text-white shadow-2xl backdrop-blur-xl flex items-center gap-3 font-mono ring-4 ring-cyan-500/20';
        iconEl.className = 'w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-base shrink-0 animate-pulse';
        iconEl.textContent = '⚡';
      }
    }

    // Reveal HUD
    this.actionHudEl.classList.remove('opacity-0', '-translate-y-4');
    this.actionHudEl.classList.add('opacity-100', 'translate-y-0');

    // Auto-dismiss after 3.2 seconds
    clearTimeout(this.hudTimer);
    this.hudTimer = setTimeout(() => {
      if (this.actionHudEl) {
        this.actionHudEl.classList.remove('opacity-100', 'translate-y-0');
        this.actionHudEl.classList.add('opacity-0', '-translate-y-4');
      }
    }, 3200);
  }

  injectFloatingWidget() {
    const widget = document.createElement('div');
    widget.id = 'floating-voice-widget';
    widget.className = 'fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl cyber-card border border-slate-700/80 shadow-2xl transition-all duration-300';
    widget.setAttribute('role', 'region');
    widget.setAttribute('aria-label', 'Voice control status indicator');

    widget.innerHTML = `
      <button id="floating-mic-toggle-btn" class="w-9 h-9 rounded-xl flex items-center justify-center transition-all focus:outline-none" aria-label="Toggle hands-free speech recognition (Hotkey: V)">
        <span id="floating-mic-icon-wrapper" class="relative flex items-center justify-center">
          <svg class="w-5 h-5 text-slate-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
        </span>
      </button>

      <div class="flex flex-col pr-1">
        <div class="flex items-center gap-1.5">
          <span id="voice-state-dot" class="w-2 h-2 rounded-full bg-slate-500"></span>
          <span id="voice-state-label" class="text-[11px] font-mono font-bold text-slate-300">Voice Inactive (Key 'V')</span>
        </div>
        <span id="voice-transcript-preview" class="text-[10px] font-mono text-cyan-400 max-w-[210px] truncate">Say "Help" or "Start scan"</span>
      </div>

      <button id="floating-voice-help-btn" class="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg transition" title="Voice Commands Help" aria-label="View all voice commands">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </button>
    `;

    document.body.appendChild(widget);

    this.floatingBadge = widget;
    this.transcriptEl = widget.querySelector('#voice-transcript-preview');
    this.stateDot = widget.querySelector('#voice-state-dot');

    widget.querySelector('#floating-mic-toggle-btn')?.addEventListener('click', () => {
      this.toggleListening();
    });

    widget.querySelector('#floating-voice-help-btn')?.addEventListener('click', () => {
      if (this.onCommand) this.onCommand('help');
    });

    this.updateUIState();
  }

  updateUIState() {
    const label = document.getElementById('voice-state-label');
    const micIconWrapper = document.getElementById('floating-mic-icon-wrapper');
    const headerBtn = document.getElementById('header-mic-btn');

    if (this.isListening) {
      if (this.stateDot) this.stateDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-ping';
      if (label) {
        label.textContent = 'Listening (Speak now)...';
        label.className = 'text-[11px] font-mono font-bold text-emerald-400';
      }
      if (this.floatingBadge) {
        this.floatingBadge.classList.add('border-cyan-500/60', 'shadow-cyan-950/60');
      }
      if (micIconWrapper) {
        micIconWrapper.innerHTML = `
          <span class="absolute -inset-1 rounded-full bg-cyan-500/30 animate-pulse"></span>
          <svg class="w-5 h-5 text-cyan-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
        `;
      }
      if (headerBtn) {
        headerBtn.classList.add('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300');
        headerBtn.setAttribute('aria-pressed', 'true');
      }
    } else {
      if (this.stateDot) this.stateDot.className = 'w-2 h-2 rounded-full bg-slate-500';
      if (label) {
        label.textContent = "Voice Inactive (Key 'V')";
        label.className = 'text-[11px] font-mono font-bold text-slate-300';
      }
      if (this.floatingBadge) {
        this.floatingBadge.classList.remove('border-cyan-500/60', 'shadow-cyan-950/60');
      }
      if (micIconWrapper) {
        micIconWrapper.innerHTML = `
          <svg class="w-5 h-5 text-slate-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
        `;
      }
      if (headerBtn) {
        headerBtn.classList.remove('bg-cyan-500/20', 'border-cyan-400', 'text-cyan-300');
        headerBtn.setAttribute('aria-pressed', 'false');
      }
    }
  }
}
