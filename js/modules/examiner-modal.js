/**
 * PrivacyGuard UX - Feature 4: Educator / Examiner Explainer Mode
 * 
 * Demonstrates:
 * - Harry Brignull's Deceptive Patterns Taxonomy
 * - Ann Cavoukian's 7 Privacy by Design (PbD) Principles
 * - Jakob Nielsen's Usability Heuristics
 * - Regulatory Standards (GDPR Art. 7, EDPB 05/2020, EU AI Act)
 * - Examiner Viva / Presentation Defense Mode
 */

import { HCI_KNOWLEDGE_BASE } from '../data/hci-ethics-data.js';

export class ExaminerModal {
  constructor() {
    this.modalEl = null;
    this.activeTab = 'taxonomies';
    this.isOpen = false;
  }

  init() {
    this.injectModalMarkup();
    this.attachEventListeners();
  }

  injectModalMarkup() {
    // Create modal container in body
    const modalDiv = document.createElement('div');
    modalDiv.id = 'examiner-modal-container';
    modalDiv.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 modal-backdrop hidden transition-opacity duration-300';
    
    modalDiv.innerHTML = `
      <div class="cyber-card rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 overflow-hidden bg-slate-950">
        
        <!-- Modal Top Bar -->
        <div class="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base md:text-lg font-bold text-white">HCI Code & Ethics Explainer</h3>
                <span class="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Examiner Viva Dossier
                </span>
              </div>
              <p class="text-xs text-slate-400">Academic theory, heuristics taxonomy, and regulatory references for viva evaluation.</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button id="modal-print-btn" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition" title="Print Academic Summary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            </button>
            <button id="modal-close-btn" class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Academic Tabs Navigation -->
        <div class="flex border-b border-slate-800 bg-slate-900/40 px-4 md:px-5 overflow-x-auto text-xs font-mono">
          <button class="modal-tab-btn py-3 px-3 border-b-2 border-cyan-500 text-cyan-400 font-semibold flex items-center gap-1.5 whitespace-nowrap" data-tab="taxonomies">
            <span>😈 Deceptive Patterns</span>
          </button>
          <button class="modal-tab-btn py-3 px-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1.5 whitespace-nowrap" data-tab="pbd">
            <span>🛡️ 7 Principles of PbD</span>
          </button>
          <button class="modal-tab-btn py-3 px-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1.5 whitespace-nowrap" data-tab="heuristics">
            <span>📐 Nielsen Usability Heuristics</span>
          </button>
          <button class="modal-tab-btn py-3 px-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1.5 whitespace-nowrap" data-tab="viva-qa">
            <span>🎓 Examiner Viva Q&A</span>
          </button>
        </div>

        <!-- Modal Body Content (Scrollable) -->
        <div id="modal-body-content" class="p-5 md:p-6 overflow-y-auto space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed max-h-[60vh]">
          <!-- Populated dynamically via JS -->
        </div>

        <!-- Modal Footer -->
        <div class="p-3 md:p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>HCI Topic 12 & Topic 5 Research Reference</span>
          <button id="modal-bottom-close-btn" class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition">
            Close Explainer
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modalDiv);
    this.modalEl = modalDiv;
  }

  attachEventListeners() {
    // Close button
    document.getElementById('modal-close-btn')?.addEventListener('click', () => this.hide());
    document.getElementById('modal-bottom-close-btn')?.addEventListener('click', () => this.hide());
    
    // Background click to close
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.hide();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modalEl?.classList.contains('hidden')) {
        this.hide();
      }
    });

    // Print button
    document.getElementById('modal-print-btn')?.addEventListener('click', () => {
      window.print();
    });

    // Tab buttons
    this.modalEl?.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  }

  show(target = null) {
    if (!this.modalEl) return;
    this.isOpen = true;
    this.modalEl.classList.remove('hidden');

    const validTabs = ['taxonomies', 'pbd', 'heuristics', 'viva-qa'];
    if (validTabs.includes(target)) {
      this.switchTab(target);
    } else if (target) {
      this.switchTab('taxonomies', target);
    } else {
      this.switchTab(this.activeTab);
    }
  }

  hide() {
    if (!this.modalEl) return;
    this.isOpen = false;
    this.modalEl.classList.add('hidden');
  }

  switchTab(tabName, highlightPatternId = null) {
    this.activeTab = tabName;

    // Update tab bar styles
    this.modalEl?.querySelectorAll('.modal-tab-btn').forEach(btn => {
      const match = btn.getAttribute('data-tab') === tabName;
      btn.className = match
        ? 'modal-tab-btn py-3 px-3 border-b-2 border-cyan-500 text-cyan-400 font-semibold flex items-center gap-1.5 whitespace-nowrap'
        : 'modal-tab-btn py-3 px-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1.5 whitespace-nowrap';
    });

    // Render Tab Content
    const container = document.getElementById('modal-body-content');
    if (!container) return;

    if (tabName === 'taxonomies') {
      this.renderTaxonomiesTab(highlightPatternId);
    } else if (tabName === 'pbd') {
      this.renderPbDTab();
    } else if (tabName === 'heuristics') {
      this.renderHeuristicsTab();
    } else if (tabName === 'viva-qa') {
      this.renderVivaQATab();
    }
  }

  renderTaxonomiesTab(highlightPatternId = null) {
    const container = document.getElementById('modal-body-content');
    if (!container) return;

    const cardsHtml = HCI_KNOWLEDGE_BASE.darkPatterns.map(dp => {
      const isHighlighted = highlightPatternId === dp.id;
      return `
        <div id="pattern-card-${dp.id}" class="p-4 rounded-xl border ${isHighlighted ? 'border-rose-500 bg-rose-950/40 glow-rose' : 'border-slate-800 bg-slate-900/60'} space-y-2 transition-all">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-white">${dp.name}</span>
              <span class="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-950 text-rose-300 border border-rose-800">
                ${dp.category}
              </span>
            </div>
            ${isHighlighted ? '<span class="text-xs font-mono font-bold text-rose-400 animate-pulse">🎯 Inspected Element</span>' : ''}
          </div>

          <p class="text-xs text-slate-300">
            <strong>Academic Definition:</strong> ${dp.academicDefinition}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
            <div class="p-2 rounded bg-slate-950 border border-slate-800">
              <span class="text-rose-400 block font-semibold">Violation:</span>
              <span class="text-slate-400">${dp.violatedHeuristic}</span>
            </div>
            <div class="p-2 rounded bg-slate-950 border border-slate-800">
              <span class="text-emerald-400 block font-semibold">Ethical Countermeasure:</span>
              <span class="text-slate-400">${dp.counterMeasure}</span>
            </div>
          </div>

          <div class="text-[10px] font-mono text-cyan-400 pt-1">
            ⚖️ <strong>Regulatory Citation:</strong> ${dp.regulatoryStandard}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="space-y-4">
        <div class="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-slate-300">
          <strong class="text-cyan-300 font-mono">Harry Brignull (2010) Deceptive Patterns Taxonomy:</strong> 
          Dark patterns are user interfaces that have been deliberately designed to trick people into doing things they might not otherwise do, such as buying insurance or sharing private telemetry.
        </div>
        ${cardsHtml}
      </div>
    `;

    // Scroll to highlighted card if specified
    if (highlightPatternId) {
      setTimeout(() => {
        const target = document.getElementById(`pattern-card-${highlightPatternId}`);
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  renderPbDTab() {
    const container = document.getElementById('modal-body-content');
    if (!container) return;

    const pbdHtml = HCI_KNOWLEDGE_BASE.privacyByDesign.map(p => `
      <div class="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold text-xs flex items-center justify-center shrink-0">
            ${p.number}
          </span>
          <h4 class="text-sm font-bold text-emerald-300">${p.title}</h4>
        </div>
        <p class="text-xs text-slate-300 pl-8 leading-relaxed">${p.summary}</p>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="space-y-4">
        <div class="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-slate-300">
          <strong class="text-emerald-300 font-mono">Dr. Ann Cavoukian (2009) Privacy by Design Framework:</strong> 
          The international gold standard for privacy engineering. Adopted by the European Union into GDPR Article 25 (Data protection by design and by default).
        </div>
        ${pbdHtml}
      </div>
    `;
  }

  renderHeuristicsTab() {
    const container = document.getElementById('modal-body-content');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-4">
        <div class="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-slate-300">
          <strong class="text-cyan-300 font-mono">Jakob Nielsen’s 10 Usability Heuristics Applied to Data Ethics:</strong>
          How dark patterns subvert foundational HCI usability principles to harvest personal telemetry.
        </div>

        <div class="space-y-3">
          <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <h4 class="text-xs md:text-sm font-bold text-white flex items-center gap-2">
              <span class="text-cyan-400 font-mono">Heuristic #1:</span> Visibility of System Status
            </h4>
            <p class="text-xs text-slate-300 mt-1">
              <strong>Dark Pattern Breach:</strong> Stealth tracking in background threads without clear indicators.
              <br><strong class="text-emerald-400">Ethical Fix:</strong> Real-time Privacy Meter displaying exact active sensors and telemetry destinations.
            </p>
          </div>

          <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <h4 class="text-xs md:text-sm font-bold text-white flex items-center gap-2">
              <span class="text-cyan-400 font-mono">Heuristic #3:</span> User Control and Freedom
            </h4>
            <p class="text-xs text-slate-300 mt-1">
              <strong>Dark Pattern Breach:</strong> "Roach Motel" (Easy to enter, impossible to opt out) and missing "Reject All" button.
              <br><strong class="text-emerald-400">Ethical Fix:</strong> 1-click symmetrical opt-out and effortless withdrawal of consent (GDPR Art. 7(3)).
            </p>
          </div>

          <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <h4 class="text-xs md:text-sm font-bold text-white flex items-center gap-2">
              <span class="text-cyan-400 font-mono">Heuristic #4:</span> Consistency and Standards
            </h4>
            <p class="text-xs text-slate-300 mt-1">
              <strong>Dark Pattern Breach:</strong> Inverting standard button styling (making Reject look like disabled ghost text, or swapping colors).
              <br><strong class="text-emerald-400">Ethical Fix:</strong> Symmetrical button affordances and conventional semantic placements.
            </p>
          </div>

          <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <h4 class="text-xs md:text-sm font-bold text-white flex items-center gap-2">
              <span class="text-cyan-400 font-mono">Heuristic #8:</span> Aesthetic and Minimalist Design
            </h4>
            <p class="text-xs text-slate-300 mt-1">
              <strong>Dark Pattern Breach:</strong> Overwhelming users with 50-page legal terms and deliberately convoluted double-negative checkboxes.
              <br><strong class="text-emerald-400">Ethical Fix:</strong> Plain-English layered notices and granular, unbundled toggles.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  renderVivaQATab() {
    const container = document.getElementById('modal-body-content');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-4">
        <div class="p-3 bg-violet-950/30 border border-violet-800/40 rounded-xl text-xs text-slate-300">
          <strong class="text-violet-300 font-mono">Examiner / Teacher Viva Defense Cheat-Sheet:</strong>
          Top questions examiners frequently ask regarding HCI Topic 12 & Topic 5, along with authoritative academic answers.
        </div>

        <div class="space-y-3">
          
          <div class="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
            <h4 class="text-xs md:text-sm font-bold text-cyan-300">
              Q1: What is the technical difference between a Dark Pattern and poor usability?
            </h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              <strong>Answer:</strong> Poor usability is accidental friction caused by flawed design heuristics or lack of user testing. A <em>Dark Pattern</em> is intentional friction engineered with deliberate cognitive asymmetry to benefit the service provider at the direct expense of the user's autonomy and privacy (Harry Brignull, 2010).
            </p>
          </div>

          <div class="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
            <h4 class="text-xs md:text-sm font-bold text-cyan-300">
              Q2: How does Privacy by Design ensure "Positive-Sum, not Zero-Sum"?
            </h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              <strong>Answer:</strong> Ann Cavoukian's Principle 4 states that privacy should not be treated as a trade-off against functionality or security. In Ethical UX, users do NOT lose access to features or suffer arbitrary latency penalties simply because they refuse advertising telemetry. Both user privacy and business utility can coexist through modern techniques like differential privacy and on-device processing.
            </p>
          </div>

          <div class="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
            <h4 class="text-xs md:text-sm font-bold text-cyan-300">
              Q3: Why are pre-checked checkboxes legally invalid under GDPR?
            </h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              <strong>Answer:</strong> Under the CJEU <em>Planet49</em> ruling (Case C-673/17) and GDPR Article 4(11), valid consent requires an active, affirmative opt-in gesture. Pre-ticked boxes exploit the status-quo bias and cognitive inertia, failing the legal test of being "freely given, specific, informed, and unambiguous."
            </p>
          </div>

          <div class="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl space-y-1.5">
            <h4 class="text-xs md:text-sm font-bold text-cyan-300">
              Q4: In Topic 5 (Ethical AI), what constitutes transparent consent for model training?
            </h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              <strong>Answer:</strong> In compliance with the EU AI Act and IEEE 7000, AI systems must explicitly inform users whether their raw prompts, PII, and vector embeddings are stored or used for foundation model fine-tuning. Opting out must be a 1-click setting with zero degradation in inference capabilities.
            </p>
          </div>

        </div>
      </div>
    `;
  }
}
