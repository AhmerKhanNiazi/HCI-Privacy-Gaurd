/**
 * PrivacyGuard UX - Two-Way Voice System (Speech Recognition & Spoken TTS)
 * 
 * Supports users with physical motor impairments and visual impairments
 * by enabling hands-free navigation, voice commands, and audible confirmations.
 */

export class VoiceSystem {
  constructor(options = {}) {
    this.audio = options.audio || null;
    this.accessibility = options.accessibility || null;
    this.onCommand = options.onCommand || null;

    this.recognition = null;
    this.isListening = false;
    this.speechSynthesis = window.speechSynthesis || null;
    this.ttsMuted = localStorage.getItem('privacyguard_tts_muted') === 'true';

    // UI elements
    this.floatingBadge = null;
    this.transcriptEl = null;
    this.stateDot = null;
    this.headerMicBtn = null;

    this.lastSpokenText = '';
    this.lastSpokenTime = 0;

    this.initRecognition();
    this.injectFloatingWidget();
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
        // If meant to keep listening, restart smoothly
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            this.isListening = false;
            this.updateUIState();
          }
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
          this.speak('Microphone access was denied. Please allow microphone permissions to use voice control.');
        }
      };

      this.recognition.onresult = (event) => {
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
          this.handleVoiceCommand(finalTranscript.toLowerCase());
        }
      };
    } catch (err) {
      console.warn('[VoiceSystem] Could not initialize speech recognition:', err);
    }
  }

  toggleListening() {
    if (!this.recognition) {
      this.speak('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return false;
    }

    if (this.isListening) {
      this.isListening = false;
      try {
        this.recognition.stop();
      } catch (e) {}
      this.updateUIState();
      this.speak('Voice control deactivated.');
      return false;
    } else {
      try {
        this.recognition.start();
        return true;
      } catch (e) {
        console.warn('[VoiceSystem] Error starting recognition:', e);
        return false;
      }
    }
  }

  handleVoiceCommand(rawTranscript) {
    const text = rawTranscript.toLowerCase().trim();
    console.log('[VoiceSystem] Recognized command:', text);

    // Command mapping matrix — IDs must match app.js handleVoiceCommand() switch cases exactly
    if (text.includes('start privacy scan') || text.includes('privacy scan') || text.includes('scan privacy') || text.includes('run scan')) {
      this.triggerCommand('start-audit', 'Privacy audit initiated. Scanning 14 tracking vectors across network pipelines.');
    } else if (text.includes('block tracker') || text.includes('block tracking') || text.includes('block all')) {
      this.triggerCommand('block-trackers', 'Third-party tracking blocked. Privacy-by-Design default parameters enforced.');
    } else if (text.includes('consent log') || text.includes('show consent') || text.includes('ai consent')) {
      this.triggerCommand('show-consent', 'Navigating to Ethical AI Consent Matrix and prompt telemetry log.');
    } else if (text.includes('audit cookie') || text.includes('cookie audit') || text.includes('simulator')) {
      this.triggerCommand('audit-cookies', 'Navigating to Cookie Banner Simulator. Deceptive versus Ethical patterns active.');
    } else if (text.includes('high contrast') || text.includes('contrast mode')) {
      this.triggerCommand('high-contrast', 'High contrast mode toggled. Contrast ratio elevated to WCAG AAA standard.');
    } else if (text.includes('increase font') || text.includes('larger font') || text.includes('bigger text') || text.includes('font size')) {
      this.triggerCommand('increase-font', 'Typography scaled up for enhanced readability.');
    } else if (text.includes('mute sound') || text.includes('mute audio') || (text.includes('mute') && !text.includes('unmute'))) {
      this.triggerCommand('mute-sound', 'Procedural acoustic sound effects muted.');
    } else if (text.includes('unmute sound') || text.includes('unmute audio') || text.includes('sound on') || text.includes('unmute')) {
      this.triggerCommand('mute-sound', 'Procedural acoustic sound effects enabled.');
    } else if (text.includes('open inspector') || text.includes('show inspector') || text.includes('inspector') || text.includes('telemetry')) {
      this.triggerCommand('open-inspector', 'Academic Privacy Inspector drawer opened. Contextual Integrity metrics loaded.');
    } else if (text.includes('close') || text.includes('exit') || text.includes('dismiss')) {
      this.triggerCommand('close-overlays', 'Dialog closed.');
    } else if (text.includes('help') || text.includes('command') || text.includes('shortcut')) {
      this.triggerCommand('help', 'Opening voice commands and keyboard switch navigation help palette.');
    } else {
      // Unrecognized fallback feedback
      if (this.transcriptEl) {
        this.transcriptEl.textContent = `Unrecognized: "${text}" (Say "Help")`;
      }
    }
  }

  triggerCommand(commandId, spokenFeedback) {
    if (this.audio) this.audio.playShieldEngage();
    this.speak(spokenFeedback);

    if (this.onCommand) {
      this.onCommand(commandId);
    }
  }

  /**
   * Spoken Text-to-Speech Output (window.speechSynthesis)
   * Handles cancellation, rate-limiting, and screen reader collision prevention.
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
      this.speechSynthesis.cancel(); // Cancel any stalled utterance

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05; // Slightly brisk, clear pace
      utterance.pitch = 1.0;
      utterance.volume = 0.95;

      // Helper to select voice after they are guaranteed loaded
      const applyVoice = () => {
        const voices = this.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') ||
           v.name.includes('Samantha') || v.name.includes('Daniel'))
        );
        if (preferredVoice) utterance.voice = preferredVoice;
      };

      // Chrome loads voices asynchronously — wait for onvoiceschanged if empty
      if (this.speechSynthesis.getVoices().length > 0) {
        applyVoice();
        this.speechSynthesis.speak(utterance);
      } else {
        this.speechSynthesis.onvoiceschanged = () => {
          applyVoice();
          this.speechSynthesis.speak(utterance);
          this.speechSynthesis.onvoiceschanged = null; // Fire only once
        };
        // Fallback: speak without preferred voice after 400ms if event never fires
        setTimeout(() => {
          if (utterance.voice === null || utterance.voice === undefined) {
            this.speechSynthesis.speak(utterance);
          }
        }, 400);
      }
    } catch (e) {
      console.warn('[VoiceSystem] Speech synthesis error:', e);
    }
  }

  toggleTTSMute() {
    this.ttsMuted = !this.ttsMuted;
    localStorage.setItem('privacyguard_tts_muted', this.ttsMuted);
    if (this.ttsMuted && this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    return this.ttsMuted;
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
        <span id="voice-transcript-preview" class="text-[10px] font-mono text-cyan-400 max-w-[190px] truncate">Say "Help" or "Start scan"</span>
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
      if (this.onCommand) this.onCommand('show-help');
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
        label.textContent = 'Voice Inactive (Key \'V\')';
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
