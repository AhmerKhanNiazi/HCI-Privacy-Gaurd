/**
 * PrivacyGuard UX - Feature 2: Dynamic Privacy Risk Score Calculator
 * 
 * Demonstrates:
 * - Ann Cavoukian's Privacy by Design Principle 2: Privacy as Default
 * - Threat Vector Modeling across Sensor & Behavioral Data
 * - Real-time animated SVG Gauge with WCAG compliant color transitions
 * - Dynamic Academic Risk Heuristic Breakdown
 */

import { HCI_KNOWLEDGE_BASE } from '../data/hci-ethics-data.js';

export class PrivacyRiskCalculator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    // Initial State (Defaulting to Ethical PbD state: Minimal Risk)
    this.state = {
      preciseLocation: false,
      biometricProfiling: false,
      continuousAudio: false,
      crossTracking: false,
      dataBrokerage: false,
      retentionMonths: 1 // 1 month
    };
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.updateCalculation();
  }

  render() {
    this.container.innerHTML = `
      <div class="space-y-6">
        <!-- Section Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                HCI Topic 12
              </span>
              <span class="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Quantitative Threat Modeling
              </span>
            </div>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
              Dynamic Privacy Risk Score Calculator
            </h2>
            <p class="text-xs md:text-sm text-slate-400 mt-0.5">
              Simulate sensor permissions and data retention horizons to evaluate real-time surveillance exposure.
            </p>
          </div>

          <!-- Quick Presets -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs text-slate-500 font-mono">Presets:</span>
            <button id="preset-strict-btn" class="px-2.5 py-1 text-xs font-mono bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 rounded-lg transition">
              🛡️ Privacy-by-Default
            </button>
            <button id="preset-moderate-btn" class="px-2.5 py-1 text-xs font-mono bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/60 rounded-lg transition">
              ⚖️ Balanced
            </button>
            <button id="preset-social-btn" class="px-2.5 py-1 text-xs font-mono bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-lg transition">
              🚨 Predatory Social Media
            </button>
          </div>
        </div>

        <!-- Main Calculator Layout: 2 Columns (Controls vs Gauge & Heuristic) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          <!-- CONTROLS COLUMN (7 Cols) -->
          <div class="lg:col-span-7 cyber-card rounded-2xl p-5 md:p-6 space-y-5">
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 class="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                Permission Vector Configuration
              </h3>
              <span class="text-xs font-mono text-slate-500">Live Sensitivity Inputs</span>
            </div>

            <!-- Permission Toggles List -->
            <div class="space-y-3">
              
              <!-- Vector 1: Biometric Profiling -->
              <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
                <div class="pr-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs md:text-sm font-semibold text-slate-200">Biometric & Facial Emotion Mesh</span>
                    <span class="px-1.5 py-0.2 text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-800 rounded">+30 Pts</span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Continuous facial landmark detection and emotional state classification via front camera.
                  </p>
                </div>
                <label class="cyber-toggle cyber-toggle-danger shrink-0">
                  <input type="checkbox" id="calc-biometric">
                  <span class="cyber-toggle-slider"></span>
                </label>
              </div>

              <!-- Vector 2: Precise Geolocation -->
              <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
                <div class="pr-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs md:text-sm font-semibold text-slate-200">High-Precision GPS & WiFi Triangulation</span>
                    <span class="px-1.5 py-0.2 text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 rounded">+25 Pts</span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Sub-meter physical location telemetry collected continuously in background.
                  </p>
                </div>
                <label class="cyber-toggle cyber-toggle-danger shrink-0">
                  <input type="checkbox" id="calc-location">
                  <span class="cyber-toggle-slider"></span>
                </label>
              </div>

              <!-- Vector 3: Continuous Audio Capture -->
              <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
                <div class="pr-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs md:text-sm font-semibold text-slate-200">Ambient Microphone Stream</span>
                    <span class="px-1.5 py-0.2 text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 rounded">+20 Pts</span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Passive listening for ultrasonic beacons and acoustic environment classification.
                  </p>
                </div>
                <label class="cyber-toggle cyber-toggle-danger shrink-0">
                  <input type="checkbox" id="calc-audio">
                  <span class="cyber-toggle-slider"></span>
                </label>
              </div>

              <!-- Vector 4: 3rd Party Data Broker Selling -->
              <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
                <div class="pr-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs md:text-sm font-semibold text-slate-200">3rd-Party Brokerage Syndication</span>
                    <span class="px-1.5 py-0.2 text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 rounded">+20 Pts</span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Selling behavioral profiles to credit scoring agencies, insurers, and advertising conglomerates.
                  </p>
                </div>
                <label class="cyber-toggle cyber-toggle-danger shrink-0">
                  <input type="checkbox" id="calc-brokerage">
                  <span class="cyber-toggle-slider"></span>
                </label>
              </div>

              <!-- Vector 5: Cross-Site Tracking & Canvas Fingerprinting -->
              <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
                <div class="pr-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs md:text-sm font-semibold text-slate-200">Browser Canvas Fingerprinting</span>
                    <span class="px-1.5 py-0.2 text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 rounded">+15 Pts</span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Persistent tracking across unrelated domains via hardware rendering artifacts.
                  </p>
                </div>
                <label class="cyber-toggle cyber-toggle-danger shrink-0">
                  <input type="checkbox" id="calc-fingerprint">
                  <span class="cyber-toggle-slider"></span>
                </label>
              </div>

              <!-- Vector 6: Data Retention Slider -->
              <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-xs md:text-sm font-semibold text-slate-200">Telemetry Retention Window</span>
                    <p class="text-[11px] text-slate-400">Duration server stores logs before cryptographic erasure.</p>
                  </div>
                  <span id="retention-label" class="px-2 py-0.5 text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                    30 Days
                  </span>
                </div>

                <div class="pt-1">
                  <input type="range" id="calc-retention" min="0" max="4" value="1" step="1" class="cyber-slider w-full">
                  <div class="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                    <span>Immediate (Ephemeral)</span>
                    <span>30 Days</span>
                    <span>1 Year</span>
                    <span>5 Years</span>
                    <span class="text-rose-400">Indefinite (Forever)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- GAUGE & ETHICAL HEURISTICS BREAKDOWN (5 Cols) -->
          <div class="lg:col-span-5 flex flex-col gap-6">
            
            <!-- Real-time Visual Gauge Meter Card -->
            <div class="cyber-card rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div id="gauge-ambient-glow" class="absolute -top-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 bg-emerald-500/20"></div>

              <span class="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">
                Aggregated Privacy Risk Index
              </span>

              <!-- SVG Semi-Circular Radial Gauge -->
              <div class="relative w-48 h-32 md:w-56 md:h-36 flex items-center justify-center mt-2">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <!-- Background Track -->
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#1E293B"
                    stroke-width="10"
                    fill="transparent"
                    stroke-dasharray="301.6"
                    stroke-dashoffset="75.4"
                    stroke-linecap="round"
                  />
                  <!-- Animated Value Arc -->
                  <circle
                    id="gauge-arc"
                    class="gauge-meter-path"
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#10B981"
                    stroke-width="11"
                    fill="transparent"
                    stroke-dasharray="301.6"
                    stroke-dashoffset="301.6"
                    stroke-linecap="round"
                  />
                </svg>

                <!-- Center Gauge Score Counter -->
                <div class="absolute inset-0 flex flex-col items-center justify-center pt-3">
                  <span id="gauge-score-num" class="text-4xl md:text-5xl font-black font-mono tracking-tight text-emerald-400 transition-colors duration-500">
                    0
                  </span>
                  <span class="text-[11px] font-mono text-slate-400 uppercase">/ 100 Risk</span>
                </div>
              </div>

              <!-- Threat Level Indicator Banner -->
              <div id="threat-level-badge" class="mt-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border transition-all duration-500 bg-emerald-950/80 text-emerald-300 border-emerald-800">
                🟢 Fortified (Privacy-by-Design Compliant)
              </div>

              <p id="threat-summary-text" class="text-xs text-slate-400 mt-2.5 max-w-xs leading-relaxed">
                Zero invasive sensors active. User autonomy is preserved.
              </p>
            </div>

            <!-- Dynamic Academic Heuristics & Legal Compliance Box -->
            <div class="cyber-card rounded-2xl p-5 flex-1 space-y-3.5 bg-slate-900/60">
              <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 class="text-xs md:text-sm font-bold text-white flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  HCI Ethical Heuristics Audit
                </h4>
                <span class="text-[10px] font-mono text-cyan-400">Cavoukian & GDPR</span>
              </div>

              <!-- Dynamic Heuristic Bullet Points -->
              <div id="calculator-audit-list" class="space-y-2 text-xs">
                <!-- Dynamically populated via JS -->
              </div>
            </div>

          </div>

        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Toggles
    const toggleIds = ['calc-biometric', 'calc-location', 'calc-audio', 'calc-brokerage', 'calc-fingerprint'];
    toggleIds.forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => this.updateCalculation());
    });

    // Retention Slider (input for drag, change for mobile touch release)
    const retentionSlider = document.getElementById('calc-retention');
    ['input', 'change'].forEach(evt => {
      retentionSlider?.addEventListener(evt, () => this.updateCalculation());
    });

    // Preset: Strict Privacy
    document.getElementById('preset-strict-btn')?.addEventListener('click', () => {
      toggleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
      });
      if (retentionSlider) retentionSlider.value = "0"; // Ephemeral
      this.updateCalculation();
    });

    // Preset: Balanced (location + fingerprint only, 30-day retention)
    document.getElementById('preset-moderate-btn')?.addEventListener('click', () => {
      toggleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = (id === 'calc-location' || id === 'calc-fingerprint');
      });
      if (retentionSlider) retentionSlider.value = "1"; // 30 days
      this.updateCalculation();
    });

    // Preset: Predatory Social Media
    document.getElementById('preset-social-btn')?.addEventListener('click', () => {
      toggleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = true;
      });
      if (retentionSlider) retentionSlider.value = "4"; // Indefinite
      this.updateCalculation();
    });
  }

  updateCalculation() {
    const isBiometric = document.getElementById('calc-biometric')?.checked || false;
    const isLocation = document.getElementById('calc-location')?.checked || false;
    const isAudio = document.getElementById('calc-audio')?.checked || false;
    const isBrokerage = document.getElementById('calc-brokerage')?.checked || false;
    const isFingerprint = document.getElementById('calc-fingerprint')?.checked || false;
    const retentionVal = parseInt(document.getElementById('calc-retention')?.value || '1', 10);

    // Retention weights & labels
    const retentionLabels = ['Immediate (Ephemeral)', '30 Days', '1 Year', '5 Years', 'Indefinite (Permanent)'];
    const retentionPoints = [0, 4, 10, 15, 20];

    const retentionLabelEl = document.getElementById('retention-label');
    if (retentionLabelEl) {
      retentionLabelEl.textContent = retentionLabels[retentionVal];
    }

    // Calculate aggregated score (max capped at 100 for gauge visualization)
    let rawScore = 0;
    if (isBiometric) rawScore += HCI_KNOWLEDGE_BASE.riskWeights.biometricProfiling;
    if (isLocation) rawScore += HCI_KNOWLEDGE_BASE.riskWeights.preciseLocation;
    if (isAudio) rawScore += HCI_KNOWLEDGE_BASE.riskWeights.continuousAudioCapture;
    if (isBrokerage) rawScore += HCI_KNOWLEDGE_BASE.riskWeights.thirdPartyBrokerage;
    if (isFingerprint) rawScore += HCI_KNOWLEDGE_BASE.riskWeights.browserCrossTracking;
    rawScore += retentionPoints[retentionVal];

    const displayScore = Math.min(100, rawScore);

    // Update SVG Gauge
    this.updateGaugeUI(displayScore);

    // Update Dynamic HCI Heuristics list
    this.updateAuditList({
      isBiometric,
      isLocation,
      isAudio,
      isBrokerage,
      isFingerprint,
      retentionVal,
      displayScore
    });
  }

  updateGaugeUI(score) {
    const scoreNumEl = document.getElementById('gauge-score-num');
    const gaugeArc = document.getElementById('gauge-arc');
    const badgeEl = document.getElementById('threat-level-badge');
    const summaryEl = document.getElementById('threat-summary-text');
    const glowEl = document.getElementById('gauge-ambient-glow');

    if (!scoreNumEl || !gaugeArc || !badgeEl || !summaryEl || !glowEl) return;

    scoreNumEl.textContent = score;

    // Circumference of r=48 is ~301.6. We use 226.2 for a 270-degree or 225-degree arc.
    // Full gauge track dasharray = 301.6, open arc = 226
    const maxOffset = 301.6;
    const arcLength = 226.2;
    // Map score 0-100 to offset
    const offset = maxOffset - ((score / 100) * arcLength);
    gaugeArc.style.strokeDashoffset = offset;

    // Color states based on score
    if (score <= 20) {
      // Safe / Fortified
      gaugeArc.style.stroke = '#10B981';
      scoreNumEl.className = 'text-4xl md:text-5xl font-black font-mono tracking-tight text-emerald-400';
      badgeEl.className = 'mt-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border bg-emerald-950/80 text-emerald-300 border-emerald-800';
      badgeEl.innerHTML = '🟢 Fortified (Privacy-by-Design)';
      summaryEl.textContent = 'Zero to minimal telemetry. Cavoukian Principle 2 (Privacy as Default) is fully respected.';
      glowEl.className = 'absolute -top-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 bg-emerald-500/20';
    } else if (score <= 45) {
      // Moderate / Caution
      gaugeArc.style.stroke = '#F59E0B';
      scoreNumEl.className = 'text-4xl md:text-5xl font-black font-mono tracking-tight text-amber-400';
      badgeEl.className = 'mt-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border bg-amber-950/80 text-amber-300 border-amber-800';
      badgeEl.innerHTML = '🟡 Moderate Exposure (Caution)';
      summaryEl.textContent = 'Controlled telemetry active. Review whether retention periods are strictly necessary under GDPR Art. 5(1)(e).';
      glowEl.className = 'absolute -top-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 bg-amber-500/20';
    } else if (score <= 75) {
      // High Risk
      gaugeArc.style.stroke = '#FB923C';
      scoreNumEl.className = 'text-4xl md:text-5xl font-black font-mono tracking-tight text-orange-400';
      badgeEl.className = 'mt-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border bg-orange-950/80 text-orange-300 border-orange-800';
      badgeEl.innerHTML = '🟠 High Surveillance Risk';
      summaryEl.textContent = 'Physical or acoustic tracking active. High risk of behavioral re-identification without explicit informed consent.';
      glowEl.className = 'absolute -top-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 bg-orange-500/20';
    } else {
      // Critical Exploitation
      gaugeArc.style.stroke = '#F43F5E';
      scoreNumEl.className = 'text-4xl md:text-5xl font-black font-mono tracking-tight text-rose-400';
      badgeEl.className = 'mt-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border bg-rose-950/80 text-rose-300 border-rose-800';
      badgeEl.innerHTML = '🔴 Critical Hazard (Predatory Exploitation)';
      summaryEl.textContent = 'Severe privacy violation. Biometrics, audio, and brokers combined with permanent storage violate basic human rights and GDPR.';
      glowEl.className = 'absolute -top-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 bg-rose-500/30';
    }
  }

  updateAuditList({ isBiometric, isLocation, isAudio, isBrokerage, isFingerprint, retentionVal, displayScore }) {
    const listEl = document.getElementById('calculator-audit-list');
    if (!listEl) return;

    let items = [];

    if (isBiometric) {
      items.push(`
        <div class="p-2 bg-rose-950/40 border border-rose-900/60 rounded-lg flex items-start gap-2">
          <span class="text-rose-400 font-bold shrink-0">⚠️</span>
          <div>
            <strong class="text-rose-300 font-mono text-[11px]">GDPR Art. 9 Violation Risk:</strong>
            <p class="text-slate-400 text-[11px]">Processing special category biometric data requires explicit separate consent and strict DPIA (Data Protection Impact Assessment).</p>
          </div>
        </div>
      `);
    }

    if (isLocation) {
      items.push(`
        <div class="p-2 bg-amber-950/40 border border-amber-900/60 rounded-lg flex items-start gap-2">
          <span class="text-amber-400 font-bold shrink-0">📍</span>
          <div>
            <strong class="text-amber-300 font-mono text-[11px]">Physical Stalking & Geofencing Threat:</strong>
            <p class="text-slate-400 text-[11px]">High precision GPS telemetry reveals home address, daily habits, and religious/medical affiliations.</p>
          </div>
        </div>
      `);
    }

    if (isBrokerage) {
      items.push(`
        <div class="p-2 bg-rose-950/40 border border-rose-900/60 rounded-lg flex items-start gap-2">
          <span class="text-rose-400 font-bold shrink-0">💰</span>
          <div>
            <strong class="text-rose-300 font-mono text-[11px]">Surveillance Capitalism Syndication:</strong>
            <p class="text-slate-400 text-[11px]">Cavoukian Principle 5 (End-to-End Security) failed: User loses custody over personal identity once distributed to data brokers.</p>
          </div>
        </div>
      `);
    }

    if (retentionVal >= 3) {
      items.push(`
        <div class="p-2 bg-orange-950/40 border border-orange-900/60 rounded-lg flex items-start gap-2">
          <span class="text-orange-400 font-bold shrink-0">⏳</span>
          <div>
            <strong class="text-orange-300 font-mono text-[11px]">Storage Limitation Violation:</strong>
            <p class="text-slate-400 text-[11px]">GDPR Art. 5(1)(e): Storing telemetry indefinitely without justification breaches purpose limitation.</p>
          </div>
        </div>
      `);
    }

    if (items.length === 0) {
      items.push(`
        <div class="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-lg flex items-start gap-2">
          <span class="text-emerald-400 font-bold shrink-0">✅</span>
          <div>
            <strong class="text-emerald-300 font-mono text-[11px]">PbD Heuristics Upheld:</strong>
            <p class="text-slate-400 text-[11px]">Zero non-consensual tracking. System satisfies Nielsen Heuristic #1 (Visibility of System Status) and Ann Cavoukian Principle 2 (Privacy as Default).</p>
          </div>
        </div>
      `);
    }

    listEl.innerHTML = items.join('');
  }
}
