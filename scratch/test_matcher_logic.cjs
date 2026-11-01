// Test improved matcher
const rules = [
  { patterns: ['scroll top', 'top pe jao', 'shuru me jao', 'top karo', 'header me jao', 'start me jao'], action: 'scroll-top' },
  { patterns: ['scroll bottom', 'footer me jao', 'aakhir me jao', 'bottom karo', 'end me jao'], action: 'scroll-bottom' },
  { patterns: ['scroll up', 'scroll upar', 'upar jao', 'upar karo', 'page up', 'upar'], action: 'scroll-up' },
  { patterns: ['scroll down', 'scroll neeche', 'neeche jao', 'neeche karo', 'page down', 'neeche'], action: 'scroll-down' },
  { patterns: ['fast scan', '60x', 'tez scan', 'jaldi scan'], action: 'fast-scan' },
  { patterns: ['scan chalao', 'start audit', 'privacy scan', 'start scan', 'audit', 'scan', 'inspection', 'data leak'], action: 'start-audit' },
  { patterns: ['trackers roko', 'block trackers', 'block all', 'tracker block', 'tracker rok', 'trackers band', 'trackers', 'tracker'], action: 'block-trackers' },
  { patterns: ['reject all', 'reject karo', '1-click reject', 'ethical reject', 'saaf reject', 'reject optional', 'reject'], action: 'sim-reject-ethical' },
  { patterns: ['trap me phanso', 'fall in trap', 'accept all', 'trap test', 'phanso', 'trap trigger', 'accept trap', 'trap'], action: 'sim-accept-trap' },
  { patterns: ['roach motel', 'roach motel kya hai', 'settings kholo', 'preferences', 'sliders', 'option dikhao'], action: 'sim-open-settings' },
  { patterns: ['confirmshaming kya hai', 'confirmshame', 'shame', 'guilt', 'emotional guilt', 'shame button'], action: 'sim-confirmshame' },
  { patterns: ['reset simulator', 'simulator reset', 'shuru jesa karo', 'clear simulator', 'reset', 'clear', 'saaf karo'], action: 'sim-reset' },
  { patterns: ['strict preset', 'safe preset', '0 risk', '0 score', 'khatra khatam karo', 'preset strict', 'strict'], action: 'calc-preset-strict' },
  { patterns: ['social preset', 'danger preset', '100 risk', '100 score', 'khatra barhao', 'preset social', 'social'], action: 'calc-preset-social' },
  { patterns: ['biometric', 'camera', 'chehra', 'face profiling', 'camra'], action: 'calc-toggle-biometric' },
  { patterns: ['location', 'gps', 'jaga', 'triangulation', 'location sensor'], action: 'calc-toggle-location' },
  { patterns: ['audio sensor', 'mic sensor', 'awaz sensor', 'ambient microphone', 'continuous audio'], action: 'calc-toggle-audio' },
  { patterns: ['data broker', 'broker', 'data bechna', 'selling data'], action: 'calc-toggle-brokerage' },
  { patterns: ['fingerprint', 'canvas fingerprint', 'secret id'], action: 'calc-toggle-fingerprint' },
  { patterns: ['risk check karo', 'risk calculator kya hai', 'risk score', 'risk meter', 'khatra check'], action: 'show-risk' },
  { patterns: ['medical sample', 'doctor prompt', 'patient sample', 'health prompt', 'medical report'], action: 'ai-sample-medical' },
  { patterns: ['password sample', 'secret key', 'api key', 'token sample', 'key sample'], action: 'ai-sample-key' },
  { patterns: ['ethical ai', 'ai consent', 'ai matrix', 'ai privacy', 'llm consent'], action: 'show-consent' },
  { patterns: ['privacy by design kya hai', 'pbd kya hai', 'ann cavoukian'], action: 'open-dossier' },
  { patterns: ['contextual integrity kya hai', 'helen nissenbaum'], action: 'open-dossier' },
  { patterns: ['ye website kis liye hai', 'ye project kya hai', 'privacyguard kya hai', 'website samjhao'], action: null },
  { patterns: ['dark pattern kya hai', 'dark pattern kya hota hai', 'deceptive pattern'], action: null }
];

function matchKnowledge(q) {
  const padded = ` ${q.toLowerCase()} `;
  
  // Sort candidates by match length descending so longer/more specific phrases take precedence!
  let bestMatch = null;
  let maxLen = 0;

  for (const item of rules) {
    for (const pat of item.patterns) {
      // Regex with word boundaries for short words, or includes with padding
      const escaped = pat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i');
      if (regex.test(padded) || padded.includes(` ${pat} `)) {
        if (pat.length > maxLen) {
          maxLen = pat.length;
          bestMatch = item;
        }
      }
    }
  }

  return bestMatch;
}

const tests = [
  { q: 'website me scroll down kro bhai', a: 'scroll-down' },
  { q: 'thoda oopar jao scroll up', a: 'scroll-up' },
  { q: 'shuru me jao top pe', a: 'scroll-top' },
  { q: 'aakhir me jao footer bottom', a: 'scroll-bottom' },
  { q: 'saare trackers block krdo', a: 'block-trackers' },
  { q: 'scan chalao jaldi', a: 'start-audit' },
  { q: 'tez scan karo 60x', a: 'fast-scan' },
  { q: 'cookie trap me phanso', a: 'sim-accept-trap' },
  { q: 'reject all trackers 1 click', a: 'sim-reject-ethical' },
  { q: 'roach motel sliders setting kholo', a: 'sim-open-settings' },
  { q: 'confirmshame guilt line dikhao', a: 'sim-confirmshame' },
  { q: 'simulator reset saaf karo', a: 'sim-reset' },
  { q: 'strict preset 0 risk score', a: 'calc-preset-strict' },
  { q: 'social preset 100 risk score', a: 'calc-preset-social' },
  { q: 'camra face biometric toggle karo', a: 'calc-toggle-biometric' },
  { q: 'location gps tracker toggle karo', a: 'calc-toggle-location' },
  { q: 'ambient microphone continuous audio toggle karo', a: 'calc-toggle-audio' },
  { q: 'doctor medical sample dikhao', a: 'ai-sample-medical' },
  { q: 'secret api key sample dikhao', a: 'ai-sample-key' },
  { q: 'dark pattern kya hota hai samjhao', a: null },
  { q: 'roach motel kya hai batao', a: 'sim-open-settings' },
  { q: 'privacy by design kya hai', a: 'open-dossier' },
  { q: 'contextual integrity kya hai', a: 'open-dossier' },
  { q: 'ye website kis liye hai', a: null }
];

let pass = 0;
for (const t of tests) {
  const m = matchKnowledge(t.q);
  const act = m ? m.action : 'NO_MATCH';
  if (act === t.a) {
    pass++;
    console.log(`✅ "${t.q}" -> ${act}`);
  } else {
    console.error(`❌ "${t.q}" -> got: ${act}, expected: ${t.a}`);
  }
}

console.log(`Pass: ${pass}/${tests.length}`);
