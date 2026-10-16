/**
 * PrivacyGuard UX - Feature 1: Dark Pattern vs. Ethical UX Simulator
 * 
 * Demonstrates:
 * - Harry Brignull's Deceptive Patterns: Confirmshaming, Visual Interference, Obstruction, Pre-selection
 * - Ann Cavoukian's Privacy by Design (PbD): Privacy as Default, Respect for User Privacy, Full Functionality
 * - EDPB Guidelines 05/2020: Equal prominence requirement
 * - GDPR Article 7: Conditions for Consent
 */

import { HCI_KNOWLEDGE_BASE } from '../data/hci-ethics-data.js';

export class DarkPatternSimulator {
  constructor(containerId, onInspectElement, onResetCallback) {
    this.container = document.getElementById(containerId);
    this.onInspectElement = onInspectElement;
    this.onResetCallback = onResetCallback; // Fired after reset so app.js can re-run examiner highlights
    
    // User interaction metrics for comparison
    this.metrics = {
      darkPattern: { clicks: 0, timeStarted: Date.now(), resolved: false, outcome: 'Pending' },
      ethicalUX: { clicks: 0, timeStarted: Date.now(), resolved: false, outcome: 'Pending' }
    };

    this.isNestedSettingsOpen = false;
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Section Header & Examiner Badge -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                HCI Topic 12
              </span>
              <span class="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Live Side-by-Side Lab
              </span>
            </div>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
              Deceptive Banner vs. Privacy-by-Design
            </h2>
            <p class="text-xs md:text-sm text-slate-400 mt-0.5">
              Interact with both live banners to analyze cognitive friction, asymmetrical affordances, and heuristic compliance.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button id="reset-simulator-btn" class="px-3 py-1.5 text-xs font-mono text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center gap-1.5 transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Reset Comparison
            </button>
          </div>
        </div>

        <!-- Side-by-Side Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          <!-- LEFT COLUMN: DECEPTIVE DARK PATTERN BANNER -->
          <div class="cyber-card cyber-card-danger rounded-2xl p-5 md:p-6 relative overflow-hidden">
            <div class="absolute -right-12 -top-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-rose-900/30">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <h3 class="text-base font-bold text-rose-300">Predatory / Dark Pattern Banner</h3>
              </div>
              <span class="text-[11px] font-mono px-2 py-0.5 bg-rose-950/80 text-rose-400 border border-rose-800/60 rounded">
                High Exploitation
              </span>
            </div>

            <!-- Dark Pattern Banner Simulation Box -->
            <div class="bg-slate-950/90 border border-rose-900/40 rounded-xl p-4 md:p-5 relative space-y-4">
              
              <!-- Inspector Badge 1: Fake Urgency / Misleading Header -->
              <div class="relative group">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="text-sm md:text-base font-semibold text-slate-100 flex items-center gap-1.5">
                    🍪 We value your privacy!
                  </h4>
                  <button data-inspect="visual_interference" class="inspect-badge text-[10px] font-mono px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full hover:bg-rose-500/30 flex items-center gap-1">
                    🔍 Inspect Pattern
                  </button>
                </div>
                <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                  We and our <strong class="text-rose-400">427 advertising partners</strong> use invasive trackers, cross-site telemetry, and keystroke analytics to personalize your advertisements and enrich your behavioral profile.
                </p>
              </div>

              <!-- Fake Urgency Bar -->
              <div class="bg-rose-950/40 border border-rose-900/40 px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] text-rose-300">
                <span>⚠️ Session security credentials refresh in:</span>
                <span id="fake-urgency-timer" class="font-mono font-bold text-rose-400 animate-pulse">01:30</span>
              </div>

              <!-- Pre-checked Traps & Trick Questions -->
              <div class="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 relative">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-300">Telemetry Permissions</span>
                  <button data-inspect="pre_selection" class="inspect-badge text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-500/30">
                    🔍 Pre-selection Violation
                  </button>
                </div>

                <label class="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" id="dark-opt-partners" checked class="mt-0.5 rounded bg-slate-800 border-rose-600 text-rose-600 focus:ring-0">
                  <span>Allow 427 ad-tech partners to store device fingerprint & sell profiling data.</span>
                </label>

                <label class="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" id="dark-opt-location" checked class="mt-0.5 rounded bg-slate-800 border-rose-600 text-rose-600 focus:ring-0">
                  <span>Share real-time high-precision GPS tracking with data brokers.</span>
                </label>

                <!-- Trick Question / Double Negative -->
                <label class="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer pt-1 border-t border-slate-800">
                  <input type="checkbox" id="dark-opt-negative" class="mt-0.5 rounded bg-slate-800 border-slate-700 text-rose-600">
                  <span class="text-[11px] italic">Uncheck this box if you do NOT wish to avoid not participating in cross-app profiling.</span>
                </label>
              </div>

              <!-- Nested Roach Motel Settings Drawer (Hidden by default, friction trap) -->
              <div id="dark-nested-settings" class="hidden bg-slate-900 p-3 rounded-lg border border-rose-800/50 space-y-2 text-xs">
                <div class="flex items-center justify-between text-rose-300 font-semibold pb-1 border-b border-slate-800">
                  <span>Roach Motel: Vendor Obstruction (427 Vendors)</span>
                  <button data-inspect="obstruction_friction" class="inspect-badge text-[10px] font-mono px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded">
                    🔍 Obstruction
                  </button>
                </div>
                <p class="text-[11px] text-slate-400">
                  To opt out, manually toggle off each individual vendor below (No "Deselect All" button provided):
                </p>
                <div class="max-h-24 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px]">
                  <div class="flex justify-between items-center bg-slate-950 p-1 rounded"><span>AdVantage Network LLC</span><input type="checkbox" checked class="vendor-chk"></div>
                  <div class="flex justify-between items-center bg-slate-950 p-1 rounded"><span>OmniTrack Behavioral Inc</span><input type="checkbox" checked class="vendor-chk"></div>
                  <div class="flex justify-between items-center bg-slate-950 p-1 rounded"><span>GlobalData Brokerage 360</span><input type="checkbox" checked class="vendor-chk"></div>
                  <div class="flex justify-between items-center bg-slate-950 p-1 rounded"><span>Nexus Consumer Profiling</span><input type="checkbox" checked class="vendor-chk"></div>
                </div>
                <button id="dark-save-vendors-btn" class="w-full py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700">
                  Save Vendor Choices (Requires 423 more clicks)
                </button>
              </div>

              <!-- Button CTA Asymmetry & Confirmshaming -->
              <div class="space-y-2 pt-2">
                <!-- Huge Predatory Accept All CTA -->
                <button id="dark-accept-btn" class="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-900/40 text-sm tracking-wide transition flex items-center justify-center gap-2">
                  <span>⚡ ACCEPT ALL & CONTINUE</span>
                  <span class="text-xs font-normal opacity-80">(Recommended)</span>
                </button>

                <!-- Obscure, Tiny, Low-Contrast Settings & Confirmshaming Link -->
                <div class="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[11px]">
                  <button id="dark-settings-btn" class="text-slate-500 hover:text-slate-400 underline decoration-slate-700">
                    Preferences / Vendor Details (Hidden)
                  </button>
                  
                  <!-- Confirmshaming Link -->
                  <div class="flex items-center gap-1">
                    <button id="dark-confirmshame-btn" class="text-slate-500 hover:text-rose-400 italic text-[11px] transition">
                      "No thanks, I dislike safe & relevant browsing"
                    </button>
                    <button data-inspect="confirmshaming" class="inspect-badge text-[9px] font-mono px-1 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                      🔍 Confirmshaming
                    </button>
                  </div>
                </div>
              </div>

              <!-- Live Simulator Status Toast -->
              <div id="dark-status-msg" class="hidden p-2.5 rounded-lg text-xs font-mono"></div>
            </div>

            <!-- Academic Heuristics Checklist Under Dark Banner -->
            <div class="mt-4 pt-3 border-t border-rose-950/60 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div class="flex items-center gap-1.5 text-rose-400 font-mono">
                <span>❌ Asymmetrical Contrast</span>
              </div>
              <div class="flex items-center gap-1.5 text-rose-400 font-mono">
                <span>❌ Pre-checked Defaults</span>
              </div>
              <div class="flex items-center gap-1.5 text-rose-400 font-mono">
                <span>❌ Confirmshaming Guilt</span>
              </div>
              <div class="flex items-center gap-1.5 text-rose-400 font-mono">
                <span>❌ Roach Motel Obstruction</span>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: PRIVACY-BY-DESIGN ETHICAL UX BANNER -->
          <div class="cyber-card cyber-card-safe rounded-2xl p-5 md:p-6 relative overflow-hidden">
            <div class="absolute -right-12 -top-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div class="flex items-center justify-between pb-3 mb-4 border-b border-emerald-900/30">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 class="text-base font-bold text-emerald-300">Privacy-by-Design Banner (Ethical UX)</h3>
              </div>
              <span class="text-[11px] font-mono px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded">
                100% GDPR Compliant
              </span>
            </div>

            <!-- Ethical Banner Simulation Box -->
            <div class="bg-slate-950/90 border border-emerald-900/40 rounded-xl p-4 md:p-5 relative space-y-4">
              
              <div class="relative">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="text-sm md:text-base font-semibold text-slate-100 flex items-center gap-1.5">
                    🛡️ Your Privacy & Data Choices
                  </h4>
                  <button data-inspect="visual_interference" class="inspect-badge inspect-badge-safe text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full hover:bg-emerald-500/30 flex items-center gap-1">
                    ✅ Symmetrical Design
                  </button>
                </div>
                <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                  We use strictly necessary cookies to keep you logged in securely. All analytics and telemetry are <strong class="text-emerald-400">completely optional</strong> and disabled by default.
                </p>
              </div>

              <!-- Cavoukian Principle 2: Privacy as Default (Unchecked Toggles) -->
              <div class="space-y-2.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div class="flex items-center justify-between pb-1 border-b border-slate-800/70">
                  <span class="text-xs font-semibold text-slate-300">Granular Privacy Preferences</span>
                  <span class="text-[10px] font-mono text-emerald-400">PbD Principle #2 (Default Off)</span>
                </div>

                <!-- Essential Cookies (Always Active, Clearly Explained) -->
                <div class="flex items-center justify-between text-xs py-1">
                  <div>
                    <span class="font-medium text-slate-200">Essential Security & Auth</span>
                    <p class="text-[11px] text-slate-500">Required for session state & anti-CSRF protection.</p>
                  </div>
                  <span class="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
                    Always Active
                  </span>
                </div>

                <!-- Optional Analytics (Default OFF) -->
                <div class="flex items-center justify-between text-xs py-1">
                  <div>
                    <span class="font-medium text-slate-200">Anonymous Telemetry</span>
                    <p class="text-[11px] text-slate-500">Helps us catch UI errors; zero cross-site tracking.</p>
                  </div>
                  <label class="cyber-toggle">
                    <input type="checkbox" id="ethical-opt-analytics">
                    <span class="cyber-toggle-slider"></span>
                  </label>
                </div>

                <!-- 3rd Party Marketing (Default OFF) -->
                <div class="flex items-center justify-between text-xs py-1">
                  <div>
                    <span class="font-medium text-slate-200">Advertising & Personalization</span>
                    <p class="text-[11px] text-slate-500">We do not share your data with 3rd-party data brokers.</p>
                  </div>
                  <label class="cyber-toggle">
                    <input type="checkbox" id="ethical-opt-marketing">
                    <span class="cyber-toggle-slider"></span>
                  </label>
                </div>
              </div>

              <!-- Symmetrical Button Hierarchy (EDPB Equal Prominence Requirement) -->
              <div class="space-y-2 pt-2">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Symmetrical Reject All -->
                  <button id="ethical-reject-btn" class="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-600 text-xs tracking-wide transition flex items-center justify-center gap-1.5 shadow">
                    <span>🛡️ REJECT OPTIONAL</span>
                    <span class="text-[10px] text-slate-400">(1-Click)</span>
                  </button>

                  <!-- Symmetrical Accept Selected -->
                  <button id="ethical-save-btn" class="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950/50 text-xs tracking-wide transition flex items-center justify-center gap-1.5">
                    <span>ACCEPT CHOICES</span>
                  </button>
                </div>

                <!-- Transparent Policy Link -->
                <div class="text-center pt-1">
                  <a href="#calculator-section" class="text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                    Review our Plain-English Privacy Commitments & AI Ethics
                  </a>
                </div>
              </div>

              <!-- Live Simulator Status Toast -->
              <div id="ethical-status-msg" class="hidden p-2.5 rounded-lg text-xs font-mono"></div>
            </div>

            <!-- Academic Heuristics Checklist Under Ethical Banner -->
            <div class="mt-4 pt-3 border-t border-emerald-950/60 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div class="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span>✅ Equal Prominence (EDPB)</span>
              </div>
              <div class="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span>✅ Privacy-as-Default (PbD)</span>
              </div>
              <div class="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span>✅ Zero Confirmshaming</span>
              </div>
              <div class="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span>✅ 1-Click Symmetrical Choice</span>
              </div>
            </div>
          </div>

        </div>

        <!-- LIVE BEHAVIORAL HCI AUDIT COMPARISON MATRIX -->
        <div class="cyber-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <h4 class="text-sm font-bold text-white">Live HCI Behavioral Audit (Interaction Telemetry)</h4>
            </div>
            <span class="text-xs font-mono text-slate-400">Real-time friction and heuristic telemetry</span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span class="text-[11px] text-slate-400 block mb-1">Clicks to Opt-Out (Dark UX)</span>
              <span id="audit-dark-clicks" class="text-lg md:text-xl font-bold font-mono text-rose-400">428 Clicks</span>
              <span class="text-[10px] text-slate-500 block mt-0.5">High Friction Obstruction</span>
            </div>

            <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span class="text-[11px] text-slate-400 block mb-1">Clicks to Opt-Out (Ethical UX)</span>
              <span id="audit-ethical-clicks" class="text-lg md:text-xl font-bold font-mono text-emerald-400">1 Click</span>
              <span class="text-[10px] text-slate-500 block mt-0.5">Zero Friction Symmetry</span>
            </div>

            <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span class="text-[11px] text-slate-400 block mb-1">Cognitive Load Discrepancy</span>
              <span class="text-lg md:text-xl font-bold font-mono text-amber-400">+480% Burden</span>
              <span class="text-[10px] text-slate-500 block mt-0.5">Double Negatives & Guilt</span>
            </div>

            <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span class="text-[11px] text-slate-400 block mb-1">Regulatory Legality</span>
              <span class="text-lg md:text-xl font-bold font-mono text-rose-400">Illegal (GDPR Art. 7)</span>
              <span class="text-[10px] text-slate-500 block mt-0.5">Fails CJEU Planet49 Test</span>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  startUrgencyTimer() {
    this.stopUrgencyTimer();
    let secondsLeft = 90; // 01:30
    this.timerInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft < 0) {
        secondsLeft = 90;
        const darkStatusMsg = document.getElementById('dark-status-msg');
        if (darkStatusMsg) {
          darkStatusMsg.className = "p-2.5 rounded-lg text-xs font-mono bg-amber-950/90 border border-amber-800 text-amber-300 block";
          darkStatusMsg.innerHTML = `
            <strong>⚠️ Fake Urgency Exposed:</strong> The countdown timer reached 00:00 and quietly reset to 01:30! This proves the session urgency was completely fabricated to pressure your consent.
          `;
        }
      }
      const timerEl = document.getElementById('fake-urgency-timer');
      if (timerEl) {
        const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
        const secs = String(secondsLeft % 60).padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  stopUrgencyTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateAuditTelemetry() {
    const darkClicksEl = document.getElementById('audit-dark-clicks');
    const ethicalClicksEl = document.getElementById('audit-ethical-clicks');
    if (darkClicksEl) {
      if (this.metrics.darkPattern.clicks === 0) {
        darkClicksEl.textContent = '0 / 428 Clicks';
      } else {
        darkClicksEl.textContent = `${this.metrics.darkPattern.clicks} Click${this.metrics.darkPattern.clicks > 1 ? 's' : ''} (Trapped)`;
      }
    }
    if (ethicalClicksEl) {
      if (this.metrics.ethicalUX.clicks === 0) {
        ethicalClicksEl.textContent = '1 Click Required';
      } else {
        ethicalClicksEl.textContent = `${this.metrics.ethicalUX.clicks} Click (Opted Out)`;
      }
    }
  }

  attachEventListeners() {
    // Start live fake urgency countdown
    this.startUrgencyTimer();
    this.updateAuditTelemetry();

    // Inspect Element buttons
    this.container.querySelectorAll('[data-inspect]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const patternId = btn.getAttribute('data-inspect');
        if (this.onInspectElement) {
          this.onInspectElement(patternId);
        }
      });
    });

    // Dark Banner: Accept All CTA
    const darkAcceptBtn = document.getElementById('dark-accept-btn');
    darkAcceptBtn?.addEventListener('click', () => {
      const darkStatusMsg = document.getElementById('dark-status-msg');
      if (!darkStatusMsg) return;
      this.metrics.darkPattern.clicks++;
      this.metrics.darkPattern.resolved = true;
      this.metrics.darkPattern.outcome = 'Accepted Exploitative Tracking';
      this.updateAuditTelemetry();

      darkStatusMsg.className = "p-2.5 rounded-lg text-xs font-mono bg-rose-950/90 border border-rose-800 text-rose-300 block";
      darkStatusMsg.innerHTML = `
        <strong>⚠️ Dark Pattern Trap Triggered:</strong> You accepted 427 ad trackers with 1 accidental click. 
        <em>Nielsen Heuristic #3 Violated:</em> No clear exit was afforded.
      `;
    });

    // Dark Banner: Preferences Button (Reveals Roach Motel nested sliders)
    const darkSettingsBtn = document.getElementById('dark-settings-btn');
    const darkNestedSettings = document.getElementById('dark-nested-settings');
    darkSettingsBtn?.addEventListener('click', () => {
      const darkStatusMsg = document.getElementById('dark-status-msg');
      if (!darkStatusMsg) return;
      this.metrics.darkPattern.clicks++;
      this.isNestedSettingsOpen = !this.isNestedSettingsOpen;
      darkNestedSettings?.classList.toggle('hidden', !this.isNestedSettingsOpen);
      this.updateAuditTelemetry();
      
      darkStatusMsg.className = "p-2.5 rounded-lg text-xs font-mono bg-amber-950/80 border border-amber-800 text-amber-300 block";
      darkStatusMsg.innerHTML = `
        <strong>⚠️ Obstruction / Roach Motel:</strong> Preferences opened, but require manual unticking of 427 separate checkboxes without a "Reject All" option.
      `;
    });

    // Dark Banner: Confirmshaming Button
    const darkConfirmshameBtn = document.getElementById('dark-confirmshame-btn');
    darkConfirmshameBtn?.addEventListener('click', () => {
      const darkStatusMsg = document.getElementById('dark-status-msg');
      if (!darkStatusMsg) return;
      this.metrics.darkPattern.clicks++;
      this.updateAuditTelemetry();
      darkStatusMsg.className = "p-2.5 rounded-lg text-xs font-mono bg-rose-950/90 border border-rose-800 text-rose-300 block";
      darkStatusMsg.innerHTML = `
        <strong>⚠️ Confirmshaming Identified:</strong> The user was forced to read a self-deprecating statement ("No thanks, I dislike safe browsing") just to exercise a legal privacy right.
      `;
    });

    // Dark Banner: Vendor Checkboxes in Roach Motel
    const vendorCheckboxes = this.container.querySelectorAll('.vendor-chk');
    vendorCheckboxes.forEach((chk, idx) => {
      chk.addEventListener('change', () => {
        this.metrics.darkPattern.clicks++;
        this.updateAuditTelemetry();
        const darkStatusMsg = document.getElementById('dark-status-msg');
        const saveBtn = document.getElementById('dark-save-vendors-btn');
        const remaining = 427 - this.metrics.darkPattern.clicks;
        if (saveBtn) {
          saveBtn.textContent = `Save Vendor Choices (Requires ${Math.max(1, remaining)} more clicks)`;
        }
        if (darkStatusMsg) {
          darkStatusMsg.className = "p-2.5 rounded-lg text-xs font-mono bg-amber-950/80 border border-amber-800 text-amber-300 block";
          darkStatusMsg.innerHTML = `
            <strong>⚠️ Roach Motel Friction:</strong> You unchecked 1 vendor. <em>${remaining} more vendors</em> are still tracking you in the background!
          `;
        }
      });
    });

    // Dark Banner: Roach motel save vendors
    const darkSaveVendorsBtn = document.getElementById('dark-save-vendors-btn');
    darkSaveVendorsBtn?.addEventListener('click', () => {
      const darkStatusMsg = document.getElementById('dark-status-msg');
      if (!darkStatusMsg) return;
      this.metrics.darkPattern.clicks += 4;
      this.updateAuditTelemetry();
      darkStatusMsg.className = "p-2.5 rounded-lg text-xs font-mono bg-amber-950/80 border border-amber-800 text-amber-300 block";
      darkStatusMsg.innerHTML = `
        <strong>⚠️ Cognitive Fatigue:</strong> After multiple clicks, legitimate interest loop-holes still keep tracking active.
      `;
    });

    // Dark Banner: Double Negative Trick Question Checkbox
    const darkOptNegative = document.getElementById('dark-opt-negative');
    darkOptNegative?.addEventListener('change', (e) => {
      this.metrics.darkPattern.clicks++;
      this.updateAuditTelemetry();
      const darkStatusMsg = document.getElementById('dark-status-msg');
      if (darkStatusMsg) {
        darkStatusMsg.className = "p-2.5 rounded-lg text-xs font-mono bg-rose-950/90 border border-rose-800 text-rose-300 block";
        darkStatusMsg.innerHTML = `
          <strong>⚠️ Double Negative Manipulation:</strong> Prompt states <em>"Uncheck if you do NOT wish to avoid NOT participating"</em>. By interacting with this confusing phrasing, you were manipulated!
        `;
      }
    });

    // Dark Banner: Pre-selected Checkboxes
    const darkOptPartners = document.getElementById('dark-opt-partners');
    darkOptPartners?.addEventListener('change', () => {
      this.metrics.darkPattern.clicks++;
      this.updateAuditTelemetry();
      const darkStatusMsg = document.getElementById('dark-status-msg');
      if (darkStatusMsg) {
        darkStatusMsg.className = "p-2.5 rounded-lg text-xs font-mono bg-amber-950/80 border border-amber-800 text-amber-300 block";
        darkStatusMsg.innerHTML = `
          <strong>⚠️ Pre-Selection Violation:</strong> This box was pre-checked to exploit status-quo inertia. CJEU Planet49 ruling mandates affirmative active opt-in.
        `;
      }
    });

    // Ethical Banner: Reject All (1-click)
    const ethicalRejectBtn = document.getElementById('ethical-reject-btn');
    const ethicalStatusMsg = document.getElementById('ethical-status-msg');
    ethicalRejectBtn?.addEventListener('click', () => {
      this.metrics.ethicalUX.clicks = 1;
      this.metrics.ethicalUX.resolved = true;
      this.metrics.ethicalUX.outcome = 'Full Privacy Preserved';
      this.updateAuditTelemetry();

      // Ensure optional toggles stay off
      const analyticsToggle = document.getElementById('ethical-opt-analytics');
      const marketingToggle = document.getElementById('ethical-opt-marketing');
      if (analyticsToggle) analyticsToggle.checked = false;
      if (marketingToggle) marketingToggle.checked = false;

      ethicalStatusMsg.className = "p-2.5 rounded-lg text-xs font-mono bg-emerald-950/90 border border-emerald-800 text-emerald-300 block";
      ethicalStatusMsg.innerHTML = `
        <strong>✅ Ethical Privacy Preserved:</strong> All optional tracking rejected in 1 click. Zero telemetry stored. 
        <em>Nielsen Heuristic #3 Upheld:</em> User control & freedom respected.
      `;
    });

    // Ethical Banner: Save Choices
    const ethicalSaveBtn = document.getElementById('ethical-save-btn');
    ethicalSaveBtn?.addEventListener('click', () => {
      this.metrics.ethicalUX.clicks++;
      this.updateAuditTelemetry();
      const analyticsVal = document.getElementById('ethical-opt-analytics')?.checked;
      const marketingVal = document.getElementById('ethical-opt-marketing')?.checked;

      ethicalStatusMsg.className = "p-2.5 rounded-lg text-xs font-mono bg-emerald-950/90 border border-emerald-800 text-emerald-300 block";
      ethicalStatusMsg.innerHTML = `
        <strong>✅ Granular Consent Saved:</strong> Analytics: ${analyticsVal ? 'ON' : 'OFF'}, Marketing: ${marketingVal ? 'ON' : 'OFF'}. 
        <em>GDPR Art. 7 Upheld:</em> Specific, informed, and unambiguous consent.
      `;
    });

    // Reset Comparison
    const resetBtn = document.getElementById('reset-simulator-btn');
    resetBtn?.addEventListener('click', () => {
      this.stopUrgencyTimer();
      this.metrics = {
        darkPattern: { clicks: 0, timeStarted: Date.now(), resolved: false, outcome: 'Pending' },
        ethicalUX: { clicks: 0, timeStarted: Date.now(), resolved: false, outcome: 'Pending' }
      };
      this.isNestedSettingsOpen = false;
      this.init(); // Re-render HTML & restart timer
      if (this.onResetCallback) this.onResetCallback();
    });
  }
}
