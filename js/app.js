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
import { UserTourGuide } from './modules/user-tour-guide.js';
import { RomanUrduAICopilot } from './modules/urdu-ai-copilot.js';

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
    this.tourGuide = null;
    this.aiCopilot = null;
    window.PrivacyGuardAppInstance = this;
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

    // 9. Beginner-Friendly Onboarding & Bilingual Tour Guide
    this.tourGuide = new UserTourGuide({
      app: this,
      audio: this.audio,
      accessibility: this.accessibility
    });

    // 10. Roman Urdu Conversational AI Copilot (Dual-Key & Zero-Token Safe)
    this.aiCopilot = new RomanUrduAICopilot({
      app: this,
      audio: this.audio,
      accessibility: this.accessibility,
      voiceSystem: this.voiceSystem
    });

    // 11. Wire Controls
    this.setupGlobalControls();
    this.setupToolbarBindings();
    this.wireInteractiveAcoustics();
    this.updateExaminerHighlights();

    // 12. Register Service Worker for offline PWA operation
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
      // --- 0. GUIDED ONBOARDING & TOUR ---
      case 'start-tour':
      case 'guided-tour':
        this.tourGuide?.startTour(0);
        break;

      case 'tour-next':
      case 'next-tour':
        this.tourGuide?.nextStep();
        break;

      case 'tour-prev':
      case 'prev-tour':
        this.tourGuide?.prevStep();
        break;

      case 'tour-stop':
      case 'stop-tour':
      case 'finish-tour':
        this.tourGuide?.stopTour();
        break;

      // --- ROMAN URDU AI COPILOT ---
      case 'urdu-ai':
      case 'ai-copilot':
      case 'open-ai':
        this.aiCopilot?.openHUD();
        break;

      case 'stop-voice-handsfree':
        this.aiCopilot?.stopHandsFreeVoice();
        break;

      // --- 1. CORE PRIVACY & THREAT SCAN ---
      case 'start-audit':
      case 'privacy-scan':
        this.runPrivacyScan();
        break;

      case 'block-trackers':
      case 'block-all':
        this.blockTrackers();
        break;

      // --- 2. DECEPTIVE PATTERN SIMULATOR ---
      case 'audit-cookies':
      case 'simulator':
        this.scrollToSection('simulator-section', 'Scrolled to Deceptive Dark Pattern Simulator');
        this.highlightElement(document.getElementById('simulator-container'), 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-950');
        break;

      case 'sim-accept-trap':
      case 'trap-cookies':
      case 'accept-trap':
        this.triggerVisualAction({
          element: document.getElementById('dark-accept-btn') || document.getElementById('simulator-container'),
          actionName: 'Accepting Deceptive Cookie Trap (427 Trackers)',
          highlightClass: 'ring-4 ring-rose-500 ring-offset-4 ring-offset-slate-950 scale-105 shadow-2xl shadow-rose-600/40',
          onExecute: () => {
            document.getElementById('dark-accept-btn')?.click();
            this.audio?.playThreatAlert();
          }
        });
        break;

      case 'sim-reject-ethical':
      case 'reject-cookies':
      case 'reject-all':
        this.triggerVisualAction({
          element: document.getElementById('ethical-reject-btn') || document.getElementById('simulator-container'),
          actionName: '1-Click Ethical Reject (Zero Trackers)',
          highlightClass: 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-950 scale-105 shadow-2xl shadow-emerald-500/40',
          onExecute: () => {
            document.getElementById('ethical-reject-btn')?.click();
            this.audio?.playShieldEngage();
          }
        });
        break;

      case 'sim-open-settings':
      case 'settings-cookies':
      case 'open-settings':
        this.triggerVisualAction({
          element: document.getElementById('dark-settings-btn') || document.getElementById('simulator-container'),
          actionName: 'Exposing Roach Motel (427 Nested Sliders)',
          highlightClass: 'ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-950 scale-105 shadow-xl shadow-amber-500/40',
          onExecute: () => {
            document.getElementById('dark-settings-btn')?.click();
            document.getElementById('dark-nested-settings')?.classList.remove('hidden');
            this.audio?.playChirp(true);
          }
        });
        break;

      case 'sim-confirmshame':
      case 'confirmshame':
        this.triggerVisualAction({
          element: document.getElementById('dark-confirmshame-btn'),
          actionName: 'Exposing Confirmshaming Guilt Line',
          highlightClass: 'ring-4 ring-rose-400 ring-offset-4 ring-offset-slate-950 scale-105 shadow-xl shadow-rose-500/40',
          onExecute: () => {
            document.getElementById('dark-confirmshame-btn')?.click();
            this.audio?.playThreatAlert();
          }
        });
        break;

      case 'sim-reset':
      case 'reset-simulator':
        this.triggerVisualAction({
          element: document.getElementById('reset-simulator-btn') || document.getElementById('simulator-container'),
          actionName: 'Resetting Cookie Simulator',
          highlightClass: 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-950 scale-105',
          onExecute: () => {
            document.getElementById('reset-simulator-btn')?.click();
            this.audio?.playShieldEngage();
          }
        });
        break;

      case 'sim-toggle-analytics':
        this.toggleCheckbox('ethical-opt-analytics', 'Anonymous Error Reports');
        break;

      case 'sim-toggle-marketing':
        this.toggleCheckbox('ethical-opt-marketing', 'Personalized Advertisements');
        break;

      case 'sim-save-choices':
        this.triggerVisualAction({
          element: document.getElementById('ethical-save-btn'),
          actionName: 'Saving Selected Privacy Choices',
          highlightClass: 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-950 scale-105',
          onExecute: () => {
            document.getElementById('ethical-save-btn')?.click();
            this.audio?.playShieldEngage();
          }
        });
        break;

      case 'sim-close-settings':
        document.getElementById('dark-nested-settings')?.classList.add('hidden');
        break;

      // --- 3. DYNAMIC PRIVACY RISK CALCULATOR ---
      case 'show-calculator':
      case 'show-risk':
      case 'risk-meter':
        this.scrollToSection('calculator-section', 'Scrolled to Privacy Risk Score Meter');
        this.highlightElement(document.getElementById('calculator-container'), 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-950');
        break;

      case 'calc-preset-strict':
      case 'preset-strict':
        this.triggerVisualAction({
          element: document.getElementById('preset-strict-btn'),
          actionName: 'Preset ➔ Strict Privacy (0 Risk Score)',
          highlightClass: 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-950 scale-105 shadow-xl shadow-emerald-500/30',
          onExecute: () => {
            document.getElementById('preset-strict-btn')?.click();
            this.audio?.playShieldEngage();
          }
        });
        break;

      case 'calc-preset-balanced':
      case 'preset-balanced':
        this.triggerVisualAction({
          element: document.getElementById('preset-moderate-btn'),
          actionName: 'Preset ➔ Balanced Moderate Risk',
          highlightClass: 'ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-950 scale-105 shadow-xl shadow-amber-500/30',
          onExecute: () => {
            document.getElementById('preset-moderate-btn')?.click();
            this.audio?.playChirp(true);
          }
        });
        break;

      case 'calc-preset-social':
      case 'preset-social':
        this.triggerVisualAction({
          element: document.getElementById('preset-social-btn'),
          actionName: 'Preset ➔ Predatory Social Media (100 Max Risk)',
          highlightClass: 'ring-4 ring-rose-500 ring-offset-4 ring-offset-slate-950 scale-105 shadow-xl shadow-rose-500/40',
          onExecute: () => {
            document.getElementById('preset-social-btn')?.click();
            this.audio?.playThreatAlert();
          }
        });
        break;

      case 'calc-toggle-biometric':
      case 'toggle-biometric':
        this.toggleCheckbox('calc-biometric', 'Camera & Face Biometrics');
        break;

      case 'calc-toggle-location':
      case 'toggle-location':
        this.toggleCheckbox('calc-location', 'Exact GPS Location');
        break;

      case 'calc-toggle-audio':
      case 'toggle-audio-vector':
        this.toggleCheckbox('calc-audio', 'Microphone Background Audio');
        break;

      case 'calc-toggle-broker':
      case 'toggle-broker':
        this.toggleCheckbox('calc-brokerage', 'Data Broker Exfiltration');
        break;

      case 'calc-toggle-fingerprint':
      case 'toggle-fingerprint':
        this.toggleCheckbox('calc-fingerprint', 'Device Canvas Fingerprinting');
        break;

      case 'calc-retention-0':
      case 'retention-ephemeral':
        this.automateRetention(0, 'Immediate (Ephemeral - 0 Days)');
        break;

      case 'calc-retention-1':
      case 'retention-30days':
        this.automateRetention(1, '30 Days (+4 Points)');
        break;

      case 'calc-retention-2':
      case 'retention-1year':
        this.automateRetention(2, '1 Year (+10 Points)');
        break;

      case 'calc-retention-3':
      case 'retention-5years':
        this.automateRetention(3, '5 Years (+15 Points)');
        break;

      case 'calc-retention-4':
      case 'retention-permanent':
        this.automateRetention(4, 'Indefinite Permanent (+20 Points)');
        break;

      // --- 4. ETHICAL AI CONSENT MATRIX ---
      case 'show-consent':
      case 'ai-matrix':
        this.scrollToSection('ai-matrix-section', 'Scrolled to Ethical AI Consent Matrix');
        this.highlightElement(document.getElementById('ai-matrix-container'), 'ring-4 ring-violet-400 ring-offset-4 ring-offset-slate-950');
        this.demonstrateAISanitization();
        break;

      case 'ai-toggle-training':
      case 'toggle-ai-training':
        this.toggleCheckbox('ai-opt-training', 'AI Training Model Ingestion');
        break;

      case 'ai-toggle-human':
      case 'toggle-ai-review':
        this.toggleCheckbox('ai-opt-human', 'Human Operator Chat Review');
        break;

      case 'ai-toggle-diffprivacy':
      case 'toggle-ai-diffprivacy':
        this.toggleCheckbox('ai-opt-diffprivacy', 'Differential Privacy & PII Redaction');
        break;

      case 'ai-toggle-ephemeral':
      case 'toggle-ai-ephemeral':
        this.toggleCheckbox('ai-opt-ephemeral', 'Auto-Delete Session History');
        break;

      case 'ai-sample-medical':
      case 'sample-medical':
        this.demonstrateAISanitization("Patient Sarah Connor, SSN 123-45-6789, diagnosed with Type 1 Diabetes, taking insulin. Contact: 555-0199.");
        break;

      case 'ai-sample-key':
      case 'sample-key':
        this.demonstrateAISanitization("Fix my backend connection: const API_KEY = 'sk_live_94921938b81203a'; const USER = 'admin';");
        break;

      // --- 5. ACADEMIC INSPECTOR DRAWER ---
      case 'open-inspector':
        this.showAutomationBanner('Opening Academic Telemetry Inspector Drawer');
        this.privacyInspectorDrawer?.open();
        break;

      case 'fast-audit':
      case 'fast-scan':
        this.runPrivacyScan();
        break;

      case 'inject-tracker':
      case 'simulate-tracker':
        this.showAutomationBanner('Injecting Rogue Ad Tracker (Helen Nissenbaum Norm Rupture)');
        if (!this.privacyInspectorDrawer?.isOpen) {
          this.privacyInspectorDrawer?.open();
        }
        setTimeout(() => {
          this.privacyInspectorDrawer?.injectSimulatedTracker();
          const ciCard = this.privacyInspectorDrawer?.drawerEl?.querySelector('#ci-status-badge')?.closest('.cyber-card');
          if (ciCard) {
            ciCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            this.highlightElement(ciCard, 'ring-4 ring-rose-500 ring-offset-4 ring-offset-slate-950 scale-[1.02] shadow-2xl shadow-rose-600/30');
          }
        }, 350);
        break;

      case 'simulate-breach':
        this.showAutomationBanner('Simulating Contextual Integrity Data Breach');
        if (!this.privacyInspectorDrawer?.isOpen) {
          this.privacyInspectorDrawer?.open();
        }
        setTimeout(() => {
          this.privacyInspectorDrawer?.simulateConsentBreach();
          const ciCard = this.privacyInspectorDrawer?.drawerEl?.querySelector('#ci-status-badge')?.closest('.cyber-card');
          if (ciCard) {
            ciCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            this.highlightElement(ciCard, 'ring-4 ring-amber-500 ring-offset-4 ring-offset-slate-950 scale-[1.02] shadow-2xl shadow-amber-500/30');
          }
        }, 350);
        break;

      case 'reset-telemetry':
        this.showAutomationBanner('Resetting Academic Telemetry Logs');
        this.privacyInspectorDrawer?.resetTelemetry();
        break;

      case 'close-inspector':
      case 'close-drawer':
        this.privacyInspectorDrawer?.close();
        break;

      // --- 6. EXAMINER DOSSIER & TABS ---
      case 'show-dossier':
      case 'open-dossier':
      case 'viva':
        this.audio?.playChirp(true);
        this.examinerModal?.show('taxonomies');
        break;

      case 'dossier-tab-patterns':
      case 'tab-patterns':
        this.audio?.playChirp(true);
        this.examinerModal?.show('taxonomies');
        break;

      case 'dossier-tab-pbd':
      case 'tab-pbd':
        this.audio?.playChirp(true);
        this.examinerModal?.show('pbd');
        break;

      case 'dossier-tab-heuristics':
      case 'tab-heuristics':
        this.audio?.playChirp(true);
        this.examinerModal?.show('heuristics');
        break;

      case 'dossier-tab-viva':
      case 'tab-viva':
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

      case 'scroll-simulator':
        this.scrollToSection('simulator-section', 'Scrolled to Deceptive Dark Pattern Simulator');
        break;

      case 'scroll-calculator':
        this.scrollToSection('calculator-section', 'Scrolled to Privacy Risk Calculator');
        break;

      case 'scroll-aimatrix':
        this.scrollToSection('ai-matrix-section', 'Scrolled to Ethical AI Consent Matrix');
        break;

      case 'scroll-theory':
        this.scrollToSection('academic-theory-section', 'Scrolled to Academic Frameworks');
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

      case 'toggle-audio':
        this.toggleAudioMute();
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

  showAutomationBanner(title) {
    let banner = document.getElementById('ai-automation-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'ai-automation-banner';
      banner.className = 'fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-950/95 border-2 border-cyan-400/80 rounded-full shadow-2xl backdrop-blur-2xl flex items-center gap-2.5 text-xs font-mono text-cyan-200 transition-all duration-300 pointer-events-none opacity-0 scale-95';
      document.body.appendChild(banner);
    }

    banner.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0"></span>
      <span class="font-bold text-white tracking-wide flex items-center gap-1">
        <span>🤖 AI Auto-Pilot:</span>
      </span>
      <span class="text-cyan-300 font-semibold">${title}</span>
    `;

    banner.classList.remove('opacity-0', 'scale-95');
    banner.classList.add('opacity-100', 'scale-100');

    clearTimeout(this.automationBannerTimer);
    this.automationBannerTimer = setTimeout(() => {
      banner.classList.remove('opacity-100', 'scale-100');
      banner.classList.add('opacity-0', 'scale-95');
    }, 2800);
  }

  triggerVisualAction({
    element,
    actionName,
    highlightClass = 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-950 scale-[1.02] bg-cyan-950/40 shadow-xl shadow-cyan-500/20',
    onExecute = null,
    scrollBlock = 'center'
  }) {
    if (!element) {
      if (onExecute) onExecute();
      return;
    }

    // 1. Smooth scroll directly to the element
    element.scrollIntoView({ behavior: 'smooth', block: scrollBlock });

    // 2. Attach a temporary glowing "🤖 AI Action" beacon badge
    const beacon = document.createElement('div');
    beacon.className = 'ai-action-beacon absolute -top-3.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 font-mono font-black text-[9px] shadow-lg flex items-center gap-1 z-30 animate-pulse pointer-events-none transition-all';
    beacon.innerHTML = `<span>🤖 AI Action</span><span>${actionName ? '• ' + actionName : ''}</span>`;
    
    const originalPosition = window.getComputedStyle(element).position;
    if (originalPosition === 'static') {
      element.style.position = 'relative';
    }
    element.appendChild(beacon);

    // 3. Highlight element
    const classes = highlightClass.split(' ');
    element.classList.add(...classes, 'transition-all', 'duration-300');

    // 4. Show top screen Automation Banner
    if (actionName) {
      this.showAutomationBanner(actionName);
    }

    // 5. Execute actual interaction with realistic micro-delay so eye can see it happen
    setTimeout(() => {
      if (onExecute) onExecute();
    }, 180);

    // 6. Cleanup beacon and ring after animation
    setTimeout(() => {
      element.classList.remove(...classes);
      beacon.remove();
      if (originalPosition === 'static') {
        element.style.position = '';
      }
    }, 2400);
  }

  toggleCheckbox(id, customLabel = null) {
    const el = document.getElementById(id);
    if (!el) return;
    const rowEl = el.closest('div.p-3') || el.closest('label') || el.parentElement;

    const label = customLabel || el.getAttribute('aria-label') || (rowEl ? rowEl.querySelector('span')?.textContent : '') || id;
    const cleanLabel = label.trim().replace(/^[\W_]+/, '').slice(0, 30);

    this.triggerVisualAction({
      element: rowEl,
      actionName: `Toggle ${cleanLabel}`,
      highlightClass: el.checked
        ? 'ring-4 ring-slate-500 ring-offset-4 ring-offset-slate-950 scale-[1.01] bg-slate-900/60'
        : 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-950 scale-[1.02] bg-cyan-950/40 shadow-xl shadow-cyan-500/20',
      onExecute: () => {
        el.checked = !el.checked;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        if (el.checked) {
          this.audio?.playThreatAlert();
        } else {
          this.audio?.playShieldEngage();
        }
      }
    });
  }

  automateRetention(val, label) {
    const slider = document.getElementById('calc-retention');
    const rowEl = slider?.closest('div.p-3') || slider?.parentElement;

    this.triggerVisualAction({
      element: rowEl,
      actionName: `Data Retention ➔ ${label}`,
      highlightClass: 'ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-950 scale-[1.02] bg-amber-950/40 shadow-xl shadow-amber-500/20',
      onExecute: () => {
        if (this.calculator) {
          this.calculator.setRetention(val);
        }
        if (val === 0) {
          this.audio?.playShieldEngage();
        } else {
          this.audio?.playChirp(true);
        }
      }
    });
  }

  runPrivacyScan() {
    this.showAutomationBanner('Running 60x Speed Privacy Audit Across 14 Vectors');
    this.privacyInspectorDrawer?.open();
    setTimeout(() => {
      this.privacyInspectorDrawer?.runFastAudit();
      const progressBox = this.privacyInspectorDrawer?.drawerEl?.querySelector('#inspector-scan-badge')?.parentElement;
      if (progressBox) {
        this.highlightElement(progressBox, 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-950');
      }
    }, 350);
    this.audio?.playChirp(true);
    this.accessibility?.announcePolite('Privacy audit initiated. Scanning 14 tracking vectors.');
  }

  blockTrackers() {
    this.showAutomationBanner('Defending Privacy: Blocking All 427 Trackers & Enforcing Privacy-by-Default');
    this.scrollToSection('simulator-section');
    setTimeout(() => {
      document.getElementById('ethical-reject-btn')?.click();
      document.getElementById('preset-strict-btn')?.click();
      this.highlightElement(document.getElementById('simulator-container'), 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-950');
      this.audio?.playShieldEngage();
    }, 250);
  }

  demonstrateAISanitization(customText = null) {
    const input = document.getElementById('ai-sandbox-input');
    const container = document.getElementById('ai-matrix-container');
    if (!input || !this.aiMatrix) return;

    const textToType = customText || input.value || "Patient Sarah Connor, SSN 123-45-6789, diagnosed with Type 1 Diabetes, taking insulin. Contact: 555-0199.";

    this.triggerVisualAction({
      element: input.parentElement || container,
      actionName: 'Streaming AI Prompt & Client-Side PII Masking',
      highlightClass: 'ring-4 ring-violet-400 ring-offset-4 ring-offset-slate-950 scale-[1.01] bg-violet-950/30',
      onExecute: () => {
        // Fast streaming typing animation
        input.value = '';
        input.focus();
        let i = 0;
        const step = Math.max(2, Math.floor(textToType.length / 25));
        const typeInterval = setInterval(() => {
          i += step;
          input.value = textToType.slice(0, i);
          this.aiMatrix?.updateSandboxPreview();
          if (i >= textToType.length) {
            input.value = textToType;
            clearInterval(typeInterval);
            this.aiMatrix?.updateSandboxPreview();
            this.audio?.playShieldEngage();
            const redactedBox = document.getElementById('ai-sandbox-redacted');
            if (redactedBox) {
              this.highlightElement(redactedBox, 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-950 scale-105');
            }
          }
        }, 25);
      }
    });
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

    if (this.tourGuide?.isActive) {
      this.tourGuide.stopTour();
      handled = true;
    }

    if (this.aiCopilot?.isOpen) {
      this.aiCopilot.closeHUD();
      handled = true;
    }

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
