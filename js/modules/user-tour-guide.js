/**
 * PrivacyGuard UX - UserTourGuide Module (Beginner-Friendly Onboarding & Bilingual Guide)
 * 
 * Provides:
 * - 30-Second Interactive Guided Tour with smooth step-by-step scrolling
 * - Floating interactive guide HUD with live action triggers (Cookie Trap, Risk Meter, Safe AI)
 * - Bilingual Language Switcher (English vs. Roman Urdu / آسان اردو)
 * - Zero external library dependencies, WCAG AAA accessible
 */

export class UserTourGuide {
  constructor(options = {}) {
    this.app = options.app || null;
    this.audio = options.audio || null;
    this.accessibility = options.accessibility || null;

    this.currentStep = 0;
    this.isActive = false;
    this.language = localStorage.getItem('privacyguard_lang') || 'en';

    this.tourOverlay = null;

    this.steps = [
      {
        id: 'cookie-sim',
        targetId: 'simulator-section',
        highlightId: 'simulator-container',
        titleEn: 'Step 1: The Sneaky Cookie Trap 🍪',
        titleUr: 'مرحلہ 1: کوکی ٹریپ اور دھوکے باز ڈیزائن 🍪',
        textEn: 'Look at the Red Box on the left! Websites make "Accept All" big and shiny so you unknowingly accept 427 ad trackers. Now look at the Green Box: an honest site gives you a clear 1-click "Reject All" button.',
        textUr: 'بائیں طرف لال باکس دیکھیں! ویب سائٹس "Accept" کا بٹن بڑا اور چمکدار بناتی ہیں تاکہ آپ سے 427 ٹریکرز کا ڈیٹا لے لیں۔ دائیں طرف ہرا باکس دیکھیں: ایماندارانہ ڈیزائن میں 1 کلک میں "Reject All" کا آپشن ہوتا ہے۔',
        actionLabelEn: '🔴 Try Falling into Trap',
        actionLabelUr: '🔴 دھوکے باز ٹریپ ٹیسٹ کریں',
        actionCmd: 'sim-accept-trap',
        actionSecondaryLabelEn: '🟢 Try Honest Reject',
        actionSecondaryLabelUr: '🟢 1-کلک ریجیکٹ کریں',
        actionSecondaryCmd: 'sim-reject-ethical'
      },
      {
        id: 'risk-meter',
        targetId: 'calculator-section',
        highlightId: 'calculator-container',
        titleEn: 'Step 2: Live Privacy Risk Meter 📊',
        titleUr: 'مرحلہ 2: لائیو پرائیویسی رسک میٹر 📊',
        textEn: 'Every time an app accesses your Camera, Microphone, or GPS location, your risk score shoots up! Watch this live speedometer gauge change when you switch between Safe and High-Risk profiles.',
        textUr: 'جب بھی کوئی ایپ آپ کا کیمرہ، مائیکروفون یا جی پی ایس لوکیشن لیتی ہے تو آپ کا رسک بڑھ جاتا ہے۔ اس لائیو میٹر میں دیکھیں کہ محفوظ (Safe) اور خطرناک (Dangerous) موڈ میں اسکور کیسے بدلتا ہے۔',
        actionLabelEn: '🛡️ Set to 100% Safe (0/100)',
        actionLabelUr: '🛡️ محفوظ موڈ (0 اسکور)',
        actionCmd: 'calc-preset-strict',
        actionSecondaryLabelEn: '⚠️ Set to High Risk (100/100)',
        actionSecondaryLabelUr: '⚠️ خطرناک موڈ (100 اسکور)',
        actionSecondaryCmd: 'calc-preset-social'
      },
      {
        id: 'ai-matrix',
        targetId: 'ai-matrix-section',
        highlightId: 'ai-matrix-container',
        titleEn: 'Step 3: Private AI Chat Sandbox 🤖',
        titleUr: 'مرحلہ 3: محفوظ اے آئی چیٹ اور ڈیٹا ماسکنگ 🤖',
        textEn: 'When chatting with AI chatbots, users often accidentally leak sensitive passwords or health data. Test typing or click below: PrivacyGuard redacts your secrets locally BEFORE sending!',
        textUr: 'اے آئی (ChatGPT وغیرہ) سے بات کرتے وقت لوگ نادانستہ طور پر پاس ورڈ یا میڈیکل ڈیٹا شیئر کر دیتے ہیں۔ ٹیسٹ کریں کہ پرائیویسی گارڈ کیسے آپ کے حساس ڈیٹا کو بھیجنے سے پہلے خودکار طریقے سے ماسک کرتا ہے۔',
        actionLabelEn: '🧪 Test Medical Data Redaction',
        actionLabelUr: '🧪 میڈیکل ڈیٹا ماسکنگ ٹیسٹ',
        actionCmd: 'ai-sample-medical',
        actionSecondaryLabelEn: '🔑 Test API Key Masking',
        actionSecondaryLabelUr: '🔑 سیکرٹ پاس ورڈ ماسکنگ ٹیسٹ',
        actionSecondaryCmd: 'ai-sample-key'
      },
      {
        id: 'hands-free',
        targetId: 'main-content',
        highlightId: 'header-mic-btn',
        titleEn: 'Step 4: Hands-Free Voice & 1-Key Control 🎙️',
        titleUr: 'مرحلہ 4: بغیر ہاتھ لگائے آواز اور 1 بٹن سے کنٹرول 🎙️',
        textEn: 'Blind or motor-impaired? You don\'t even need a mouse! Press key "V" to speak commands like "Block trackers" or "Start scan", or press "P" for instant scan. The system talks back to confirm!',
        textUr: 'اگر کسی کو دیکھنے یا ماؤس چلانے میں دشواری ہو، تو وہ بغیر ہاتھ لگائے صرف بول کر (جیسے "Block trackers") یا کی بورڈ کا صرف 1 بٹن (V یا P) دبا کر پورا سسٹم چلا سکتا ہے!',
        actionLabelEn: '🎤 Turn On Voice Mic (V)',
        actionLabelUr: '🎤 مائیکروفون آن کریں (V)',
        actionCmd: 'toggle-voice',
        actionSecondaryLabelEn: '📋 View All 35+ Voice Commands',
        actionSecondaryLabelUr: '📋 تمام 35 وائس کمانڈز دیکھیں',
        actionSecondaryCmd: 'open-help'
      }
    ];

    this.init();
  }

  init() {
    this.injectTourUI();
    this.attachQuickStartEvents();
    this.applyLanguage();
  }

  injectTourUI() {
    const card = document.createElement('div');
    card.id = 'interactive-tour-hud';
    card.className = 'fixed bottom-5 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 bg-slate-950/95 border-2 border-cyan-400 rounded-2xl shadow-2xl p-4 sm:p-5 hidden transition-all duration-300 backdrop-blur-xl';
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', 'Interactive Guided Tour');

    card.innerHTML = `
      <div class="space-y-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span id="tour-step-badge" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              Step 1 of 4
            </span>
            <span class="text-[10px] text-slate-400 font-mono">Quick Interactive Tour</span>
          </div>
          <button id="close-tour-hud-btn" class="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition" aria-label="Close tour">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Content -->
        <div>
          <h4 id="tour-step-title" class="text-sm font-bold text-white font-mono flex items-center gap-1.5"></h4>
          <p id="tour-step-desc" class="text-xs text-slate-300 mt-1.5 leading-relaxed"></p>
        </div>

        <!-- Live Trigger Buttons -->
        <div class="pt-1 flex flex-col gap-1.5">
          <button id="tour-action-btn" type="button" class="w-full py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/40">
          </button>
          <button id="tour-action-sec-btn" type="button" class="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-mono font-medium transition flex items-center justify-center gap-1.5">
          </button>
        </div>

        <!-- Navigation Footer -->
        <div class="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs font-mono">
          <button id="tour-prev-btn" class="px-2.5 py-1 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition disabled:opacity-40">
            ← Prev
          </button>
          <div class="flex items-center gap-1" id="tour-dots-indicator"></div>
          <button id="tour-next-btn" class="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg font-bold transition">
            Next →
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(card);
    this.tourOverlay = card;

    // Attach listeners
    card.querySelector('#close-tour-hud-btn')?.addEventListener('click', () => this.stopTour());
    card.querySelector('#tour-prev-btn')?.addEventListener('click', () => this.prevStep());
    card.querySelector('#tour-next-btn')?.addEventListener('click', () => this.nextStep());

    card.querySelector('#tour-action-btn')?.addEventListener('click', () => {
      const step = this.steps[this.currentStep];
      if (step?.actionCmd) this.dispatchCommand(step.actionCmd);
    });

    card.querySelector('#tour-action-sec-btn')?.addEventListener('click', () => {
      const step = this.steps[this.currentStep];
      if (step?.actionSecondaryCmd) this.dispatchCommand(step.actionSecondaryCmd);
    });
  }

  attachQuickStartEvents() {
    // Quick Tour Launch Buttons
    document.querySelectorAll('[data-start-tour]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.startTour(0);
      });
    });

    // Language Toggle Buttons
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    langToggleBtn?.addEventListener('click', () => {
      this.toggleLanguage();
    });

    // Quick-Start Interactive Playground Action Buttons
    document.querySelectorAll('[data-quick-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.getAttribute('data-quick-action');
        if (action) this.dispatchCommand(action);
      });
    });
  }

  toggleLanguage() {
    this.language = (this.language === 'en') ? 'ur' : 'en';
    localStorage.setItem('privacyguard_lang', this.language);
    this.applyLanguage();
    if (this.isActive) this.renderStep(this.currentStep);
    if (this.audio) this.audio.playClick();
  }

  applyLanguage() {
    const isUr = this.language === 'ur';

    // Update toggle button text
    const langBtnText = document.getElementById('lang-toggle-text');
    if (langBtnText) {
      langBtnText.textContent = isUr ? '🇵🇰 اردو (Urdu Active)' : '🇺🇸 English Active';
    }

    // Toggle all data-lang elements
    document.querySelectorAll('[data-lang-en]').forEach(el => {
      const enText = el.getAttribute('data-lang-en');
      const urText = el.getAttribute('data-lang-ur');
      if (isUr && urText) {
        el.textContent = urText;
      } else if (enText) {
        el.textContent = enText;
      }
    });
  }

  startTour(startIndex = 0) {
    this.isActive = true;
    this.currentStep = startIndex;
    if (this.tourOverlay) {
      this.tourOverlay.classList.remove('hidden');
    }
    this.renderStep(this.currentStep);
    if (this.accessibility) {
      this.accessibility.announcePolite('Interactive guided tour started. Step 1 of 4.');
    }
    if (this.audio) this.audio.playChirp(true);
  }

  stopTour() {
    this.isActive = false;
    if (this.tourOverlay) {
      this.tourOverlay.classList.add('hidden');
    }
    // Remove all highlight rings
    document.querySelectorAll('.tour-focus-ring').forEach(el => {
      el.classList.remove('tour-focus-ring', 'ring-4', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-slate-950');
    });
    if (this.accessibility) {
      this.accessibility.announcePolite('Guided tour closed.');
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.renderStep(this.currentStep);
      if (this.audio) this.audio.playClick();
    } else {
      this.finishTour();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep(this.currentStep);
      if (this.audio) this.audio.playClick();
    }
  }

  renderStep(index) {
    const step = this.steps[index];
    if (!step || !this.tourOverlay) return;

    const isUr = this.language === 'ur';

    // Update Step Badge
    const badge = this.tourOverlay.querySelector('#tour-step-badge');
    if (badge) badge.textContent = `Step ${index + 1} of ${this.steps.length}`;

    // Update Title & Text
    const titleEl = this.tourOverlay.querySelector('#tour-step-title');
    const descEl = this.tourOverlay.querySelector('#tour-step-desc');
    if (titleEl) titleEl.textContent = isUr ? step.titleUr : step.titleEn;
    if (descEl) descEl.textContent = isUr ? step.textUr : step.textEn;

    // Update Action Buttons
    const actionBtn = this.tourOverlay.querySelector('#tour-action-btn');
    const actionSecBtn = this.tourOverlay.querySelector('#tour-action-sec-btn');
    if (actionBtn) {
      actionBtn.textContent = isUr ? step.actionLabelUr : step.actionLabelEn;
    }
    if (actionSecBtn) {
      actionSecBtn.textContent = isUr ? step.actionSecondaryLabelUr : step.actionSecondaryLabelEn;
    }

    // Update Prev / Next Buttons
    const prevBtn = this.tourOverlay.querySelector('#tour-prev-btn');
    const nextBtn = this.tourOverlay.querySelector('#tour-next-btn');
    if (prevBtn) prevBtn.disabled = (index === 0);
    if (nextBtn) {
      nextBtn.textContent = (index === this.steps.length - 1) ? 'Finish Tour 🎉' : 'Next →';
    }

    // Update Dots Indicator
    const dotsContainer = this.tourOverlay.querySelector('#tour-dots-indicator');
    if (dotsContainer) {
      dotsContainer.innerHTML = this.steps.map((_, i) => `
        <span class="w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-cyan-400' : 'bg-slate-700'}"></span>
      `).join('');
    }

    // Smooth Scroll to Target Section & Highlight
    const targetEl = document.getElementById(step.targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Add Highlight Ring to element
    document.querySelectorAll('.tour-focus-ring').forEach(el => {
      el.classList.remove('tour-focus-ring', 'ring-4', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-slate-950');
    });

    const highlightEl = document.getElementById(step.highlightId);
    if (highlightEl) {
      highlightEl.classList.add('tour-focus-ring', 'ring-4', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-slate-950');
      setTimeout(() => {
        highlightEl.classList.remove('ring-4', 'ring-cyan-400', 'ring-offset-4', 'ring-offset-slate-950');
      }, 3500);
    }
  }

  finishTour() {
    this.stopTour();
    if (this.accessibility) {
      this.accessibility.announceAssertive('Tour finished! You are ready to explore PrivacyGuard UX.');
    }
    if (this.audio) {
      if (typeof this.audio.playFanfare === 'function') {
        this.audio.playFanfare();
      } else if (typeof this.audio.playCompletionFanfare === 'function') {
        this.audio.playCompletionFanfare();
      }
    }
  }

  dispatchCommand(commandId) {
    if (!commandId) return;

    if (commandId === 'toggle-voice') {
      this.app?.voiceSystem?.toggleListening();
      return;
    }

    if (commandId === 'open-help') {
      this.app?.accessibility?.openHelpModal();
      return;
    }

    if (commandId === 'ai-sample-medical') {
      this.app?.handleVoiceCommand('sample-medical');
      return;
    }

    if (commandId === 'ai-sample-key') {
      this.app?.handleVoiceCommand('sample-key');
      return;
    }

    // Pass directly to app voice/action router
    if (this.app && typeof this.app.handleVoiceCommand === 'function') {
      this.app.handleVoiceCommand(commandId);
    }
  }
}
