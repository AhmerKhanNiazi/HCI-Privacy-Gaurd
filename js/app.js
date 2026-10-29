/**
 * PrivacyGuard UX - Main Application Bootstrap & Orchestrator
 * 
 * Pair Programming HCI Architecture:
 * - Module 1: DarkPatternSimulator (Topic 12)
 * - Module 2: PrivacyRiskCalculator (Topic 12)
 * - Module 3: AIConsentMatrix (Topic 5)
 * - Module 4: ExaminerModal (Examiner Viva Mode)
 * - Module 5: AudioFeedback (Procedural Web Audio API Chimes & Earcons)
 * - Module 6: AccessibilityManager (WCAG 2.1 AAA Live Regions & Switch Access)
 * - Module 7: VoiceSystem (Two-Way Speech Recognition & Spoken Feedback)
 * - Module 8: PrivacyInspectorDrawer (Academic Privacy Telemetry & Simulation)
 */

import { DarkPatternSimulator } from './modules/dark-pattern-sim.js';
import { PrivacyRiskCalculator } from './modules/privacy-calc.js';
import { AIConsentMatrix } from './modules/ai-consent-matrix.js';
import { ExaminerModal } from './modules/examiner-modal.js';
import { AudioFeedback } from './modules/audio-feedback.js';
import { AccessibilityManager } from './modules/accessibility-manager.js';
import { VoiceSystem } from './modules/voice-system.js';
import { PrivacyInspectorDrawer } from './modules/privacy-inspector-drawer.js';

class PrivacyGuardApp {
  constructor() {
    this.examinerModeActive = true;

    // Core HCI Subsystems
    this.audio = null;
    this.accessibility = null;
    this.voiceSystem = null;
    this.privacyInspectorDrawer = null;
    this.examinerModal = null;
    this.simulator = null;
    this.calculator = null;
    this.aiMatrix = null;
  }

  init() {
    // 1. Procedural Acoustic Sensory Feedback (Web Audio API)
    this.audio = new AudioFeedback();

    // 2. WCAG 2.1 AAA Accessibility & Switch Access Manager
    this.accessibility = new AccessibilityManager({
      audio: this.audio,
      onAction: (action) => this.handleAccessibilityAction(action)
    });

    // 3. Two-Way Voice System (Speech Recognition & Spoken TTS)
    this.voiceSystem = new VoiceSystem({
      audio: this.audio,
      accessibility: this.accessibility,
      onCommand: (commandId) => this.handleVoiceCommand(commandId)
    });

    // 4. Academic Evaluation Tools: Privacy Inspector Drawer (Hotkey: I)
    this.privacyInspectorDrawer = new PrivacyInspectorDrawer({
      audio: this.audio,
      accessibility: this.accessibility,
      voiceSystem: this.voiceSystem
    });

    // 5. Examiner Explainer Dossier Modal
    this.examinerModal = new ExaminerModal();
    this.examinerModal.init();

    // 6. Feature 1: Dark Pattern Simulator
    this.simulator = new DarkPatternSimulator(
      'simulator-container',
      (patternId) => {
        this.audio?.playChirp(true);
        this.examinerModal.show(patternId);
      },
      () => {
        this.updateExaminerHighlights();
      }
    );
    this.simulator.init();

    // 7. Feature 2: Dynamic Privacy Risk Calculator
    this.calculator = new PrivacyRiskCalculator('calculator-container');
    this.calculator.init();

    // 8. Feature 3: Ethical AI Consent Matrix
    this.aiMatrix = new AIConsentMatrix('ai-matrix-container');
    this.aiMatrix.init();

    // 9. Wire Controls
    this.setupGlobalControls();
    this.setupToolbarBindings();
    this.wireInteractiveAcoustics();
    this.updateExaminerHighlights();

    // 10. Register Service Worker for offline PWA operation
    this.registerServiceWorker();
  }

  /**
   * Action Router for Keyboard Switch Access (V, P, C, F, I, M, Esc, ?)
   * IDs must exactly match what accessibility-manager.js fires via onAction()
   */
  handleAccessibilityAction(action) {
    switch (action) {
      case 'toggle-voice':
        this.voiceSystem?.toggleListening();
        break;
      case 'privacy-scan':
        this.runPrivacyScan();
        break;
      case 'toggle-inspector':   // Hotkey I — fired by accessibility-manager
        this.privacyInspectorDrawer?.toggle();
        break;
      case 'open-inspector':     // Also accepted for compatibility
        this.privacyInspectorDrawer?.toggle();
        break;
      case 'toggle-audio':       // Hotkey M — fired by accessibility-manager
        this.toggleAudioMute();
        break;
      case 'close-overlays':     // Hotkey Esc
      case 'close-all':
        this.closeAllOverlays();
        break;
    }
  }

  /**
   * Command Router for Two-Way Voice System
   * Executes visual, audible, and DOM state updates for every recognized voice command
   */
  handleVoiceCommand(commandId) {
    console.log(`[Voice Router] Executing action: ${commandId}`);

    switch (commandId) {
      // --- 1. CORE PRIVACY & THREAT SCAN ---
      case 'start-audit':
        this.runPrivacyScan();
        break;

      case 'block-trackers':
        this.blockTrackers();
        break;

      // --- 2. DECEPTIVE PATTERN SIMULATOR ---
      case 'audit-cookies':
        this.scrollToSection('simulator-section', 'Scrolled to Deceptive Dark Pattern Simulator');
        this.highlightElement(document.getElementById('simulator-container'), 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-950');
        break;

      case 'sim-accept-trap':
        this.scrollToSection('simulator-section');
        document.getElementById('dark-accept-btn')?.click();
        this.highlightElement(document.getElementById('simulator-container'), 'ring-4 ring-rose-500 ring-offset-4 ring-offset-slate-950');
        break;

      case 'sim-reject-ethical':
        this.scrollToSection('simulator-section');
        document.getElementById('ethical-reject-btn')?.click();
        this.highlightElement(document.getElementById('simulator-container'), 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-950');
        break;

      case 'sim-open-settings':
        this.scrollToSection('simulator-section');
        document.getElementById('dark-settings-btn')?.click();
        this.highlightElement(document.getElementById('simulator-container'), 'ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-950');
        break;

      case 'sim-confirmshame':
        this.scrollToSection('simulator-section');
        document.getElementById('dark-confirmshame-btn')?.click();
        this.highlightElement(document.getElementById('simulator-container'), 'ring-4 ring-rose-400 ring-offset-4 ring-offset-slate-950');
        break;

      case 'sim-reset':
        this.scrollToSection('simulator-section');
        document.getElementById('reset-simulator-btn')?.click();
        this.highlightElement(document.getElementById('simulator-container'), 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-950');
        break;

      // --- 3. DYNAMIC PRIVACY RISK CALCULATOR ---
      case 'show-calculator':
        this.scrollToSection('calculator-section', 'Scrolled to Privacy Risk Score Meter');
        this.highlightElement(document.getElementById('calculator-container'), 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-950');
        break;

      case 'calc-preset-strict':
        this.scrollToSection('calculator-section');
        document.getElementById('preset-strict-btn')?.click();
        this.highlightElement(document.getElementById('calculator-container'), 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-950');
        break;

      case 'calc-preset-balanced':
        this.scrollToSection('calculator-section');
        document.getElementById('preset-moderate-btn')?.click();
        this.highlightElement(document.getElementById('calculator-container'), 'ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-950');
        break;

      case 'calc-preset-social':
        this.scrollToSection('calculator-section');
        document.getElementById('preset-social-btn')?.click();
        this.highlightElement(document.getElementById('calculator-container'), 'ring-4 ring-rose-500 ring-offset-4 ring-offset-slate-950');
        break;

      case 'calc-toggle-biometric':
        this.scrollToSection('calculator-section');
        this.toggleCheckbox('calc-biometric');
        this.highlightElement(document.getElementById('calculator-container'));
        break;

      case 'calc-toggle-location':
        this.scrollToSection('calculator-section');
        this.toggleCheckbox('calc-location');
        this.highlightElement(document.getElementById('calculator-container'));
        break;

      case 'calc-toggle-audio':
        this.scrollToSection('calculator-section');
        this.toggleCheckbox('calc-audio');
        this.highlightElement(document.getElementById('calculator-container'));
        break;

      case 'calc-toggle-broker':
        this.scrollToSection('calculator-section');
        this.toggleCheckbox('calc-brokerage');
        this.highlightElement(document.getElementById('calculator-container'));
        break;

      case 'calc-toggle-fingerprint':
        this.scrollToSection('calculator-section');
        this.toggleCheckbox('calc-fingerprint');
        this.highlightElement(document.getElementById('calculator-container'));
        break;

      // --- 4. ETHICAL AI CONSENT MATRIX ---
      case 'show-consent':
        this.scrollToSection('ai-matrix-section', 'Scrolled to Ethical AI Consent Matrix');
        this.highlightElement(document.getElementById('ai-matrix-container'), 'ring-4 ring-violet-400 ring-offset-4 ring-offset-slate-950');
        this.demonstrateAISanitization();
        break;

      case 'ai-toggle-training':
        this.scrollToSection('ai-matrix-section');
        this.toggleCheckbox('ai-opt-training');
        this.highlightElement(document.getElementById('ai-matrix-container'));
        break;

      case 'ai-toggle-human':
        this.scrollToSection('ai-matrix-section');
        this.toggleCheckbox('ai-opt-human');
        this.highlightElement(document.getElementById('ai-matrix-container'));
        break;

      case 'ai-toggle-diffprivacy':
        this.scrollToSection('ai-matrix-section');
        this.toggleCheckbox('ai-opt-diffprivacy');
        this.highlightElement(document.getElementById('ai-matrix-container'));
        break;

      case 'ai-toggle-ephemeral':
        this.scrollToSection('ai-matrix-section');
        this.toggleCheckbox('ai-opt-ephemeral');
        this.highlightElement(document.getElementById('ai-matrix-container'));
        break;

      case 'ai-sample-medical':
        this.scrollToSection('ai-matrix-section');
        this.demonstrateAISanitization("Patient Sarah Connor, SSN 123-45-6789, diagnosed with Type 1 Diabetes, taking insulin. Contact: 555-0199.");
        this.highlightElement(document.getElementById('ai-matrix-container'));
        break;

      case 'ai-sample-key':
        this.scrollToSection('ai-matrix-section');
        this.demonstrateAISanitization("Fix my backend connection: const API_KEY = 'sk_live_94921938b81203a'; const USER = 'admin';");
        this.highlightElement(document.getElementById('ai-matrix-container'));
        break;

      // --- 5. ACADEMIC INSPECTOR DRAWER ---
      case 'open-inspector':
        this.privacyInspectorDrawer?.open();
        break;

      case 'fast-audit':
        if (!this.privacyInspectorDrawer?.isOpen) {
          this.privacyInspectorDrawer?.open();
        }
        setTimeout(() => this.privacyInspectorDrawer?.runFastAudit(), 250);
        break;

      case 'inject-tracker':
        if (!this.privacyInspectorDrawer?.isOpen) {
          this.privacyInspectorDrawer?.open();
        }
        setTimeout(() => this.privacyInspectorDrawer?.injectSimulatedTracker(), 250);
        break;

      case 'simulate-breach':
        if (!this.privacyInspectorDrawer?.isOpen) {
          this.privacyInspectorDrawer?.open();
        }
        setTimeout(() => this.privacyInspectorDrawer?.simulateConsentBreach(), 250);
        break;

      case 'reset-telemetry':
        this.privacyInspectorDrawer?.resetTelemetry();
        break;

      // --- 6. EXAMINER DOSSIER & TABS ---
      case 'show-dossier':
        this.audio?.playChirp(true);
        this.examinerModal?.show('taxonomies');
        break;

      case 'dossier-tab-patterns':
        this.audio?.playChirp(true);
        this.examinerModal?.show('taxonomies');
        break;

      case 'dossier-tab-pbd':
        this.audio?.playChirp(true);
        this.examinerModal?.show('pbd');
        break;

      case 'dossier-tab-heuristics':
        this.audio?.playChirp(true);
        this.examinerModal?.show('heuristics');
        break;

      case 'dossier-tab-viva':
        this.audio?.playChirp(true);
        this.examinerModal?.show('viva-qa');
        break;

      case 'toggle-examiner-mode':
        this.examinerModeActive = !this.examinerModeActive;
        const toggle = document.getElementById('global-examiner-toggle');
        if (toggle) toggle.checked = this.examinerModeActive;
        this.updateExaminerHighlights();
        this.audio?.playChirp(this.examinerModeActive);
        break;

      // --- 7. SCROLLING & NAVIGATION ---
      case 'scroll-top':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.audio?.playChirp(true);
        break;

      case 'scroll-bottom':
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        this.audio?.playChirp(false);
        break;

      case 'scroll-down':
        window.scrollBy({ top: 550, behavior: 'smooth' });
        this.audio?.playClick();
        break;

      case 'scroll-up':
        window.scrollBy({ top: -550, behavior: 'smooth' });
        this.audio?.playClick();
        break;

      // --- 8. ACCESSIBILITY & AUDIO ---
      case 'high-contrast':
        this.accessibility?.toggleHighContrast();
        this.audio?.playClick();
        break;

      case 'increase-font':
        this.accessibility?.cycleFontScale();
        this.audio?.playClick();
        break;

      case 'decrease-font':
      case 'reset-font':
        this.accessibility?.setFontScale(100);
        this.audio?.playClick();
        break;

      case 'mute-sound':
        if (!this.audio?.isMuted) {
          this.toggleAudioMute();
        }
        break;

      case 'unmute-sound':
        if (this.audio?.isMuted) {
          this.toggleAudioMute();
        }
        break;

      case 'stop-voice':
        if (this.voiceSystem?.isListening) {
          this.voiceSystem.toggleListening();
        }
        break;

      case 'close-overlays':
      case 'close-dialog':
        this.closeAllOverlays();
        break;

      case 'help':
      case 'show-help':
        this.accessibility?.openHelpModal();
        break;

      default:
        console.warn(`[Voice Router] Unmapped voice command: "${commandId}"`);
    }
  }

  toggleCheckbox(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.checked = !el.checked;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    if (el.checked) {
      this.audio?.playThreatAlert();
    } else {
      this.audio?.playShieldEngage();
    }
  }

  demonstrateAISanitization(customText = null) {
    const input = document.getElementById('ai-sandbox-input');
    if (input && this.aiMatrix) {
      if (customText) {
        input.value = customText;
      }
      this.aiMatrix.updateSandboxPreview();
    }
  }

  highlightElement(el, ringClass = 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-950') {
    if (!el) return;
    const classes = ringClass.split(' ');
    el.classList.add(...classes, 'transition-all', 'duration-500');
    setTimeout(() => {
      el.classList.remove(...classes);
    }, 2200);
  }

  scrollToSection(id, announceText) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.audio?.playChirp(true);
      if (announceText) this.accessibility?.announcePolite(announceText);
    }
  }

  toggleAudioMute() {
    if (!this.audio) return;
    const isMuted = this.audio.toggleMute();
    // Keep TTS in sync with audio mute
    if (this.voiceSystem) this.voiceSystem.ttsMuted = isMuted;
    this.updateAudioButtonUI(isMuted);
    const msg = isMuted
      ? 'Procedural sound effects muted.'
      : 'Procedural sound effects active.';
    this.accessibility?.announcePolite(msg);
  }

  updateAudioButtonUI(isMuted) {
    const audioBtn = document.getElementById('header-audio-btn');
    const audioIcon = document.getElementById('header-audio-icon');
    if (!audioBtn || !audioIcon) return;

    if (isMuted) {
      audioIcon.setAttribute('class', 'w-4 h-4 text-rose-400');
      audioIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
        <line x1="17" y1="9" x2="21" y2="13" stroke-linecap="round" stroke-width="2"/>
        <line x1="21" y1="9" x2="17" y2="13" stroke-linecap="round" stroke-width="2"/>`;
      audioBtn.setAttribute('title', 'Procedural Audio Muted — click to unmute (Hotkey: M)');
      audioBtn.setAttribute('aria-pressed', 'true');
    } else {
      audioIcon.setAttribute('class', 'w-4 h-4 text-emerald-400');
      audioIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>`;
      audioBtn.setAttribute('title', 'Toggle Procedural Audio Sensory Chimes (Hotkey: M)');
      audioBtn.setAttribute('aria-pressed', 'false');
    }
  }

  closeAllOverlays() {
    let handled = false;

    if (this.privacyInspectorDrawer?.isOpen) {
      this.privacyInspectorDrawer.close();
      handled = true;
    }

    // ExaminerModal uses classList.contains('hidden') as its open/close state
    const examinerModalEl = document.getElementById('examiner-modal-container');
    if (examinerModalEl && !examinerModalEl.classList.contains('hidden')) {
      this.examinerModal?.hide();
      handled = true;
    }

    if (this.accessibility?.helpModal &&
        !this.accessibility.helpModal.classList.contains('hidden')) {
      this.accessibility.closeHelpModal();
      handled = true;
    }

    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav && !mobileNav.classList.contains('hidden')) {
      mobileNav.classList.add('hidden');
      handled = true;
    }

    return handled;
  }

  setupGlobalControls() {
    const examinerToggle = document.getElementById('global-examiner-toggle');
    const mobileExaminerToggle = document.getElementById('mobile-examiner-toggle');

    const handleExaminerToggle = (checked) => {
      this.examinerModeActive = checked;
      if (examinerToggle) examinerToggle.checked = checked;
      if (mobileExaminerToggle) mobileExaminerToggle.checked = checked;
      this.updateExaminerHighlights();
      this.audio?.playChirp(checked);
    };

    examinerToggle?.addEventListener('change', (e) => handleExaminerToggle(e.target.checked));
    mobileExaminerToggle?.addEventListener('change', (e) => handleExaminerToggle(e.target.checked));

    document.getElementById('open-dossier-btn')?.addEventListener('click', () => {
      this.audio?.playChirp(true);
      this.examinerModal.show();
    });

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    mobileMenuBtn?.addEventListener('click', () => {
      const isHidden = mobileNav?.classList.contains('hidden');
      mobileNav?.classList.toggle('hidden');
      // Lock body scroll while mobile menu is open on mobile devices
      document.body.style.overflow = isHidden ? '' : '';
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#' || !href) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          mobileNav?.classList.add('hidden');
        }
      });
    });
  }

  setupToolbarBindings() {
    // Header Voice Button (V)
    document.getElementById('header-mic-btn')?.addEventListener('click', () => {
      this.voiceSystem?.toggleListening();
    });

    // Header High-Contrast Button (C)
    document.getElementById('header-contrast-btn')?.addEventListener('click', () => {
      this.accessibility?.toggleHighContrast();
      this.audio?.playClick();
    });

    // Header Font Scaling Button (F)
    document.getElementById('header-font-scale-btn')?.addEventListener('click', () => {
      this.accessibility?.cycleFontScale();
      this.audio?.playClick();
    });

    // Header Audio Mute Button (M)
    document.getElementById('header-audio-btn')?.addEventListener('click', () => {
      this.toggleAudioMute();
    });

    // Header Inspector Drawer Button (I)
    document.getElementById('header-inspector-btn')?.addEventListener('click', () => {
      this.privacyInspectorDrawer?.toggle();
    });

    // Header Accessibility Help Button (?)
    document.getElementById('header-help-btn')?.addEventListener('click', () => {
      this.accessibility?.openHelpModal();
    });

    // Mobile Quick Action Buttons
    document.getElementById('mobile-voice-btn')?.addEventListener('click', () => {
      this.voiceSystem?.toggleListening();
      document.getElementById('mobile-nav')?.classList.add('hidden');
    });
    document.getElementById('mobile-contrast-btn')?.addEventListener('click', () => {
      this.accessibility?.toggleHighContrast();
      this.audio?.playClick();
      document.getElementById('mobile-nav')?.classList.add('hidden');
    });
    document.getElementById('mobile-inspector-btn')?.addEventListener('click', () => {
      this.privacyInspectorDrawer?.toggle();
      document.getElementById('mobile-nav')?.classList.add('hidden');
    });

    // Initialise audio button state from localStorage
    if (this.audio) {
      this.updateAudioButtonUI(this.audio.isMuted);
    }
  }

  wireInteractiveAcoustics() {
    // Delegate click events at body level — works even after simulator re-render
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest('button, [data-inspect], label');
      if (!target) return;

      const id = target.id || '';

      if (id === 'dark-accept-btn') {
        this.audio?.playThreatAlert();
        this.accessibility?.announceAssertive(
          'Warning: Deceptive dark pattern trap accepted. 427 ad trackers enabled.'
        );
      } else if (id === 'dark-settings-btn') {
        this.audio?.playClick();
        this.accessibility?.announcePolite(
          'Roach motel preference sliders opened. Manual cancellation required.'
        );
      } else if (id === 'dark-confirmshame-btn') {
        this.audio?.playThreatAlert();
        this.accessibility?.announcePolite(
          'Confirmshaming pattern identified: emotional manipulation applied to privacy opt-out.'
        );
      } else if (id === 'ethical-reject-btn') {
        this.audio?.playShieldEngage();
        this.accessibility?.announcePolite(
          'Ethical privacy preserved: all non-essential tracking rejected in one click.'
        );
      } else if (id === 'ethical-save-btn') {
        this.audio?.playShieldEngage();
        this.accessibility?.announcePolite(
          'Granular consent preferences updated successfully.'
        );
      } else if (id === 'preset-strict-btn') {
        this.audio?.playShieldEngage();
        this.accessibility?.announcePolite(
          'Privacy-by-Default preset active. Sensor telemetry minimized.'
        );
      } else if (id === 'preset-social-btn') {
        this.audio?.playThreatAlert();
        this.accessibility?.announceAssertive(
          'Invasive ad-tech preset active. Aggregated surveillance risk at maximum.'
        );
      } else if (id === 'reset-simulator-btn') {
        this.audio?.playChirp(true);
      }
    });
  }

  updateExaminerHighlights() {
    const badges = document.querySelectorAll('.inspect-badge');
    const statusText = document.getElementById('examiner-mode-label');

    badges.forEach(badge => {
      badge.classList.toggle('active-inspector', this.examinerModeActive);
    });

    if (statusText) {
      statusText.textContent = this.examinerModeActive
        ? 'Examiner Mode: ON'
        : 'Examiner Mode: OFF';
      statusText.className = this.examinerModeActive
        ? 'text-[11px] font-mono font-bold text-cyan-400'
        : 'text-[11px] font-mono text-slate-500';
    }
  }

  registerServiceWorker() {
    if (
      'serviceWorker' in navigator &&
      (window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
          .then((reg) => {
            console.log('[PrivacyGuard PWA] SW registered, scope:', reg.scope);
          })
          .catch((err) => {
            console.log('[PrivacyGuard PWA] SW registration skipped:', err.message);
          });
      });
    }
  }
}

// Reliable ES module bootstrap
function bootstrap() {
  const app = new PrivacyGuardApp();
  app.init();
  window.privacyGuardApp = app;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
