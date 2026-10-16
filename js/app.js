/**
 * PrivacyGuard UX - Main Application Bootstrap & Orchestrator
 * 
 * Pair Programming HCI Architecture:
 * - Module 1: DarkPatternSimulator (Topic 12)
 * - Module 2: PrivacyRiskCalculator (Topic 12)
 * - Module 3: AIConsentMatrix (Topic 5)
 * - Module 4: ExaminerModal (Examiner Viva Mode)
 */

import { DarkPatternSimulator } from './modules/dark-pattern-sim.js';
import { PrivacyRiskCalculator } from './modules/privacy-calc.js';
import { AIConsentMatrix } from './modules/ai-consent-matrix.js';
import { ExaminerModal } from './modules/examiner-modal.js';

class PrivacyGuardApp {
  constructor() {
    this.examinerModeActive = true; // Enabled by default for easy presentation
    this.examinerModal = null;
    this.simulator = null;
    this.calculator = null;
    this.aiMatrix = null;
  }

  init() {
    // 1. Initialize Examiner Explainer Modal
    this.examinerModal = new ExaminerModal();
    this.examinerModal.init();

    // 2. Initialize Feature 1: Dark Pattern Simulator with callback to open modal
    this.simulator = new DarkPatternSimulator('simulator-container', (patternId) => {
      this.examinerModal.show(patternId);
    });
    this.simulator.init();

    // 3. Initialize Feature 2: Dynamic Privacy Risk Calculator
    this.calculator = new PrivacyRiskCalculator('calculator-container');
    this.calculator.init();

    // 4. Initialize Feature 3: Ethical AI Consent Matrix
    this.aiMatrix = new AIConsentMatrix('ai-matrix-container');
    this.aiMatrix.init();

    // 5. Global App Controls & Nav
    this.setupGlobalControls();
    this.updateExaminerHighlights();
  }

  setupGlobalControls() {
    // Global Examiner Mode Toggle in Header
    const examinerToggle = document.getElementById('global-examiner-toggle');
    examinerToggle?.addEventListener('change', (e) => {
      this.examinerModeActive = e.target.checked;
      this.updateExaminerHighlights();
    });

    // Global "HCI Theory & Viva Dossier" button
    document.getElementById('open-dossier-btn')?.addEventListener('click', () => {
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
}

// Bootstrap once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new PrivacyGuardApp();
  app.init();
  window.privacyGuardApp = app; // Expose for presentation/debugging
});
