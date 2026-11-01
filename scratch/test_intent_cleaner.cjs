// Test new topic matching with "samjhao", "batao", etc.
const testRules = [
  {
    patterns: [
      'honest transparent banner', 'honest banner', 'transparent banner',
      'ethical banner', 'hara box', 'green box', 'honest design'
    ],
    action: 'sim-reject-ethical',
    reply: 'Yeh Honest & Transparent Banner (Hara Box) hai! Isme basic security ke siwa tamam tracking cookies by-default OFF hoti hain aur 1-Click reject milta hai.'
  },
  {
    patterns: [
      'sneaky banner', 'dark pattern banner', 'predatory banner',
      'lal box', 'red box', 'sneaky design', 'dhoka banner'
    ],
    action: 'sim-accept-trap',
    reply: 'Yeh Sneaky Banner (Lal Box) hai! Isme 427 ad trackers pre-selected hote hain aur Accept button bara banaya gaya hota hai.'
  },
  {
    patterns: [
      'tour', 'guided tour', 'tour chalao', 'tour dikhao', 'walkthrough'
    ],
    action: 'guided-tour',
    reply: 'Guided tour shuru horaha hai.'
  }
];

function cleanIntent(query) {
  let q = query.toLowerCase().trim();
  // Remove intent wrappers
  q = q.replace(/\b(samjhao|samjha|samjhayein|batao|bata|batayein|kya hai|kya hota hai|explain|details|detail|info|information)\b/g, ' ');
  q = q.replace(/\s+/g, ' ').trim();
  return q;
}

function match(raw) {
  const cleaned = cleanIntent(raw);
  const q1 = ` ${raw.toLowerCase()} `;
  const q2 = ` ${cleaned} `;

  let best = null;
  let maxLen = 0;

  for (const item of testRules) {
    for (const pat of item.patterns) {
      const p = ` ${pat} `;
      if (q1.includes(p) || q2.includes(p) || q2 === pat) {
        if (pat.length > maxLen) {
          maxLen = pat.length;
          best = item;
        }
      }
    }
  }

  return best;
}

console.log('Test 1: "honest transparent banner samjhao":', match('honest transparent banner samjhao')?.action);
console.log('Test 2: "transparent banner samjhao":', match('transparent banner samjhao')?.action);
console.log('Test 3: "sneaky banner kya hai":', match('sneaky banner kya hai')?.action);
console.log('Test 4: "tour chalao":', match('tour chalao')?.action);
