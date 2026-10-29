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
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 modal-backdrop hidden transition-opacity duration-300';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'help-modal-title');

    modal.innerHTML = `
      <div class="cyber-card rounded-2xl w-full max-w-3xl border border-cyan-500/50 shadow-2xl overflow-hidden bg-slate-950 flex flex-col max-h-[92vh]">
        <div class="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
            </div>
            <div>
              <h3 id="help-modal-title" class="text-sm md:text-base font-bold text-white font-mono">Multimodal Accessibility & Full Voice Command Directory</h3>
              <p class="text-[11px] text-slate-400">Complete hands-free speech dictionary and single-key switch navigation (WCAG 2.1 AAA).</p>
            </div>
          </div>
          <button id="close-help-modal-btn" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition" aria-label="Close help modal (Esc)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-4 md:p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          
          <!-- Single-Key Switch Access -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <h4 class="font-bold text-cyan-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>⌨️ Single-Key Switch Bindings (Motor Impairments)</span>
              </h4>
              <span class="text-[10px] text-slate-500 font-mono">WCAG AAA Keyboard Only</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span>Voice Toggle</span>
                <kbd class="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">V</kbd>
              </div>
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span>Fast Scan</span>
                <kbd class="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">P</kbd>
              </div>
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span>Contrast</span>
                <kbd class="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">C</kbd>
              </div>
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span>Font Scale</span>
                <kbd class="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">F</kbd>
              </div>
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span>Inspector</span>
                <kbd class="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">I</kbd>
              </div>
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span>Mute Audio</span>
                <kbd class="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">M</kbd>
              </div>
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span>Dismiss</span>
                <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">Esc</kbd>
              </div>
              <div class="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span>Help Modal</span>
                <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">?</kbd>
              </div>
            </div>
          </div>

          <!-- Section 1: Core Privacy & Security Commands -->
          <div class="space-y-2">
            <h4 class="font-bold text-emerald-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>🛡️ 1. Core Privacy & Scan Commands</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div class="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-emerald-300">"Block trackers" / "Block all" / "Protect"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Applies strict Privacy-by-Default (gauge drops to 0%, rejects ad trackers).</p>
              </div>
              <div class="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-emerald-300">"Start scan" / "Privacy scan" / "Audit"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Opens Academic Inspector Drawer and runs 14-vector scan.</p>
              </div>
            </div>
          </div>

          <!-- Section 2: Dark Pattern Simulator Controls -->
          <div class="space-y-2">
            <h4 class="font-bold text-cyan-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>🍪 2. Deceptive vs. Ethical Cookie Simulator</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-cyan-300">"Audit cookies" / "Simulator"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Scrolls to Dark Pattern Cookie Simulator.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-rose-300">"Accept all" / "Fall in trap"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Triggers deceptive trap (427 ad trackers accepted).</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-emerald-300">"Reject all" / "Reject optional"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">1-click ethical opt-out of non-essential tracking.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-amber-300">"Open settings" / "Preferences"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Opens Roach Motel nested sliders.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-rose-300">"Confirmshame" / "Shame button"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Exposes emotional guilt manipulation.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-slate-300">"Reset simulator"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Clears simulator back to initial state.</p>
              </div>
            </div>
          </div>

          <!-- Section 3: Privacy Risk Score Meter Controls -->
          <div class="space-y-2">
            <h4 class="font-bold text-amber-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>📊 3. Risk Meter & Permission Vector Controls</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-amber-300">"Risk meter" / "Calculator"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Scrolls to Dynamic Privacy Risk Meter.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-emerald-300">"Preset strict" / "Fortified"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Sets risk score to 0 / 100.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-rose-300">"Preset social" / "Max risk"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Sets risk score to 100 / 100.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-slate-300">"Toggle biometric"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Toggles facial emotion profiling (+30 pts).</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-slate-300">"Toggle location"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Toggles high-precision GPS (+25 pts).</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-slate-300">"Toggle audio"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Toggles ambient microphone capture (+20 pts).</p>
              </div>
            </div>
          </div>

          <!-- Section 4: Ethical AI Consent Matrix -->
          <div class="space-y-2">
            <h4 class="font-bold text-violet-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>🧠 4. Ethical AI Consent Matrix (Topic 5)</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-violet-300">"Show consent" / "AI Matrix"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Navigates to AI Data Sovereignty Matrix.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-slate-300">"Toggle training"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Toggles LLM model training opt-in.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-slate-300">"Toggle human review"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Toggles third-party contractor access.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-slate-300">"Toggle differential privacy"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Toggles client-side PII regex masking.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-cyan-300">"Sample medical"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Tests medical PII prompt masking live.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-rose-300">"Sample secret key"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Tests API key redaction live.</p>
              </div>
            </div>
          </div>

          <!-- Section 5: Academic Viva & Inspector Drawer -->
          <div class="space-y-2">
            <h4 class="font-bold text-blue-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>🎓 5. Academic Inspector & Viva Dossier</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-blue-300">"Open dossier" / "Viva"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Opens complete teacher viva evaluation modal.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-slate-300">"Tab patterns" / "Tab PbD"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Switches directly to Brignull or PbD tab.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-slate-300">"Tab heuristics" / "Tab viva"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Switches to Nielsen heuristics or Viva Q&A.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-cyan-300">"Open inspector"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Opens Contextual Integrity telemetry drawer.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-cyan-300">"Fast scan" / "60x scan"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Executes 60x fast-forward audit.</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <span class="font-mono font-bold text-rose-300">"Inject tracker" / "Simulate breach"</span>
                <p class="text-slate-400 text-[10px] mt-0.5">Tests live defense and mitigation mechanisms.</p>
              </div>
            </div>
          </div>

          <!-- Section 6: Navigation, Scrolling & Accessibility -->
          <div class="space-y-2">
            <h4 class="font-bold text-slate-300 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>📱 6. Hands-Free Page Navigation & Accessibility</span>
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <strong class="text-slate-200">"Scroll top"</strong>
                <p class="text-slate-500 text-[10px]">Jump to top</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <strong class="text-slate-200">"Scroll bottom"</strong>
                <p class="text-slate-500 text-[10px]">Jump to footer</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <strong class="text-slate-200">"Scroll down"</strong>
                <p class="text-slate-500 text-[10px]">Page down</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <strong class="text-slate-200">"Scroll up"</strong>
                <p class="text-slate-500 text-[10px]">Page up</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <strong class="text-amber-300">"High contrast"</strong>
                <p class="text-slate-500 text-[10px]">WCAG AAA 7:1+</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <strong class="text-cyan-300">"Increase font"</strong>
                <p class="text-slate-500 text-[10px]">100 &rarr; 150%</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <strong class="text-slate-300">"Mute / Unmute"</strong>
                <p class="text-slate-500 text-[10px]">Sensory audio</p>
              </div>
              <div class="p-2 bg-slate-900/90 rounded-xl border border-slate-800">
                <strong class="text-rose-300">"Stop voice"</strong>
                <p class="text-slate-500 text-[10px]">Turn off mic</p>
              </div>
            </div>
          </div>

        </div>

        <div class="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs font-mono shrink-0">
          <span class="text-slate-400">WCAG 2.1 AAA Compliant &bull; Zero-Exclusion Voice UX</span>
          <button id="help-modal-done-btn" class="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-950/40">Done (Esc)</button>
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
