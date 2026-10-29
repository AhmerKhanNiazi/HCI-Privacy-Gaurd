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
    this.examinerModeActive = true; // Enabled by default for easy presentation
    
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
      onCommand: (commandId, speech) => this.handleVoiceCommand(commandId, speech)
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

    // 6. Feature 1: Dark Pattern Simulator with inspector trigger and metrics
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

    // 9. Wire Header, Toolbar Controls & Interactive Acoustics
    this.setupGlobalControls();
    this.setupToolbarBindings();
    this.wireInteractiveAcoustics();
    this.updateExaminerHighlights();

    // 10. Register Service Worker for offline PWA operation
    this.registerServiceWorker();
  }

  /**
   * Action Router for Keyboard Switch Access (V, P, C, F, I, Esc, ?)
   */
  handleAccessibilityAction(action) {
    switch (action) {
      case 'toggle-voice':
        this.voiceSystem?.toggleListening();
        break;
      case 'privacy-scan':
        this.runPrivacyScan();
        break;
      case 'toggle-inspector':
        this.privacyInspectorDrawer?.toggle();
        break;
      case 'close-overlays':
        this.closeAllOverlays();
        break;
    }
  }

  /**
   * Command Router for Two-Way Voice System
   */
  handleVoiceCommand(commandId, spokenText) {
    console.log(`[Voice Router] Executing: ${commandId} (Spoken: "${spokenText}")`);

    switch (commandId) {
      case 'start-audit':
        this.runPrivacyScan();
        break;
      case 'block-trackers':
        this.blockTrackers();
        break;
      case 'show-consent':
        this.scrollToSection('ai-matrix-section', 'Scrolled to Ethical AI Consent Matrix');
        break;
      case 'audit-cookies':
        this.scrollToSection('simulator-section', 'Scrolled to Deceptive Dark Pattern Simulator');
        break;
      case 'high-contrast':
        this.accessibility?.toggleHighContrast();
        break;
      case 'increase-font':
        this.accessibility?.cycleFontScale();
        break;
      case 'mute-sound':
        this.toggleAudioMute();
        break;
      case 'open-inspector':
        this.privacyInspectorDrawer?.open();
        break;
      case 'close-overlays':
        this.closeAllOverlays();
        break;
      case 'help':
        this.accessibility?.openHelpModal();
        break;
      default:
        console.warn(`[Voice Router] Unmapped voice command: ${commandId}`);
    }
  }

  runPrivacyScan() {
    if (!this.privacyInspectorDrawer.isOpen) {
      this.privacyInspectorDrawer.open();
    }
    this.privacyInspectorDrawer.runFastAudit();
  }

  blockTrackers() {
    // 1. Activate strict Privacy-by-Default preset in Risk Calculator
    const strictBtn = document.getElementById('preset-strict-btn');
    if (strictBtn) strictBtn.click();

    // 2. Activate ethical 1-click reject in Dark Pattern Simulator
    const rejectBtn = document.getElementById('ethical-reject-btn');
    if (rejectBtn) rejectBtn.click();

    this.audio?.playShieldEngage();
    this.accessibility?.announcePolite('Third-party tracking blocked across all vectors. Privacy by default restored.');
  }

  scrollToSection(id, announceText) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.audio?.playChirp(true);
      if (announceText) {
        this.accessibility?.announcePolite(announceText);
      }
    }
  }

  toggleAudioMute() {
    if (!this.audio) return;
    const isMuted = this.audio.toggleMute();
    if (this.voiceSystem) {
      this.voiceSystem.ttsMuted = isMuted;
    }
    this.updateAudioButtonUI(isMuted);

    const msg = isMuted ? 'Procedural sound effects muted.' : 'Procedural sound effects active.';
    this.accessibility?.announcePolite(msg);
  }

  updateAudioButtonUI(isMuted) {
    const audioBtn = document.getElementById('header-audio-btn');
    const audioIcon = document.getElementById('header-audio-icon');
    if (!audioBtn || !audioIcon) return;

    if (isMuted) {
      audioBtn.classList.add('text-rose-400', 'border-rose-700/60');
      audioIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z m12.414-2.586l4.242 4.242m0-4.242l-4.242 4.242"/>`;
      audioBtn.setAttribute('title', 'Procedural Audio Muted (Hotkey: M)');
    } else {
      audioBtn.classList.remove('text-rose-400', 'border-rose-700/60');
      audioIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>`;
      audioBtn.setAttribute('title', 'Toggle Procedural Audio Sensory Chimes (Hotkey: M)');
    }
  }

  closeAllOverlays() {
    let handled = false;

    if (this.privacyInspectorDrawer?.isOpen) {
      this.privacyInspectorDrawer.close();
      handled = true;
    }

    if (this.examinerModal?.isOpen) {
      this.examinerModal.close();
      handled = true;
    }

    if (this.accessibility?.helpModal && !this.accessibility.helpModal.classList.contains('hidden')) {
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
    // Global Examiner Mode Toggle in Header & Mobile
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

    // Global "Examiner Dossier" button
    document.getElementById('open-dossier-btn')?.addEventListener('click', () => {
      this.audio?.playChirp(true);
      this.examinerModal.show();
    });

    // Mobile Hamburger Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    mobileMenuBtn?.addEventListener('click', () => {
      mobileNav?.classList.toggle('hidden');
    });

    // Navigation smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#' || !href) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (!mobileNav?.classList.contains('hidden')) {
            mobileNav?.classList.add('hidden');
          }
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
    });

    // Header Font Scaling Button (F)
    document.getElementById('header-font-scale-btn')?.addEventListener('click', () => {
      this.accessibility?.cycleFontScale();
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
    });
    document.getElementById('mobile-contrast-btn')?.addEventListener('click', () => {
      this.accessibility?.toggleHighContrast();
    });
    document.getElementById('mobile-inspector-btn')?.addEventListener('click', () => {
      this.privacyInspectorDrawer?.toggle();
    });

    // Initialize Audio button visual state from localStorage
    if (this.audio) {
      this.updateAudioButtonUI(this.audio.isMuted);
    }
  }

  wireInteractiveAcoustics() {
    // Dynamic acoustic and live ARIA announcements for simulator & calculator interactions
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest('button, [data-inspect], input[type="checkbox"]');
      if (!target) return;

      // Dark pattern traps
      if (target.id === 'dark-accept-btn') {
        this.audio?.playThreatAlert();
        this.accessibility?.announceAssertive('Warning: Deceptive dark pattern trap accepted. 427 ad trackers enabled.');
      } else if (target.id === 'dark-settings-btn') {
        this.audio?.playClick();
        this.accessibility?.announcePolite('Roach motel preference sliders opened. Manual cancellation required.');
      } else if (target.id === 'dark-confirmshame-btn') {
        this.audio?.playThreatAlert();
        this.accessibility?.announcePolite('Confirmshaming pattern identified: emotional manipulation applied to privacy opt-out.');
      } else if (target.id === 'ethical-reject-btn') {
        this.audio?.playShieldEngage();
        this.accessibility?.announcePolite('Ethical privacy preserved: all non-essential tracking rejected in one click.');
      } else if (target.id === 'ethical-save-btn') {
        this.audio?.playShieldEngage();
        this.accessibility?.announcePolite('Granular consent preferences updated successfully.');
      } else if (target.id === 'preset-strict-btn') {
        this.audio?.playShieldEngage();
        this.accessibility?.announcePolite('Privacy-by-Default preset active. Sensor telemetry minimized.');
      } else if (target.id === 'preset-social-btn') {
        this.audio?.playThreatAlert();
        this.accessibility?.announceAssertive('Invasive ad-tech preset active. Aggregated surveillance risk at maximum.');
      } else if (target.id === 'preset-moderate-btn') {
        this.audio?.playChirp(false);
      }
    });
  }

  updateExaminerHighlights() {
    const badges = document.querySelectorAll('.inspect-badge');
    const statusText = document.getElementById('examiner-mode-label');

    badges.forEach(badge => {
      if (this.examinerModeActive) {
        badge.classList.add('active-inspector');
      } else {
        badge.classList.remove('active-inspector');
      }
    });

    if (statusText) {
      statusText.textContent = this.examinerModeActive ? 'Examiner Mode: ON' : 'Examiner Mode: OFF';
      statusText.className = this.examinerModeActive 
        ? 'text-[11px] font-mono font-bold text-cyan-400' 
        : 'text-[11px] font-mono text-slate-500';
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
          .then((registration) => {
            console.log('[PrivacyGuard PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((err) => {
            console.log('[PrivacyGuard PWA] Service Worker registration skipped:', err.message);
          });
      });
    }
  }
}

// Reliable bootstrap for ES modules
function bootstrap() {
  const app = new PrivacyGuardApp();
  app.init();
  window.privacyGuardApp = app; // Expose globally for interactive demo/evaluation
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
