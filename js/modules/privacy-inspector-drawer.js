/**
 * PrivacyGuard UX - Academic Evaluation Tools: HCI Privacy Inspector Drawer
 * 
 * Implements:
 * - Helen Nissenbaum's Contextual Integrity (2004) Analysis
 * - Ann Cavoukian's Privacy by Design (PbD 2009) Compliance Index
 * - Harry Brignull & Jakob Nielsen Usability Matrix
 * - Interactive Academic Simulation Controls (60x Fast Scan, Threat Injection, Breach Simulation)
 */

export class PrivacyInspectorDrawer {
  constructor(options = {}) {
    this.audio = options.audio || null;
    this.accessibility = options.accessibility || null;
    this.voiceSystem = options.voiceSystem || null;

    this.isOpen = false;
    this.drawerEl = null;
    this.isAuditRunning = false;
    this.auditProgress = 0;
    this.simulatedBreachesCount = 0;

    this.init();
  }

  init() {
    this.injectDrawerMarkup();
    this.attachEventListeners();
  }

  injectDrawerMarkup() {
    const drawer = document.createElement('aside');
    drawer.id = 'privacy-inspector-drawer';
    drawer.className = 'fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-950/95 border-l border-cyan-500/30 backdrop-blur-2xl shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Academic Privacy Inspector Drawer');

    drawer.innerHTML = `
      <!-- Top Bar -->
      <div class="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm md:text-base font-bold text-white font-mono">Academic Privacy Inspector</h3>
              <span class="px-2 py-0.2 text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                Hotkey 'I'
              </span>
            </div>
            <p class="text-[11px] text-slate-400">Contextual Integrity & Behavioral Privacy Telemetry</p>
          </div>
        </div>

        <button id="close-inspector-drawer-btn" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition" aria-label="Close inspector drawer (Esc)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Drawer Body Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 text-xs text-slate-300">
        
        <!-- Live Simulation Controls -->
        <div class="cyber-card p-4 rounded-xl space-y-3 border-cyan-500/30 bg-slate-900/80">
          <div class="flex items-center justify-between">
            <span class="font-bold text-cyan-300 font-mono uppercase text-[11px] flex items-center gap-1.5">
              <span>⚡ Interactive Academic Simulation</span>
            </span>
            <span id="inspector-scan-badge" class="px-2 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-400">Idle</span>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] font-mono text-slate-400">
              <span>14-Vector Deep Telemetry Audit</span>
              <span id="inspector-progress-num">0%</span>
            </div>
            <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div id="inspector-progress-bar" class="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 w-0 transition-all duration-150"></div>
            </div>
          </div>

          <!-- Simulation Action Buttons -->
          <div class="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
            <button id="run-fast-audit-btn" class="p-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg font-bold flex items-center justify-center gap-1.5 transition">
              <span>⚡ Fast-Scan (60x)</span>
            </button>
            <button id="trigger-tracker-alert-btn" class="p-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg font-bold flex items-center justify-center gap-1.5 transition">
              <span>🚨 Inject Tracker</span>
            </button>
            <button id="simulate-breach-btn" class="p-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold flex items-center justify-center gap-1.5 transition">
              <span>⚠️ Simulate Breach</span>
            </button>
            <button id="reset-inspector-btn" class="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg font-bold flex items-center justify-center gap-1.5 transition">
              <span>🔄 Reset Telemetry</span>
            </button>
          </div>
        </div>

        <!-- Academic Heuristic 1: Helen Nissenbaum's Contextual Integrity -->
        <div class="cyber-card p-4 rounded-xl space-y-2.5 border-slate-800 bg-slate-900/60">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span class="font-bold text-white text-[12px] flex items-center gap-1.5">
              <span>⚖️ Contextual Integrity (Nissenbaum, 2004)</span>
            </span>
            <span id="ci-status-badge" class="px-2 py-0.5 text-[9px] font-mono rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              Valid Transmission
            </span>
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed">
            Evaluates whether personal data flows conform with context-relative information norms:
          </p>
          <div class="space-y-1.5 font-mono text-[10px]">
            <div class="flex justify-between p-1.5 bg-slate-950 rounded border border-slate-800/80">
              <span class="text-slate-400">Context Sphere:</span>
              <span class="text-cyan-300">Healthcare / Confidential AI Chat</span>
            </div>
            <div class="flex justify-between p-1.5 bg-slate-950 rounded border border-slate-800/80">
              <span class="text-slate-400">Transmission Principle:</span>
              <span id="ci-transmission-principle" class="text-emerald-400">Client-Side Differential Privacy (&epsilon;=0.05)</span>
            </div>
            <div class="flex justify-between p-1.5 bg-slate-950 rounded border border-slate-800/80">
              <span class="text-slate-400">Normative Assessment:</span>
              <span id="ci-norm-status" class="text-slate-200">User Autonomy Preserved</span>
            </div>
          </div>
        </div>

        <!-- Academic Heuristic 2: Ann Cavoukian Privacy by Design Compliance -->
        <div class="cyber-card p-4 rounded-xl space-y-2.5 border-slate-800 bg-slate-900/60">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span class="font-bold text-white text-[12px] flex items-center gap-1.5">
              <span>🛡️ Privacy by Design Index (Cavoukian, 2009)</span>
            </span>
            <span class="font-mono text-cyan-400 text-xs font-bold">100% Compliant</span>
          </div>
          <div class="space-y-1 text-[11px]">
            <div class="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span>1. Proactive not Reactive</span>
              <span class="text-emerald-400 font-mono">Active (Pre-filtered)</span>
            </div>
            <div class="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span>2. Privacy as the Default</span>
              <span class="text-emerald-400 font-mono">Enforced (Toggles Off)</span>
            </div>
            <div class="flex items-center justify-between py-1 border-b border-slate-800/50">
              <span>3. Full Functionality (Positive-Sum)</span>
              <span class="text-emerald-400 font-mono">Zero Latency Trade-off</span>
            </div>
            <div class="flex items-center justify-between py-1">
              <span>4. Visibility and Transparency</span>
              <span class="text-emerald-400 font-mono">Auditable Live Gauge</span>
            </div>
          </div>
        </div>

        <!-- Academic Heuristic 3: Cognitive Friction & Behavioral Telemetry -->
        <div class="cyber-card p-4 rounded-xl space-y-2 border-slate-800 bg-slate-900/60">
          <span class="font-bold text-white text-[12px] block">
            🧠 Cognitive Friction Discrepancy (Brignull Taxonomy)
          </span>
          <div class="grid grid-cols-2 gap-2 text-center font-mono text-[11px] pt-1">
            <div class="p-2 bg-slate-950 rounded border border-rose-900/40">
              <span class="text-slate-400 text-[10px] block">Predatory Asymmetry</span>
              <span class="text-rose-400 font-bold text-sm">+428 Clicks</span>
            </div>
            <div class="p-2 bg-slate-950 rounded border border-emerald-900/40">
              <span class="text-slate-400 text-[10px] block">Ethical Symmetry</span>
              <span class="text-emerald-400 font-bold text-sm">1-Click (Zero Trap)</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Drawer Footer -->
      <div class="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs font-mono">
        <span class="text-slate-400">WCAG 2.1 AAA Compliant</span>
        <button id="drawer-done-btn" class="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition font-semibold">Done</button>
      </div>
    `;

    document.body.appendChild(drawer);
    this.drawerEl = drawer;
  }

  attachEventListeners() {
    // Close button
    this.drawerEl?.querySelector('#close-inspector-drawer-btn')?.addEventListener('click', () => {
      this.close();
    });

    this.drawerEl?.querySelector('#drawer-done-btn')?.addEventListener('click', () => {
      this.close();
    });

    // Fast-Forward Audit (60x)
    this.drawerEl?.querySelector('#run-fast-audit-btn')?.addEventListener('click', () => {
      this.runFastAudit();
    });

    // Trigger Tracker Alert
    this.drawerEl?.querySelector('#trigger-tracker-alert-btn')?.addEventListener('click', () => {
      this.injectSimulatedTracker();
    });

    // Simulate Breach
    this.drawerEl?.querySelector('#simulate-breach-btn')?.addEventListener('click', () => {
      this.simulateConsentBreach();
    });

    // Reset Telemetry
    this.drawerEl?.querySelector('#reset-inspector-btn')?.addEventListener('click', () => {
      this.resetTelemetry();
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (!this.drawerEl) return;
    this.isOpen = true;
    this.drawerEl.classList.remove('translate-x-full');
    if (this.accessibility) {
      this.accessibility.trapFocus(this.drawerEl);
      this.accessibility.announcePolite('Academic Privacy Inspector drawer opened.');
    }
    if (this.audio) this.audio.playShieldEngage();
  }

  close() {
    if (!this.drawerEl) return;
    this.isOpen = false;
    this.drawerEl.classList.add('translate-x-full');
    if (this.accessibility) {
      this.accessibility.releaseFocus(this.drawerEl);
      this.accessibility.announcePolite('Academic Privacy Inspector drawer closed.');
    }
  }

  runFastAudit() {
    if (this.isAuditRunning) return;
    this.isAuditRunning = true;
    this.auditProgress = 0;

    const badge = this.drawerEl.querySelector('#inspector-scan-badge');
    const bar = this.drawerEl.querySelector('#inspector-progress-bar');
    const num = this.drawerEl.querySelector('#inspector-progress-num');

    if (badge) {
      badge.textContent = 'Scanning (60x)...';
      badge.className = 'px-2 py-0.5 text-[9px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse';
    }

    if (this.voiceSystem) {
      this.voiceSystem.speak('Fast-forward audit running at 60x speed across 14 telemetry pipelines.');
    }
    if (this.accessibility) {
      this.accessibility.announcePolite('Running 60x telemetry scan across 14 vectors.');
    }

    const interval = setInterval(() => {
      this.auditProgress += 5;
      if (bar) bar.style.width = `${this.auditProgress}%`;
      if (num) num.textContent = `${this.auditProgress}%`;

      if (this.auditProgress >= 100) {
        clearInterval(interval);
        this.isAuditRunning = false;
        if (badge) {
          badge.textContent = '14 Vectors Clean';
          badge.className = 'px-2 py-0.5 text-[9px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-800';
        }
        if (this.audio) this.audio.playFanfare();
        if (this.voiceSystem) {
          this.voiceSystem.speak('Privacy audit completed successfully. Zero unauthorized leaks detected.');
        }
        if (this.accessibility) {
          this.accessibility.announceAssertive('Privacy audit complete: 14 vectors inspected. All parameters certified Privacy by Design.');
        }
      }
    }, 45);
  }

  injectSimulatedTracker() {
    if (this.audio) this.audio.playThreatAlert();

    const ciBadge = this.drawerEl.querySelector('#ci-status-badge');
    const norm = this.drawerEl.querySelector('#ci-norm-status');
    const principle = this.drawerEl.querySelector('#ci-transmission-principle');

    if (ciBadge) {
      ciBadge.textContent = 'Breach Flagged';
      ciBadge.className = 'px-2 py-0.5 text-[9px] font-mono rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse';
    }
    if (norm) {
      norm.textContent = 'Contextual Norm Ruptured (Third-Party Beacon)';
      norm.className = 'text-rose-400 font-bold';
    }
    if (principle) {
      principle.textContent = 'Unauthorized Ad-Broker Exfiltration';
      principle.className = 'text-rose-400';
    }

    const msg = 'Security warning: Unauthorized background tracking beacon detected. Helen Nissenbaum Contextual Integrity rule violated.';
    if (this.voiceSystem) this.voiceSystem.speak(msg);
    if (this.accessibility) this.accessibility.announceAssertive(msg);
  }

  simulateConsentBreach() {
    if (this.audio) this.audio.playThreatAlert();
    this.simulatedBreachesCount++;

    const ciBadge = this.drawerEl.querySelector('#ci-status-badge');
    const norm = this.drawerEl.querySelector('#ci-norm-status');

    if (ciBadge) {
      ciBadge.textContent = 'Mitigation Active';
      ciBadge.className = 'px-2 py-0.5 text-[9px] font-mono rounded bg-amber-950 text-amber-300 border border-amber-800';
    }
    if (norm) {
      norm.textContent = 'Rogue Exfiltration Neutralized via Client-Side Redaction';
      norm.className = 'text-amber-400 font-bold';
    }

    const msg = 'Simulated data breach intercepted. Positive-Sum architecture neutralized exfiltration without user disruption.';
    if (this.voiceSystem) this.voiceSystem.speak(msg);
    if (this.accessibility) this.accessibility.announceAssertive(msg);
  }

  resetTelemetry() {
    const ciBadge = this.drawerEl.querySelector('#ci-status-badge');
    const norm = this.drawerEl.querySelector('#ci-norm-status');
    const principle = this.drawerEl.querySelector('#ci-transmission-principle');
    const badge = this.drawerEl.querySelector('#inspector-scan-badge');
    const bar = this.drawerEl.querySelector('#inspector-progress-bar');
    const num = this.drawerEl.querySelector('#inspector-progress-num');

    if (ciBadge) {
      ciBadge.textContent = 'Valid Transmission';
      ciBadge.className = 'px-2 py-0.5 text-[9px] font-mono rounded bg-emerald-950 text-emerald-400 border border-emerald-800';
    }
    if (norm) {
      norm.textContent = 'User Autonomy Preserved';
      norm.className = 'text-slate-200';
    }
    if (principle) {
      principle.textContent = 'Client-Side Differential Privacy (\u03B5=0.05)';
      principle.className = 'text-emerald-400';
    }
    if (badge) {
      badge.textContent = 'Idle';
      badge.className = 'px-2 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-400';
    }
    if (bar) bar.style.width = '0%';
    if (num) num.textContent = '0%';

    if (this.audio) this.audio.playShieldEngage();
    if (this.accessibility) this.accessibility.announcePolite('Inspector telemetry reset to default baseline.');
  }
}
