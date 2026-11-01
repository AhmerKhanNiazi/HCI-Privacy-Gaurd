// Scratch test to verify RomanUrduAICopilot phonetic normalization & offline matching
const fs = require('fs');

global.localStorage = {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null
};
global.document = {
  createElement: () => ({ appendChild: () => {}, setAttribute: () => {}, className: '' }),
  body: { appendChild: () => {} },
  getElementById: () => null
};
global.window = {
  addEventListener: () => {}
};

const fileContent = fs.readFileSync('js/modules/urdu-ai-copilot.js', 'utf8');

// Quick extraction of normalizePhoneticQuery and offlineKnowledgeBase
class MockCopilot {
  constructor() {
    eval(fileContent.replace('export class RomanUrduAICopilot', 'this.extractedClass = class RomanUrduAICopilot'));
    this.instance = new this.extractedClass({ app: {} });
  }
}

try {
  const copilot = new MockCopilot().instance;

  console.log(`[TEST] Total Offline Knowledge Rules: ${copilot.offlineKnowledgeBase.length}`);

  const testQueries = [
    // Scrolling
    { query: 'website me skrol down kro bhai', expectedAction: 'scroll-down' },
    { query: 'thoda oopar jao scroll up', expectedAction: 'scroll-up' },
    { query: 'shuru me jao top pe', expectedAction: 'scroll-top' },
    { query: 'aakhir me jao footer bottom', expectedAction: 'scroll-bottom' },

    // Trackers & Scans
    { query: 'saare trakers bluk krdo', expectedAction: 'block-trackers' },
    { query: 'skan chalao jaldi', expectedAction: 'start-audit' },
    { query: 'tez scan karo 60x', expectedAction: 'fast-scan' },

    // Cookies
    { query: 'coki trap me phanso', expectedAction: 'sim-accept-trap' },
    { query: 'rijact all trackers 1 click', expectedAction: 'sim-reject-ethical' },
    { query: 'roach motel sliders setting kholo', expectedAction: 'sim-open-settings' },
    { query: 'confirmshem guilt line dikhao', expectedAction: 'sim-confirmshame' },
    { query: 'simulator reset saaf karo', expectedAction: 'sim-reset' },

    // Risk Meter
    { query: 'strict preset 0 risk score', expectedAction: 'calc-preset-strict' },
    { query: 'social preset 100 risk score', expectedAction: 'calc-preset-social' },
    { query: 'camra face biometric toggle karo', expectedAction: 'calc-toggle-biometric' },
    { query: 'lacation gps tracker toggle karo', expectedAction: 'calc-toggle-location' },
    { query: 'mic background audio sensor toggle karo', expectedAction: 'calc-toggle-audio' },

    // AI & PII
    { query: 'daktar medical sample dikhao', expectedAction: 'ai-sample-medical' },
    { query: 'pasword secret api key sample dikhao', expectedAction: 'ai-sample-key' },

    // Retention Slider
    { query: 'retention ephemeral karo', expectedAction: 'calc-retention-0' },
    { query: 'retention 30 days karo', expectedAction: 'calc-retention-1' },
    { query: 'retention ek saal karo', expectedAction: 'calc-retention-2' },
    { query: 'retention 5 years karo', expectedAction: 'calc-retention-3' },
    { query: 'retention permanent karo', expectedAction: 'calc-retention-4' },

    // Section Scrolling
    { query: 'simulator pe jao', expectedAction: 'scroll-simulator' },
    { query: 'calculator pe jao', expectedAction: 'scroll-calculator' },
    { query: 'ai matrix pe jao', expectedAction: 'scroll-aimatrix' },
    { query: 'theory pe jao', expectedAction: 'scroll-theory' },

    // Tour Controls
    { query: 'tour agla step', expectedAction: 'tour-next' },
    { query: 'tour pichla step', expectedAction: 'tour-prev' },
    { query: 'tour band karo', expectedAction: 'tour-stop' },

    // Telemetry Drawer & Sound
    { query: 'inspector drawer', expectedAction: 'open-inspector' },
    { query: 'inspector band karo', expectedAction: 'close-inspector' },
    { query: 'tracker inject karo', expectedAction: 'inject-tracker' },
    { query: 'breach simulate karo', expectedAction: 'simulate-breach' },
    { query: 'telemetry reset karo', expectedAction: 'reset-telemetry' },
    { query: 'sound mute karo', expectedAction: 'mute-sound' },
    { query: 'sound unmute karo', expectedAction: 'unmute-sound' },
    { query: 'examiner mode toggle karo', expectedAction: 'toggle-examiner-mode' },

    // Viva Dossier Tabs
    { query: 'brignull patterns tab', expectedAction: 'dossier-tab-patterns' },
    { query: 'cavoukian 7 principles tab', expectedAction: 'dossier-tab-pbd' },
    { query: 'heuristics tab kholo', expectedAction: 'dossier-tab-heuristics' },
    { query: 'viva questions tab kholo', expectedAction: 'dossier-tab-viva' },

    // Explanations & Theory
    { query: 'honest transparent banner samjhao', expectedAction: 'sim-reject-ethical' },
    { query: 'transparent banner samjhao', expectedAction: 'sim-reject-ethical' },
    { query: 'sneaky banner samjhao', expectedAction: 'sim-accept-trap' },
    { query: 'camera face scanning samjhao', expectedAction: 'calc-toggle-biometric' },
    { query: 'exact gps location samjhao', expectedAction: 'calc-toggle-location' },
    { query: 'background microphone listening samjhao', expectedAction: 'calc-toggle-audio' },
    { query: 'selling personal data to brokers samjhao', expectedAction: 'calc-toggle-brokerage' },
    { query: 'secret device fingerprint id samjhao', expectedAction: 'calc-toggle-fingerprint' },
    { query: 'train future ai on your chats samjhao', expectedAction: 'ai-toggle-training' },
    { query: 'human workers reading your chats samjhao', expectedAction: 'ai-toggle-human' },
    { query: 'hide passwords and private details samjhao', expectedAction: 'ai-toggle-diffprivacy' },
    { query: 'auto delete history when you leave samjhao', expectedAction: 'ai-toggle-ephemeral' },
    { query: 'live ai prompt privacy tester samjhao', expectedAction: 'ai-sample-medical' },
    { query: 'tour chalao', expectedAction: 'guided-tour' },
    { query: 'dark pattern kya hota hai samjhao', expectedAction: null },
    { query: 'roach motel kya hai batao', expectedAction: 'sim-open-settings' },
    { query: 'privacy by design kya hai', expectedAction: 'open-dossier' },
    { query: 'contextual integrity kya hai', expectedAction: 'open-dossier' },
    { query: 'ye website kis liye hai', expectedAction: null },
    { query: 'tum kaun ho', expectedAction: null }
  ];

  let passed = 0;
  for (const t of testQueries) {
    const raw = t.query;
    const norm = copilot.normalizePhoneticQuery(raw);
    const match = copilot.matchOfflineKnowledge(norm, raw);

    if (t.expectedAction !== undefined && match.action !== t.expectedAction) {
      console.error(`❌ FAILED for query: "${raw}" -> Norm: "${norm}" -> Got action: "${match.action}", Expected: "${t.expectedAction}"`);
    } else {
      passed++;
      console.log(`✅ PASSED: "${raw}" => Action: "${match.action}"`);
    }
  }

  console.log(`\n🎉 Results: ${passed}/${testQueries.length} tests passed successfully!`);
  if (passed === testQueries.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
} catch (err) {
  console.error('Fatal error during test:', err);
  process.exit(1);
}
