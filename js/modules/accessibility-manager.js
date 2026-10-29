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
      <div class="cyber-card rounded-2xl w-full max-w-4xl border border-cyan-500/50 shadow-2xl overflow-hidden bg-slate-950 flex flex-col max-h-[92vh]">
        <!-- Header -->
        <div class="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 id="help-modal-title" class="text-sm md:text-base font-bold text-white font-mono">Multimodal Accessibility & Complete Voice Directory</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">WCAG 2.1 AAA</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Hands-free speech control with noise & accent tolerance, plus single-key switch access.</p>
            </div>
          </div>
          <button id="close-help-modal-btn" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition" aria-label="Close help modal (Esc)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Search Bar & Live Counter -->
        <div class="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <div class="relative w-full">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </span>
            <input 
              type="text" 
              id="help-voice-search-input" 
              placeholder="Search all commands (e.g. tracker, scan, cookies, risk, viva, contrast, font, reset)..." 
              class="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 focus:border-cyan-400 focus:outline-none rounded-xl text-xs text-slate-200 placeholder-slate-500 transition font-mono"
              aria-label="Search voice commands"
            />
            <button id="help-search-clear-btn" class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-500 hover:text-slate-300 hidden" aria-label="Clear search">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto text-[11px] font-mono text-slate-400">
            <span id="help-command-count" class="px-2 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-semibold">35 Commands Ready</span>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div id="help-modal-scroll-body" class="p-4 md:p-6 overflow-y-auto space-y-6 text-xs text-slate-300">

          <!-- Noise & Static Tolerance Guidance Box -->
          <div class="p-3.5 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900/90 rounded-xl border border-cyan-500/30 flex items-start gap-3">
            <span class="text-xl">🎙️</span>
            <div class="space-y-1">
              <h4 class="font-bold text-cyan-300 font-mono text-[11px] uppercase tracking-wide">Headphone Mic & Noise-Tolerant Engine</h4>
              <p class="text-[11px] text-slate-300 leading-relaxed">
                Equipped with smart <strong>Levenshtein fuzzy matching</strong> and a real-time noise normalizer. Background headphone static or pronunciation variations (like <span class="text-cyan-200 font-mono">"lock tracker"</span>, <span class="text-cyan-200 font-mono">"low cracker"</span>, <span class="text-cyan-200 font-mono">"skan"</span>, or <span class="text-cyan-200 font-mono">"cokie"</span>) are automatically corrected into exact system actions! You can also click <strong class="text-cyan-300 font-mono">[▶ Test]</strong> on any command below to test it instantly without speaking.
              </p>
            </div>
          </div>
          
          <!-- Single-Key Switch Access -->
          <div class="space-y-2.5 help-category-group" data-category="switch">
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

          <!-- Section 1: Core Privacy & Scan Commands -->
          <div class="space-y-2 help-category-group" data-category="core">
            <h4 class="font-bold text-emerald-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>🛡️ 1. Core Privacy Defense & Audit Commands</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div class="help-cmd-card p-3 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition flex items-start justify-between gap-3" data-search-tags="block trackers block all lock trackers protect me privacy shield defend stop tracking">
                <div>
                  <span class="font-mono font-bold text-emerald-300">"Block trackers" / "Block all" / "Protect"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Enforces strict Privacy-by-Default (gauge drops to 0%, rejects third-party ad vectors).</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-1 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="block-trackers" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-3 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition flex items-start justify-between gap-3" data-search-tags="start scan privacy scan audit run audit scan vectors inspect analyze">
                <div>
                  <span class="font-mono font-bold text-emerald-300">"Start scan" / "Privacy scan" / "Audit"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Opens Academic Inspector Drawer and executes active 14-vector security scan.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-1 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="start-audit" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-3 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition flex items-start justify-between gap-3" data-search-tags="stop voice mute mic disable voice turn off voice stop listening quiet">
                <div>
                  <span class="font-mono font-bold text-emerald-300">"Stop voice" / "Mute mic" / "Disable voice"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Deactivates continuous microphone listening and preserves battery life.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-1 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="stop-voice" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-3 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition flex items-start justify-between gap-3" data-search-tags="close exit dismiss close modal close drawer hide esc">
                <div>
                  <span class="font-mono font-bold text-emerald-300">"Close" / "Exit" / "Dismiss"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Closes any open drawer, modal, or overlay dialog with smooth animations.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-1 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="close-overlays" title="Test voice command">▶ Test</button>
              </div>
            </div>
          </div>

          <!-- Section 2: Dark Pattern Simulator Controls -->
          <div class="space-y-2 help-category-group" data-category="simulator">
            <h4 class="font-bold text-cyan-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>🍪 2. Deceptive vs. Ethical Cookie Simulator (Topic 12)</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition flex items-start justify-between gap-2" data-search-tags="audit cookies cookie simulator show cookies cookie banner roach motel">
                <div>
                  <span class="font-mono font-bold text-cyan-300">"Audit cookies" / "Simulator"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Scrolls directly to Cookie Simulator section.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 border border-cyan-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="audit-cookies" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-rose-500/40 transition flex items-start justify-between gap-2" data-search-tags="accept all fall in trap fall trap deceptive accept trap cookies dark pattern">
                <div>
                  <span class="font-mono font-bold text-rose-300">"Accept all" / "Fall in trap"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Triggers deceptive trap (427 ad trackers accepted).</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-rose-950/80 hover:bg-rose-800 text-rose-300 border border-rose-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="trap-cookies" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition flex items-start justify-between gap-2" data-search-tags="reject all reject optional ethical reject opt out safe cookie">
                <div>
                  <span class="font-mono font-bold text-emerald-300">"Reject all" / "Reject optional"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">1-click ethical opt-out of non-essential tracking.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="reject-cookies" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-amber-500/40 transition flex items-start justify-between gap-2" data-search-tags="open settings preferences cookie settings roach motel sliders options">
                <div>
                  <span class="font-mono font-bold text-amber-300">"Open settings" / "Preferences"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Opens Roach Motel nested category sliders.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-amber-950/80 hover:bg-amber-800 text-amber-300 border border-amber-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="settings-cookies" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-rose-500/40 transition flex items-start justify-between gap-2" data-search-tags="confirmshame shame button guilt trip confirm shame emotional manipulation">
                <div>
                  <span class="font-mono font-bold text-rose-300">"Confirmshame" / "Shame button"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Demonstrates psychological guilt manipulation.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-rose-950/80 hover:bg-rose-800 text-rose-300 border border-rose-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="confirmshame" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-500/40 transition flex items-start justify-between gap-2" data-search-tags="reset simulator reset cookies clear simulator restart">
                <div>
                  <span class="font-mono font-bold text-slate-300">"Reset simulator" / "Clear cookies"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Restores simulator back to initial state.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="reset-simulator" title="Test voice command">▶ Test</button>
              </div>
            </div>
          </div>

          <!-- Section 3: Privacy Risk Score Meter Controls -->
          <div class="space-y-2 help-category-group" data-category="risk">
            <h4 class="font-bold text-amber-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>📊 3. Risk Meter & Permission Vector Controls</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-amber-500/40 transition flex items-start justify-between gap-2" data-search-tags="risk meter calculate risk privacy risk show calculator score gauge">
                <div>
                  <span class="font-mono font-bold text-amber-300">"Risk meter" / "Calculator"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Scrolls directly to Dynamic Risk Meter.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-amber-950/80 hover:bg-amber-800 text-amber-300 border border-amber-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="show-risk" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition flex items-start justify-between gap-2" data-search-tags="preset strict zero risk strict preset fortified maximum privacy 0 score">
                <div>
                  <span class="font-mono font-bold text-emerald-300">"Preset strict" / "Fortified"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Locks all vectors, setting risk to 0 / 100.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="preset-strict" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-sky-500/40 transition flex items-start justify-between gap-2" data-search-tags="preset balanced balanced preset default risk normal risk">
                <div>
                  <span class="font-mono font-bold text-sky-300">"Preset balanced" / "Default risk"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Applies balanced privacy baseline profile.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-sky-950/80 hover:bg-sky-800 text-sky-300 border border-sky-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="preset-balanced" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-rose-500/40 transition flex items-start justify-between gap-2" data-search-tags="preset social social preset max risk highest risk 100 score dangerous">
                <div>
                  <span class="font-mono font-bold text-rose-300">"Preset social" / "Max risk"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Maximizes vector exposures to 100 / 100.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-rose-950/80 hover:bg-rose-800 text-rose-300 border border-rose-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="preset-social" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-amber-500/40 transition flex items-start justify-between gap-2" data-search-tags="toggle biometric biometric profiling face tracking emotion analysis camera">
                <div>
                  <span class="font-mono font-bold text-slate-300">"Toggle biometric"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Toggles facial emotion profiling (+30 pts).</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="toggle-biometric" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-amber-500/40 transition flex items-start justify-between gap-2" data-search-tags="toggle location gps tracking location vector geography pinpoint">
                <div>
                  <span class="font-mono font-bold text-slate-300">"Toggle location"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Toggles high-precision GPS (+25 pts).</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="toggle-location" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-amber-500/40 transition flex items-start justify-between gap-2" data-search-tags="toggle audio vector microphone vector ambient listening mic capture">
                <div>
                  <span class="font-mono font-bold text-slate-300">"Toggle audio vector"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Toggles continuous microphone capture (+20 pts).</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="toggle-audio-vector" title="Test voice command">▶ Test</button>
              </div>
            </div>
          </div>

          <!-- Section 4: Ethical AI Consent Matrix -->
          <div class="space-y-2 help-category-group" data-category="ai">
            <h4 class="font-bold text-violet-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>🧠 4. Ethical AI Consent Matrix (Topic 5)</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-violet-500/40 transition flex items-start justify-between gap-2" data-search-tags="show consent ai matrix ai consent data sovereignty llm prompt">
                <div>
                  <span class="font-mono font-bold text-violet-300">"Show consent" / "AI Matrix"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Navigates to AI Data Sovereignty Matrix.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-violet-950/80 hover:bg-violet-800 text-violet-300 border border-violet-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="show-consent" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-violet-500/40 transition flex items-start justify-between gap-2" data-search-tags="toggle training disable training opt out training ai training model">
                <div>
                  <span class="font-mono font-bold text-slate-300">"Toggle training"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Toggles LLM model training opt-in.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="toggle-ai-training" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-violet-500/40 transition flex items-start justify-between gap-2" data-search-tags="toggle human review human audit contractor review reviewers">
                <div>
                  <span class="font-mono font-bold text-slate-300">"Toggle human review"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Toggles third-party contractor access.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="toggle-ai-review" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-violet-500/40 transition flex items-start justify-between gap-2" data-search-tags="toggle differential privacy mask pii differential privacy redaction anonymize">
                <div>
                  <span class="font-mono font-bold text-slate-300">"Toggle differential privacy"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Toggles client-side PII regex masking.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="toggle-ai-diffprivacy" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition flex items-start justify-between gap-2" data-search-tags="sample medical test medical prompt medical data diagnosis pii mask">
                <div>
                  <span class="font-mono font-bold text-cyan-300">"Sample medical"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Injects medical PII prompt to test live redaction.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 border border-cyan-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="sample-medical" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-rose-500/40 transition flex items-start justify-between gap-2" data-search-tags="sample secret key api key prompt test secret key secret token credentials">
                <div>
                  <span class="font-mono font-bold text-rose-300">"Sample secret key"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Injects secret API key prompt to test redaction.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-rose-950/80 hover:bg-rose-800 text-rose-300 border border-rose-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="sample-key" title="Test voice command">▶ Test</button>
              </div>
            </div>
          </div>

          <!-- Section 5: Academic Viva & Inspector Drawer -->
          <div class="space-y-2 help-category-group" data-category="academic">
            <h4 class="font-bold text-blue-400 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>🎓 5. Academic Inspector & Viva Dossier</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-blue-500/40 transition flex items-start justify-between gap-2" data-search-tags="open dossier viva dossier teacher viva academic dossier evaluation viva mode">
                <div>
                  <span class="font-mono font-bold text-blue-300">"Open dossier" / "Viva"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Opens teacher viva evaluation modal.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-blue-950/80 hover:bg-blue-800 text-blue-300 border border-blue-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="open-dossier" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-blue-500/40 transition flex items-start justify-between gap-2" data-search-tags="tab patterns dark patterns tab brignull taxonomy sneaky basket roach motel">
                <div>
                  <span class="font-mono font-bold text-slate-300">"Tab patterns" / "Tab dark patterns"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Switches dossier to Harry Brignull taxonomy tab.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="tab-patterns" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-blue-500/40 transition flex items-start justify-between gap-2" data-search-tags="tab privacy by design pbd tab cavoukian tab 7 principles">
                <div>
                  <span class="font-mono font-bold text-slate-300">"Tab privacy by design" / "Tab PbD"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Switches dossier to Ann Cavoukian PbD 7 principles.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="tab-pbd" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-blue-500/40 transition flex items-start justify-between gap-2" data-search-tags="tab heuristics nielsen heuristics usability contextual integrity">
                <div>
                  <span class="font-mono font-bold text-slate-300">"Tab heuristics"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Switches to Jakob Nielsen usability heuristics tab.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="tab-heuristics" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-blue-500/40 transition flex items-start justify-between gap-2" data-search-tags="tab viva viva questions q and a examination defense">
                <div>
                  <span class="font-mono font-bold text-slate-300">"Tab viva" / "Viva questions"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Switches directly to Viva Q&A evaluation sheet.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="tab-viva" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition flex items-start justify-between gap-2" data-search-tags="open inspector heuristic telemetry contextual integrity nissenbaum drawer">
                <div>
                  <span class="font-mono font-bold text-cyan-300">"Open inspector"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Slides open Contextual Integrity telemetry drawer.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 border border-cyan-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="open-inspector" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition flex items-start justify-between gap-2" data-search-tags="fast scan 60x scan speed audit rapid scan simulation">
                <div>
                  <span class="font-mono font-bold text-cyan-300">"Fast scan" / "60x scan"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Executes 60x fast-forward audit telemetry.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 border border-cyan-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="fast-scan" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-rose-500/40 transition flex items-start justify-between gap-2" data-search-tags="inject tracker trigger tracker simulate ad tracker threat alert">
                <div>
                  <span class="font-mono font-bold text-rose-300">"Inject tracker" / "Simulate tracker"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Simulates third-party ad injection alert.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-rose-950/80 hover:bg-rose-800 text-rose-300 border border-rose-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="simulate-tracker" title="Test voice command">▶ Test</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-rose-500/40 transition flex items-start justify-between gap-2" data-search-tags="simulate breach breach alert consent breach violation security">
                <div>
                  <span class="font-mono font-bold text-rose-300">"Simulate breach" / "Breach alert"</span>
                  <p class="text-slate-400 text-[10px] mt-0.5">Triggers simulated consent breach & defense.</p>
                </div>
                <button type="button" class="help-test-btn shrink-0 px-2 py-0.5 bg-rose-950/80 hover:bg-rose-800 text-rose-300 border border-rose-600/50 rounded-lg text-[10px] font-mono transition" data-voice-cmd="simulate-breach" title="Test voice command">▶ Test</button>
              </div>
            </div>
          </div>

          <!-- Section 6: Navigation, Scrolling & Accessibility -->
          <div class="space-y-2 help-category-group" data-category="nav">
            <h4 class="font-bold text-slate-300 font-mono uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>📱 6. Hands-Free Page Navigation & Accessibility</span>
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-600 transition flex items-center justify-between" data-search-tags="scroll top jump top page top scroll up header">
                <div>
                  <strong class="text-slate-200">"Scroll top"</strong>
                  <p class="text-slate-500 text-[10px]">Jump to top</p>
                </div>
                <button type="button" class="help-test-btn px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]" data-voice-cmd="scroll-top">▶</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-600 transition flex items-center justify-between" data-search-tags="scroll bottom jump bottom page bottom footer">
                <div>
                  <strong class="text-slate-200">"Scroll bottom"</strong>
                  <p class="text-slate-500 text-[10px]">Jump to footer</p>
                </div>
                <button type="button" class="help-test-btn px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]" data-voice-cmd="scroll-bottom">▶</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-600 transition flex items-center justify-between" data-search-tags="scroll down page down next section">
                <div>
                  <strong class="text-slate-200">"Scroll down"</strong>
                  <p class="text-slate-500 text-[10px]">Page down</p>
                </div>
                <button type="button" class="help-test-btn px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]" data-voice-cmd="scroll-down">▶</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-600 transition flex items-center justify-between" data-search-tags="scroll up page up previous section">
                <div>
                  <strong class="text-slate-200">"Scroll up"</strong>
                  <p class="text-slate-500 text-[10px]">Page up</p>
                </div>
                <button type="button" class="help-test-btn px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]" data-voice-cmd="scroll-up">▶</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-amber-500/40 transition flex items-center justify-between" data-search-tags="high contrast contrast mode toggle contrast wcag aaa 7:1">
                <div>
                  <strong class="text-amber-300">"High contrast"</strong>
                  <p class="text-slate-500 text-[10px]">WCAG AAA 7:1+</p>
                </div>
                <button type="button" class="help-test-btn px-1.5 py-0.5 bg-amber-950/80 hover:bg-amber-800 text-amber-300 rounded text-[10px]" data-voice-cmd="high-contrast">▶</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between" data-search-tags="increase font bigger text font size scale typography">
                <div>
                  <strong class="text-cyan-300">"Increase font"</strong>
                  <p class="text-slate-500 text-[10px]">100 &rarr; 150%</p>
                </div>
                <button type="button" class="help-test-btn px-1.5 py-0.5 bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 rounded text-[10px]" data-voice-cmd="increase-font">▶</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-500/40 transition flex items-center justify-between" data-search-tags="mute sound unmute audio toggle sound audio feedback chimes">
                <div>
                  <strong class="text-slate-300">"Mute / Unmute"</strong>
                  <p class="text-slate-500 text-[10px]">Sensory audio</p>
                </div>
                <button type="button" class="help-test-btn px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]" data-voice-cmd="toggle-audio">▶</button>
              </div>

              <div class="help-cmd-card p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between" data-search-tags="help what can i say voice commands list commands directory">
                <div>
                  <strong class="text-cyan-300">"Help"</strong>
                  <p class="text-slate-500 text-[10px]">What can I say</p>
                </div>
                <button type="button" class="help-test-btn px-1.5 py-0.5 bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 rounded text-[10px]" data-voice-cmd="help">▶</button>
              </div>
            </div>
          </div>

          <!-- Empty search results message -->
          <div id="help-no-results" class="hidden text-center py-10 px-4">
            <div class="text-3xl mb-2">🔍</div>
            <p class="text-slate-300 font-mono font-bold text-sm">No matching voice commands found</p>
            <p class="text-slate-500 text-[11px] mt-1">Try searching for keywords like "tracker", "scan", "risk", "viva", or "contrast".</p>
          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs font-mono shrink-0">
          <span class="text-slate-400 hidden sm:inline">WCAG 2.1 AAA Compliant &bull; Zero-Exclusion Voice Control</span>
          <div class="flex items-center gap-2 ml-auto">
            <button id="help-modal-done-btn" class="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-950/40">Done (Esc)</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.helpModal = modal;

    // Attach Dialog Event Listeners
    modal.querySelector('#close-help-modal-btn')?.addEventListener('click', () => this.closeHelpModal());
    modal.querySelector('#help-modal-done-btn')?.addEventListener('click', () => this.closeHelpModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeHelpModal();
    });

    // Wire Real-time Search Input
    const searchInput = modal.querySelector('#help-voice-search-input');
    const clearBtn = modal.querySelector('#help-search-clear-btn');
    const countBadge = modal.querySelector('#help-command-count');
    const noResults = modal.querySelector('#help-no-results');
    const commandCards = modal.querySelectorAll('.help-cmd-card');
    const categoryGroups = modal.querySelectorAll('.help-category-group');

    const filterCommands = () => {
      const query = (searchInput.value || '').trim().toLowerCase();
      clearBtn.classList.toggle('hidden', query.length === 0);

      let visibleCount = 0;

      commandCards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const tags = (card.getAttribute('data-search-tags') || '').toLowerCase();
        const matches = query === '' || text.includes(query) || tags.includes(query);

        if (matches) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      // Hide category headings if all their cards are hidden
      categoryGroups.forEach((group) => {
        if (group.getAttribute('data-category') === 'switch') {
          // Switch keys always visible unless query is specific
          const matches = query === '' || group.textContent.toLowerCase().includes(query);
          group.classList.toggle('hidden', !matches && query.length > 0);
          return;
        }
        const visibleChildCards = group.querySelectorAll('.help-cmd-card:not(.hidden)');
        group.classList.toggle('hidden', visibleChildCards.length === 0);
      });

      // Update counter and no-results
      if (query === '') {
        countBadge.textContent = `${commandCards.length} Commands Ready`;
        noResults.classList.add('hidden');
      } else {
        countBadge.textContent = `${visibleCount} of ${commandCards.length} Match`;
        noResults.classList.toggle('hidden', visibleCount > 0);
      }
    };

    searchInput?.addEventListener('input', filterCommands);
    clearBtn?.addEventListener('click', () => {
      searchInput.value = '';
      filterCommands();
      searchInput.focus();
    });

    // Wire [▶ Test] buttons to execute command immediately
    modal.querySelectorAll('.help-test-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cmdId = btn.getAttribute('data-voice-cmd');
        if (!cmdId) return;

        // Close help modal to let user observe result
        this.closeHelpModal();

        // Dispatch command through active PrivacyGuard orchestrator
        if (window.privacyGuardApp && typeof window.privacyGuardApp.handleVoiceCommand === 'function') {
          window.privacyGuardApp.handleVoiceCommand(cmdId);
        } else if (this.onAction) {
          this.onAction(cmdId);
        }

        if (this.audio) this.audio.playClick();
      });
    });
  }
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
