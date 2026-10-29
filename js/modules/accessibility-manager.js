/**
 * PrivacyGuard UX - Accessibility Manager (WCAG 2.1 AAA & Switch Access)
 * 
 * Implements:
 * - ARIA Live Region Announcements (Polite & Assertive)
 * - WCAG AAA High-Contrast Mode (7:1+ contrast ratio)
 * - Dynamic Typography Scaling (100% / 125% / 150%)
 * - Single-Key Switch Access Bindings (V, P, C, F, I, M, Esc, ?)
 * - Focus Trap Management for Modals & Drawers
 */

export class AccessibilityManager {
  constructor(options = {}) {
    this.audio = options.audio || null;
    this.onAction = options.onAction || null;

    this.highContrastActive = localStorage.getItem('privacyguard_high_contrast') === 'true';
    this.fontScale = parseInt(localStorage.getItem('privacyguard_font_scale') || '100', 10);
    if (![100, 125, 150].includes(this.fontScale)) this.fontScale = 100;

    this.politeAnnouncer = null;
    this.assertiveAnnouncer = null;
    this.helpModal = null;
    this.activeTrapElement = null;
    this.previousFocusedElement = null;

    this.init();
  }

  init() {
    this.injectAnnouncers();
    this.injectHelpModal();
    this.applySettings();
    this.attachKeyboardHotkeys();
  }

  injectAnnouncers() {
    // Assertive live region for critical alerts
    const assertive = document.createElement('div');
    assertive.id = 'aria-assertive-announcer';
    assertive.className = 'sr-only';
    assertive.setAttribute('role', 'alert');
    assertive.setAttribute('aria-live', 'assertive');
    assertive.setAttribute('aria-atomic', 'true');
    document.body.appendChild(assertive);
    this.assertiveAnnouncer = assertive;

    // Polite live region for general updates
    const polite = document.createElement('div');
    polite.id = 'aria-polite-announcer';
    polite.className = 'sr-only';
    polite.setAttribute('role', 'status');
    polite.setAttribute('aria-live', 'polite');
    polite.setAttribute('aria-atomic', 'true');
    document.body.appendChild(polite);
    this.politeAnnouncer = polite;
  }

  announcePolite(message) {
    if (!this.politeAnnouncer) return;
    this.politeAnnouncer.textContent = '';
    setTimeout(() => {
      this.politeAnnouncer.textContent = message;
    }, 50);
  }

  announceAssertive(message) {
    if (!this.assertiveAnnouncer) return;
    this.assertiveAnnouncer.textContent = '';
    setTimeout(() => {
      this.assertiveAnnouncer.textContent = message;
    }, 50);
  }

  applySettings() {
    const root = document.documentElement;
    root.setAttribute('data-high-contrast', this.highContrastActive ? 'true' : 'false');
    root.setAttribute('data-font-size', String(this.fontScale));

    const contrastBtn = document.getElementById('header-contrast-btn');
    if (contrastBtn) {
      contrastBtn.setAttribute('aria-pressed', this.highContrastActive ? 'true' : 'false');
      contrastBtn.classList.toggle('text-yellow-400', this.highContrastActive);
      contrastBtn.classList.toggle('border-yellow-400', this.highContrastActive);
    }

    const fontBtnText = document.getElementById('header-font-scale-text');
    if (fontBtnText) {
      fontBtnText.textContent = `${this.fontScale}%`;
    }
  }

  toggleHighContrast() {
    this.highContrastActive = !this.highContrastActive;
    localStorage.setItem('privacyguard_high_contrast', this.highContrastActive);
    this.applySettings();
    const msg = this.highContrastActive 
      ? 'High contrast mode enabled (WCAG 2.1 AAA 7:1+ contrast).' 
      : 'Standard cyber theme restored.';
    this.announcePolite(msg);
    return this.highContrastActive;
  }

  cycleFontScale() {
    if (this.fontScale === 100) this.fontScale = 125;
    else if (this.fontScale === 125) this.fontScale = 150;
    else this.fontScale = 100;

    localStorage.setItem('privacyguard_font_scale', this.fontScale);
    this.applySettings();
    this.announcePolite(`Font size scaled to ${this.fontScale} percent.`);
    return this.fontScale;
  }

  setFontScale(scale) {
    this.fontScale = [100, 125, 150].includes(scale) ? scale : 100;
    localStorage.setItem('privacyguard_font_scale', this.fontScale);
    this.applySettings();
    this.announcePolite(`Font size scaled to ${this.fontScale} percent.`);
  }

  attachKeyboardHotkeys() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when user is typing in form controls
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      // Ignore if Alt or Ctrl or Meta are pressed (prevents collisions with browser shortcuts)
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const key = e.key.toUpperCase();

      switch (key) {
        case 'V':
          e.preventDefault();
          if (this.onAction) this.onAction('toggle-voice');
          break;
        case 'P':
          e.preventDefault();
          if (this.onAction) this.onAction('privacy-scan');
          break;
        case 'C':
          e.preventDefault();
          this.toggleHighContrast();
          if (this.audio) this.audio.playClick();
          break;
        case 'F':
          e.preventDefault();
          this.cycleFontScale();
          if (this.audio) this.audio.playClick();
          break;
        case 'I':
          e.preventDefault();
          if (this.onAction) this.onAction('toggle-inspector');
          break;
        case 'M':
          e.preventDefault();
          if (this.onAction) this.onAction('toggle-audio');
          if (this.audio) this.audio.playClick();
          break;
        case 'ESCAPE':
          e.preventDefault();
          if (this.onAction) this.onAction('close-overlays');
          this.closeHelpModal();
          break;
        case '?':
        case 'H':
          e.preventDefault();
          this.toggleHelpModal();
          break;
      }
    });
  }

  /**
   * Trap Keyboard Focus inside a Modal Dialog or Slide-over Drawer (WCAG AAA)
   */
  trapFocus(element) {
    if (!element) return;
    this.previousFocusedElement = document.activeElement;
    this.activeTrapElement = element;

    const focusables = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusables.length === 0) return;

    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];

    element.focusTrapHandler = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    element.addEventListener('keydown', element.focusTrapHandler);
    setTimeout(() => firstFocusable.focus(), 60);
  }

  releaseFocus(element) {
    if (!element) return;
    if (element.focusTrapHandler) {
      element.removeEventListener('keydown', element.focusTrapHandler);
      element.focusTrapHandler = null;
    }
    if (this.previousFocusedElement && typeof this.previousFocusedElement.focus === 'function') {
      this.previousFocusedElement.focus();
    }
    this.activeTrapElement = null;
  }

  injectHelpModal() {
    const modal = document.createElement('div');
    modal.id = 'accessibility-help-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 modal-backdrop hidden transition-opacity duration-300';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'help-modal-title');

    modal.innerHTML = `
      <div class="cyber-card rounded-2xl w-full max-w-2xl border border-cyan-500/50 shadow-2xl overflow-hidden bg-slate-950 flex flex-col max-h-[90vh]">
        <div class="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            </div>
            <div>
              <h3 id="help-modal-title" class="text-base font-bold text-white">Accessibility & Voice Controls (WCAG 2.1 AAA)</h3>
              <p class="text-xs text-slate-400">Switch access keys & hands-free voice recognition guide.</p>
            </div>
          </div>
          <button id="close-help-modal-btn" class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition" aria-label="Close help modal">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          <!-- Switch Access Key Bindings -->
          <div class="space-y-2.5">
            <h4 class="font-bold text-cyan-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>⌨️ Single-Key Switch Bindings (Motor Impairments)</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Toggle Hands-Free Voice Control</span>
                <kbd class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">V</kbd>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Run Privacy & Threat Scan</span>
                <kbd class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">P</kbd>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Toggle WCAG AAA Contrast (7:1+)</span>
                <kbd class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">C</kbd>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Cycle Font Scale (100 / 125 / 150%)</span>
                <kbd class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">F</kbd>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Toggle Academic Privacy Inspector</span>
                <kbd class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">I</kbd>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Toggle Procedural Audio Effects</span>
                <kbd class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">M</kbd>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Dismiss Modals / Slide-over Drawers</span>
                <kbd class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono font-bold">Esc</kbd>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Open this Accessibility Help Dialog</span>
                <kbd class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono font-bold">?</kbd>
              </div>
            </div>
          </div>

          <!-- Spoken Voice Commands -->
          <div class="space-y-2.5">
            <h4 class="font-bold text-emerald-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>🎙️ Supported Voice Commands (Speech Recognition)</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div class="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                <strong class="text-emerald-300">"Start privacy scan"</strong>
                <p class="text-slate-400 text-[10px] mt-0.5 font-sans">Triggers automated 14-vector risk audit.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                <strong class="text-emerald-300">"Block trackers"</strong>
                <p class="text-slate-400 text-[10px] mt-0.5 font-sans">Enforces Privacy-by-Default parameters.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                <strong class="text-emerald-300">"Show consent log"</strong>
                <p class="text-slate-400 text-[10px] mt-0.5 font-sans">Navigates to Ethical AI Consent Matrix.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                <strong class="text-emerald-300">"Audit cookies"</strong>
                <p class="text-slate-400 text-[10px] mt-0.5 font-sans">Scrolls to Dark Pattern Cookie Simulator.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                <strong class="text-emerald-300">"High contrast"</strong>
                <p class="text-slate-400 text-[10px] mt-0.5 font-sans">Toggles pure obsidian high contrast mode.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                <strong class="text-emerald-300">"Increase / Reset font"</strong>
                <p class="text-slate-400 text-[10px] mt-0.5 font-sans">Scales typography up to 150%.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                <strong class="text-emerald-300">"Open inspector"</strong>
                <p class="text-slate-400 text-[10px] mt-0.5 font-sans">Opens Academic Contextual Integrity drawer.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                <strong class="text-emerald-300">"Mute / Unmute sound"</strong>
                <p class="text-slate-400 text-[10px] mt-0.5 font-sans">Controls Web Audio sensory feedback.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs font-mono">
          <span class="text-slate-400">Compliant with WCAG 2.1 AAA Guidelines</span>
          <button id="help-modal-done-btn" class="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition">Done</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.helpModal = modal;

    modal.querySelector('#close-help-modal-btn')?.addEventListener('click', () => this.closeHelpModal());
    modal.querySelector('#help-modal-done-btn')?.addEventListener('click', () => this.closeHelpModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeHelpModal();
    });
  }

  toggleHelpModal() {
    if (!this.helpModal) return;
    if (this.helpModal.classList.contains('hidden')) {
      this.openHelpModal();
    } else {
      this.closeHelpModal();
    }
  }

  openHelpModal() {
    if (!this.helpModal) return;
    this.helpModal.classList.remove('hidden');
    this.trapFocus(this.helpModal);
    this.announcePolite('Accessibility and voice commands help dialog opened.');
  }

  closeHelpModal() {
    if (!this.helpModal || this.helpModal.classList.contains('hidden')) return;
    this.releaseFocus(this.helpModal);
    this.helpModal.classList.add('hidden');
    this.announcePolite('Help dialog closed.');
  }
}
