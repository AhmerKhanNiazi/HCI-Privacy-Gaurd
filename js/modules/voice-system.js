/**
 * PrivacyGuard UX - Two-Way Voice System (Speech Recognition & Spoken TTS)
 * 
 * God-Level Hands-Free Multimodal Interaction Engine:
 * - Algorithmic Fuzzy Levenshtein & Phonetic Tolerance for noisy mics & accents
 * - Full hands-free voice control across Simulator, Risk Calculator, AI Matrix, and Examiner Dossier
 * - Interactive visual Action HUD with real-time cyber status
 * - Microphone feedback loop suppression during TTS playback
 * - Crash-proof debounced auto-reconnection in Chromium
 */

function levenshteinDistance(s1, s2) {
  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const v0 = new Int32Array(s2.length + 1);
  const v1 = new Int32Array(s2.length + 1);

  for (let i = 0; i <= s2.length; i++) v0[i] = i;

  for (let i = 0; i < s1.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < s2.length; j++) {
      const cost = s1[i] === s2[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= s2.length; j++) v0[j] = v1[j];
  }

  return v1[s2.length];
}

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
    this.interimDebounceTimer = null;

    this.speechSynthesis = window.speechSynthesis || null;
    this.ttsMuted = localStorage.getItem('privacyguard_tts_muted') === 'true';

    // UI elements
    this.floatingBadge = null;
    this.transcriptEl = null;
    this.stateDot = null;
    this.actionHudEl = null;

    this.lastSpokenText = '';
    this.lastSpokenTime = 0;
    this.lastExecutedCommand = '';
    this.lastExecutedTime = 0;

    this.buildKnowledgeBase();
    this.initRecognition();
    this.injectFloatingWidget();
    this.injectActionHUD();
  }

  buildKnowledgeBase() {
    this.commandCatalog = [
      // 1. SPECIFIC COOKIE SIMULATOR ACTIONS
      {
        id: 'sim-accept-trap',
        title: '⚠️ Dark Pattern Accepted (+427 Trackers)',
        spoken: 'Triggered deceptive trap: accepted 427 ad trackers with 1 click.',
        keywords: ['accept all', 'accept cookie', 'accept cookies', 'fall in trap', 'accept trap', 'trigger trap', 'eksept', 'aksept', 'accept']
      },
      {
        id: 'sim-reject-ethical',
        title: '✅ Ethical Reject (Zero Telemetry)',
        spoken: 'Ethical Privacy Preserved: all optional tracking rejected in one click.',
        keywords: ['reject all', 'reject cookie', 'reject cookies', 'reject non-essential', 'ethical reject', 'reject optional', 'reject', 'riject', 'rejact', 'opt out']
      },
      {
        id: 'sim-open-settings',
        title: '⚠️ Roach Motel Obstruction Opened',
        spoken: 'Roach Motel preferences opened. Manual unticking of 427 vendors required.',
        keywords: ['open settings', 'show preference', 'cookie preference', 'preferences', 'roach motel', 'vendor choices', 'options']
      },
      {
        id: 'sim-confirmshame',
        title: '⚠️ Confirmshaming Identified',
        spoken: 'Confirmshaming triggered: emotional guilt applied to privacy refusal.',
        keywords: ['confirm shame', 'confirmshame', 'dislike safe', 'shame', 'shaming', 'guilt']
      },
      {
        id: 'sim-reset',
        title: '🔄 Simulator Reset',
        spoken: 'Cookie Banner Simulator reset to initial benchmark.',
        keywords: ['reset simulator', 'restart simulator', 'clear simulator', 'reset cookie']
      },
      {
        id: 'audit-cookies',
        title: '🍪 Deceptive Pattern Simulator',
        spoken: 'Navigating to Deceptive Banner Simulator. Inspecting manipulative UX patterns.',
        keywords: ['audit cookie', 'audit cookies', 'cookies', 'cookie', 'cokie', 'cooky', 'simulator', 'dark pattern', 'dark patterns', 'banner', 'deceptive']
      },

      // 2. BLOCK TRACKERS / PRIVACY BY DEFAULT
      {
        id: 'block-trackers',
        title: '🛡️ All 427 Trackers Blocked',
        spoken: 'Third-party tracking blocked across all vectors. Privacy-by-Design default parameters enforced.',
        keywords: ['block tracker', 'block trackers', 'tracker', 'trackers', 'low crackers', 'lock trackers', 'jack tracker', 'black tracker', 'block all', 'protect', 'shield', 'privacy by default', 'stop tracking', 'roko', 'band karo']
      },

      // 3. RISK CALCULATOR PRESETS & SENSORS
      {
        id: 'calc-preset-strict',
        title: '🛡️ Preset: Privacy-by-Default (0%)',
        spoken: 'Privacy-by-Default preset active. All invasive sensors disabled.',
        keywords: ['preset strict', 'strict mode', 'fortified', 'zero risk', 'strict preset', 'clean preset', 'strict']
      },
      {
        id: 'calc-preset-balanced',
        title: '⚖️ Preset: Balanced (45%)',
        spoken: 'Balanced preset active: standard telemetry with 30-day retention.',
        keywords: ['preset balanced', 'balanced preset', 'moderate preset', 'balanced mode', 'moderate', 'balanced']
      },
      {
        id: 'calc-preset-social',
        title: '🚨 Preset: Predatory Social (100%)',
        spoken: 'Predatory social media preset active: maximum surveillance score.',
        keywords: ['preset social', 'preset predatory', 'social media preset', 'max risk', 'maximum risk', 'social preset', 'predatory']
      },
      {
        id: 'calc-toggle-biometric',
        title: '👁️ Biometric Profiling Toggled',
        spoken: 'Biometric & Facial Emotion mesh permission toggled.',
        keywords: ['toggle biometric', 'biometrics', 'biometric', 'facial emotion', 'face scan', 'camera']
      },
      {
        id: 'calc-toggle-location',
        title: '📍 Geolocation Sensor Toggled',
        spoken: 'High-Precision GPS location telemetry toggled.',
        keywords: ['toggle location', 'location', 'gps', 'geolocation', 'triangulation']
      },
      {
        id: 'calc-toggle-audio',
        title: '🎙️ Audio Eavesdropping Toggled',
        spoken: 'Continuous ambient microphone capture toggled.',
        keywords: ['toggle audio', 'ambient audio', 'microphone stream', 'audio capture', 'listening']
      },
      {
        id: 'calc-toggle-broker',
        title: '💰 Data Broker Selling Toggled',
        spoken: 'Third-party data brokerage syndication toggled.',
        keywords: ['toggle broker', 'data broker', 'brokerage', 'data brokers', 'broker']
      },
      {
        id: 'calc-toggle-fingerprint',
        title: '🖥️ Canvas Fingerprint Toggled',
        spoken: 'Browser canvas fingerprinting vector toggled.',
        keywords: ['toggle fingerprint', 'canvas fingerprint', 'fingerprinting', 'fingerprint']
      },
      {
        id: 'show-calculator',
        title: '📊 Privacy Risk Score Meter',
        spoken: 'Displaying Quantitative Privacy Risk Score Meter.',
        keywords: ['risk meter', 'calculator', 'risk calculator', 'threat score', 'risk score', 'threat meter', 'gauge']
      },

      // 4. ETHICAL AI CONSENT MATRIX (TOPIC 5)
      {
        id: 'ai-toggle-training',
        title: '🤖 Model Retraining Toggled',
        spoken: 'LLM training dataset scraping permission toggled.',
        keywords: ['toggle training', 'model training', 'retraining', 'train model', 'dataset ingestion']
      },
      {
        id: 'ai-toggle-human',
        title: '👥 Human Review Toggled',
        spoken: 'Third-party human RLHF review permission toggled.',
        keywords: ['toggle human review', 'human review', 'human annotation', 'contractor review', 'rlhf']
      },
      {
        id: 'ai-toggle-diffprivacy',
        title: '🔒 Differential Privacy Toggled',
        spoken: 'Client-side differential privacy & PII masking toggled.',
        keywords: ['toggle differential privacy', 'differential privacy', 'pii masking', 'masking', 'anonymization']
      },
      {
        id: 'ai-toggle-ephemeral',
        title: '⏳ Ephemeral Memory Toggled',
        spoken: 'Zero-persistence ephemeral context cache toggled.',
        keywords: ['toggle ephemeral', 'ephemeral context', 'session wipe', 'ephemeral memory', 'auto delete']
      },
      {
        id: 'ai-sample-medical',
        title: '🩺 Medical PII Sample Loaded',
        spoken: 'Injected sensitive medical prompt with doctor name and health vectors.',
        keywords: ['sample medical', 'medical prompt', 'test medical', 'doctor prompt', 'health prompt']
      },
      {
        id: 'ai-sample-key',
        title: '🔑 Secret Key Sample Loaded',
        spoken: 'Injected secret API token prompt for client-side redaction test.',
        keywords: ['sample key', 'secret key', 'api key', 'sample api key', 'token prompt']
      },
      {
        id: 'show-consent',
        title: '🧠 Ethical AI Consent Matrix',
        spoken: 'Navigating to Ethical AI Consent Matrix and prompt telemetry log.',
        keywords: ['show consent', 'ai matrix', 'ai consent', 'consent matrix', 'consent log', 'ethical ai', 'ai', 'artificial intelligence']
      },

      // 5. ACADEMIC INSPECTOR & TELEMETRY
      {
        id: 'fast-audit',
        title: '⚡ 60x Fast Audit Running',
        spoken: 'Fast-forward audit running at 60x speed across 14 telemetry pipelines.',
        keywords: ['fast scan', '60x scan', 'fast audit', 'run fast scan', 'speed scan', 'quick scan']
      },
      {
        id: 'inject-tracker',
        title: '🚨 Rogue Tracker Injected',
        spoken: 'Injected rogue third-party tracking beacon. Contextual Integrity alert raised.',
        keywords: ['inject tracker', 'tracker alert', 'simulate tracker', 'trigger tracker', 'add tracker']
      },
      {
        id: 'simulate-breach',
        title: '⚠️ Breach Mitigation Tested',
        spoken: 'Simulated data breach intercepted and mitigated client-side.',
        keywords: ['simulate breach', 'trigger breach', 'breach simulation', 'data breach', 'breach']
      },
      {
        id: 'reset-telemetry',
        title: '🔄 Telemetry Reset',
        spoken: 'Academic inspector telemetry reset to baseline.',
        keywords: ['reset telemetry', 'reset inspector', 'clear telemetry']
      },
      {
        id: 'open-inspector',
        title: '📋 Academic Privacy Inspector',
        spoken: 'Academic Privacy Inspector drawer opened. Contextual Integrity metrics loaded.',
        keywords: ['open inspector', 'show inspector', 'inspector', 'drawer', 'telemetry', 'contextual integrity']
      },
      {
        id: 'start-audit',
        title: '⚡ Running Deep Privacy Scan',
        spoken: 'Privacy audit initiated. Scanning 14 tracking vectors across network pipelines.',
        keywords: ['start scan', 'privacy scan', 'scan', 'audit', 'run scan', 'deep scan', 'threat audit', 'scan now', 'chalao', 'shuru']
      },

      // 6. EXAMINER DOSSIER & TABS
      {
        id: 'dossier-tab-patterns',
        title: '😈 Brignull Taxonomy Tab',
        spoken: 'Opened Deceptive Patterns taxonomy tab.',
        keywords: ['tab pattern', 'tab patterns', 'deceptive patterns tab', 'dark patterns tab']
      },
      {
        id: 'dossier-tab-pbd',
        title: '🛡️ 7 Principles of PbD Tab',
        spoken: 'Opened 7 Privacy by Design Principles tab.',
        keywords: ['tab pbd', 'privacy by design tab', 'tab principles', 'pbd tab']
      },
      {
        id: 'dossier-tab-heuristics',
        title: '📐 Nielsen Heuristics Tab',
        spoken: 'Opened Jakob Nielsen Usability Heuristics tab.',
        keywords: ['tab heuristic', 'tab heuristics', 'nielsen tab', 'usability tab']
      },
      {
        id: 'dossier-tab-viva',
        title: '🎓 Examiner Viva Q&A Tab',
        spoken: 'Opened Examiner Viva Defense Q&A tab.',
        keywords: ['tab viva', 'viva qa', 'questions tab', 'viva tab']
      },
      {
        id: 'show-dossier',
        title: '🎓 Examiner Viva Dossier',
        spoken: 'Opening Examiner Viva Dossier and Academic Heuristics.',
        keywords: ['open dossier', 'dossier', 'viva dossier', 'viva', 'examiner', 'theory', 'frameworks', 'docier', 'dosier']
      },
      {
        id: 'toggle-examiner-mode',
        title: '🔍 Examiner Mode Toggled',
        spoken: 'Global Examiner Mode highlights toggled.',
        keywords: ['toggle examiner mode', 'examiner mode', 'examiner mode on', 'examiner mode off']
      },

      // 7. PAGE SCROLLING & NAVIGATION
      {
        id: 'scroll-top',
        title: '⬆️ Scrolled to Top',
        spoken: 'Scrolling to top of page.',
        keywords: ['scroll top', 'go to top', 'top of page', 'back to top', 'upar', 'top']
      },
      {
        id: 'scroll-bottom',
        title: '⬇️ Scrolled to Bottom',
        spoken: 'Scrolling to page footer.',
        keywords: ['scroll bottom', 'go to bottom', 'bottom of page', 'footer', 'neeche', 'bottom']
      },
      {
        id: 'scroll-down',
        title: '⬇️ Page Down',
        spoken: 'Scrolling down page.',
        keywords: ['scroll down', 'go down', 'page down', 'down']
      },
      {
        id: 'scroll-up',
        title: '⬆️ Page Up',
        spoken: 'Scrolling up page.',
        keywords: ['scroll up', 'go up', 'page up', 'up']
      },

      // 8. ACCESSIBILITY, SOUND & SYSTEM
      {
        id: 'high-contrast',
        title: '🌓 WCAG AAA High Contrast',
        spoken: 'High contrast mode toggled. Contrast ratio elevated to WCAG AAA standard.',
        keywords: ['contrast', 'high contrast', 'contrast mode', 'black and white', 'dark mode', 'accessibility mode']
      },
      {
        id: 'increase-font',
        title: '🔤 Font Scaled Up',
        spoken: 'Typography scaled up for enhanced readability.',
        keywords: ['increase font', 'larger font', 'bigger text', 'zoom text', 'scale text', 'font size', 'bada font', 'zoom']
      },
      {
        id: 'decrease-font',
        title: '🔤 Font Reset to 100%',
        spoken: 'Typography scale restored to 100 percent baseline.',
        keywords: ['decrease font', 'smaller font', 'reset font', 'normal font', '100 percent']
      },
      {
        id: 'unmute-sound',
        title: '🔊 Sound Effects Active',
        spoken: 'Procedural acoustic sound effects enabled.',
        keywords: ['unmute', 'unmute sound', 'unmute audio', 'sound on', 'enable audio', 'audio on']
      },
      {
        id: 'mute-sound',
        title: '🔇 Sound Effects Muted',
        spoken: 'Procedural acoustic sound effects muted.',
        keywords: ['mute', 'mute sound', 'mute audio', 'silence', 'silent', 'quiet']
      },
      {
        id: 'stop-voice',
        title: '🎤 Voice Control Deactivated',
        spoken: 'Voice control deactivated.',
        keywords: ['stop voice', 'turn off voice', 'stop listening', 'deactivate voice', 'stop mic', 'chup', 'band']
      },
      {
        id: 'close-overlays',
        title: '✕ Dialogs Closed',
        spoken: 'Overlays and active dialogs closed.',
        keywords: ['close', 'exit', 'dismiss', 'cancel', 'hide', 'back', 'band']
      },
      {
        id: 'help',
        title: '❓ Voice & Switch Access Help',
        spoken: 'Opening voice commands and keyboard switch navigation help palette.',
        keywords: ['help', 'commands', 'shortcuts', 'what can i say', 'voice help', 'madad', 'options']
      }
    ];
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
          clearTimeout(this.interimDebounceTimer);
          this.handleVoiceCommand(finalTranscript);
        } else if (interimTranscript) {
          // Fallback debounce for noisy headsets where final transcript is delayed
          clearTimeout(this.interimDebounceTimer);
          this.interimDebounceTimer = setTimeout(() => {
            if (!this.isSpeakingTTS && interimTranscript.trim()) {
              this.handleVoiceCommand(interimTranscript);
            }
          }, 850);
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

    // Remove filler noise words
    t = t.replace(/\b(please|can you|hey|could you|just|the|a|an)\b/g, '').trim();

    // Common phonetic distortions from headphone background noise
    t = t.replace(/\b(low crackers|lock trackers|jack tracker|black tracker|block track|low tracker|lock tracker)\b/g, 'block trackers');
    t = t.replace(/\b(start can|dart scan|tart scan|star scan)\b/g, 'start scan');
    t = t.replace(/\b(privy scan|private scan|preview scan|skan)\b/g, 'privacy scan');
    t = t.replace(/\b(cokie|cooky|coke|kooki|kukie)\b/g, 'cookie');
    t = t.replace(/\b(battery|metrics|matter|metrix)\b/g, 'matrix');
    t = t.replace(/\b(dosier|docier|dosiyar)\b/g, 'dossier');
    t = t.replace(/\b(resect|re set)\b/g, 'reset');
    t = t.replace(/\b(riject|rejact|rject)\b/g, 'reject');
    t = t.replace(/\b(eksept|aksept|axcept)\b/g, 'accept');

    return t.replace(/\s+/g, ' ');
  }

  /**
   * Algorithmic Intent Finder with Levenshtein & Soundex Fuzzy Tolerance
   */
  matchIntent(text) {
    if (!text || text.length < 2) return null;

    // --- PASS 1: Exact Substring Matching (Prioritized Order) ---
    for (const cmd of this.commandCatalog) {
      for (const kw of cmd.keywords) {
        if (text.includes(kw)) {
          return cmd;
        }
      }
    }

    // --- PASS 2: Token-Level Fuzzy Levenshtein Distance ---
    const spokenTokens = text.split(/\s+/).filter(w => w.length >= 3);

    let bestMatch = null;
    let highestScore = 0;

    for (const cmd of this.commandCatalog) {
      let cmdScore = 0;

      for (const kw of cmd.keywords) {
        const kwTokens = kw.split(/\s+/).filter(w => w.length >= 3);

        for (const sToken of spokenTokens) {
          for (const kToken of kwTokens) {
            const dist = levenshteinDistance(sToken, kToken);
            const maxLen = Math.max(sToken.length, kToken.length);

            // Distance threshold: allow 1 error for 4-5 chars, 2 errors for 6+ chars
            const allowedDist = maxLen >= 6 ? 2 : (maxLen >= 4 ? 1 : 0);

            if (dist <= allowedDist) {
              const similarity = (maxLen - dist) / maxLen;
              cmdScore += similarity * 2;
            }
          }
        }
      }

      if (cmdScore > highestScore && cmdScore >= 1.5) {
        highestScore = cmdScore;
        bestMatch = cmd;
      }
    }

    return bestMatch;
  }

  /**
   * God-Level Multi-Modal Voice Router
   */
  handleVoiceCommand(rawTranscript) {
    const text = this.normalizeNoise(rawTranscript);
    console.log('[VoiceSystem] Normalized speech:', text, `(Raw: "${rawTranscript}")`);

    // Prevent immediate duplicate executions within 1.2s
    const now = Date.now();
    if (now - this.lastExecutedTime < 1200 && text === this.lastExecutedCommand) {
      return;
    }

    const matched = this.matchIntent(text);

    if (matched) {
      this.lastExecutedCommand = text;
      this.lastExecutedTime = now;
      this.triggerCommand(matched.id, matched.spoken, matched.title);
    } else {
      // Unrecognized fallback feedback
      if (this.transcriptEl) {
        this.transcriptEl.textContent = `Unrecognized: "${text}" (Say "Help")`;
      }
      this.showActionHUD('⚠️ Command Not Recognized', `Heard: "${text}". Say "Help" for all commands.`, 'warning');
    }
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
