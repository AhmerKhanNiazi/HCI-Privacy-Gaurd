/**
 * PrivacyGuard UX - HCI Academic Knowledge Base & Theoretical Reference Data
 * 
 * References & Frameworks:
 * 1. Harry Brignull (2010) - Deceptive Design Taxonomy (deceptive.design)
 * 2. Dr. Ann Cavoukian (2009) - 7 Foundational Principles of Privacy by Design (PbD)
 * 3. Jakob Nielsen (1994) - 10 Usability Heuristics for User Interface Design
 * 4. European Union GDPR - Article 4(11), Article 7 (Conditions for Consent)
 * 5. IEEE Global Initiative on Ethics of Autonomous and Intelligent Systems (Ethical AI)
 */

export const HCI_KNOWLEDGE_BASE = {
  // Topic 12: Dark Patterns Taxonomy (Harry Brignull & FTC guidelines)
  darkPatterns: [
    {
      id: "confirmshaming",
      name: "Confirmshaming",
      category: "Emotional Manipulation",
      academicDefinition: "Emotional manipulation through language that induces guilt, shame, or cognitive dissonance in the user for exercising autonomy and refusing consent or tracking.",
      violatedHeuristic: "Nielsen Heuristic #2: Match between system and the real world & Heuristic #3: User control and freedom",
      regulatoryStandard: "GDPR Art. 7(4) - Consent must be freely given without detriment or coercion.",
      counterMeasure: "Neutral, factual microcopy without judgment (e.g., 'Decline optional cookies' vs 'No, I don't care about security')."
    },
    {
      id: "visual_interference",
      name: "Visual Interference & Misdirection",
      category: "Perceptual Asymmetry",
      academicDefinition: "Using dominant visual hierarchy (color saturation, font scale, button prominence) to steer user attention toward predatory tracking while camouflaging privacy-protective choices.",
      violatedHeuristic: "Nielsen Heuristic #8: Aesthetic and minimalist design & Heuristic #4: Consistency and standards",
      regulatoryStandard: "EDPB Guidelines 05/2020: Equal prominence requirement for 'Accept' and 'Reject' actions.",
      counterMeasure: "Symmetrical visual affordance: Equal button size, contrast, and cognitive weight for Accept and Reject."
    },
    {
      id: "obstruction_friction",
      name: "Obstruction & Friction Asymmetry",
      category: "Cognitive Burden",
      academicDefinition: "Making privacy-friendly actions significantly harder to execute (requiring 5+ clicks, obscure nested submenus) than the 1-click predatory acceptance.",
      violatedHeuristic: "Nielsen Heuristic #7: Flexibility and efficiency of use & Heuristic #3: User control and freedom",
      regulatoryStandard: "GDPR Art. 7(3): 'It shall be as easy to withdraw as to give consent.'",
      counterMeasure: "1-Click Symmetrical Choice: Opting out must require zero additional clicks compared to opting in."
    },
    {
      id: "pre_selection",
      name: "Pre-selection / Default Effect",
      category: "Cognitive Bias Exploitation",
      academicDefinition: "Exploiting user inertia and status-quo bias by shipping checkboxes or toggles pre-checked in favor of aggressive surveillance and data brokers.",
      violatedHeuristic: "Nielsen Heuristic #5: Error prevention & Heuristic #1: Visibility of system status",
      regulatoryStandard: "CJEU Planet49 Ruling (C-673/17): Pre-ticked checkboxes do NOT constitute valid consent.",
      counterMeasure: "Privacy by Default (PbD Principle 2): All non-essential telemetry must default to an unselected OFF state."
    },
    {
      id: "bundled_consent",
      name: "Bundled / Forced Consent",
      category: "Take-it-or-Leave-it",
      academicDefinition: "Forcing users to accept advertising trackers and third-party data selling as a mandatory condition for basic core functionality.",
      violatedHeuristic: "Nielsen Heuristic #3: User control and freedom",
      regulatoryStandard: "GDPR Recital 43 & Art. 7(4): Consent presumed not freely given if granular choice is denied.",
      counterMeasure: "Unbundled Granular Toggles: Separate core functionality from telemetry, marketing, and cross-site profiling."
    }
  ],

  // Topic 12: Ann Cavoukian's 7 Privacy by Design (PbD) Principles
  privacyByDesign: [
    {
      number: 1,
      title: "Proactive not Reactive; Preventative not Remedial",
      summary: "Anticipate privacy breaches and invasive states before they occur, embedding ethical guardrails into design."
    },
    {
      number: 2,
      title: "Privacy as the Default Setting",
      summary: "Ensure that personal data is automatically protected in any system without requiring the user to take manual action."
    },
    {
      number: 3,
      title: "Privacy Embedded into Design",
      summary: "Privacy is an essential core component of the interface architecture, not an afterthought or superficial plugin."
    },
    {
      number: 4,
      title: "Full Functionality: Positive-Sum, not Zero-Sum",
      summary: "Accommodate all legitimate interests and reject false dichotomies (e.g., privacy vs security, privacy vs functionality)."
    },
    {
      number: 5,
      title: "End-to-End Security: Full Lifecycle Protection",
      summary: "Ensure secure collection, transit, storage, retention limits, and definitive deletion of all recorded telemetry."
    },
    {
      number: 6,
      title: "Visibility and Transparency: Keep it Open",
      summary: "Assure stakeholders that business practices and algorithmic processing operate subject to independent verification."
    },
    {
      number: 7,
      title: "Respect for User Privacy: Keep it User-Centric",
      summary: "Empower users by offering strong privacy defaults, active notice, user-friendly affordances, and timely access."
    }
  ],

  // Topic 5: Ethical AI in HCI Dimensions
  ethicalAIDimensions: [
    {
      key: "model_training",
      title: "Model Retraining Consent",
      description: "Are user prompts, private documents, and chat sessions scraped into global LLM training pipelines?",
      darkPatternBehavior: "Data quietly harvested under vague 50-page Terms of Service with zero opt-out switch.",
      ethicalUXBehavior: "Explicit opt-in prompt with transparent toggle; opting out retains 100% full model access with zero latency penalty."
    },
    {
      key: "differential_privacy",
      title: "Data Anonymization & Noise Injection",
      description: "Mathematical guarantee that personal identifiers cannot be reverse-engineered from weight updates.",
      darkPatternBehavior: "Raw PII (email, IP, queries) stored alongside vector embeddings without pseudonymization.",
      ethicalUXBehavior: "Client-side token scrubbing and differential privacy noise applied prior to AI server ingestion."
    },
    {
      key: "algorithmic_explainability",
      title: "Explainable AI (XAI) & Transparency",
      description: "Providing human-readable justification for AI profiling, confidence scores, and content filtering.",
      darkPatternBehavior: "Black-box decisions with arbitrary bans or opaque personalization parameters.",
      ethicalUXBehavior: "Live 'Why was this AI decision made?' inspector showing exact input features and weight rationale."
    },
    {
      key: "retention_right_to_forget",
      title: "Data Ephemerality & Right to Erasure",
      description: "Strict auto-deletion window for conversation caches and synthetic interaction history.",
      darkPatternBehavior: "Indefinite storage across distributed datacenters with inaccessible deletion requests.",
      ethicalUXBehavior: "Configurable ephemeral memory (Immediate / 24 Hours / 30 Days) with 1-click irreversible wipe."
    }
  ],

  // Risk Weights for Dynamic Privacy Risk Calculator
  riskWeights: {
    preciseLocation: 25,       // High threat vector (physical tracking)
    biometricProfiling: 30,    // Extreme threat (facial/voice embeddings)
    continuousAudioCapture: 20,// High threat (ambient eavesdropping)
    browserCrossTracking: 15,  // Medium threat (behavioral fingerprinting)
    thirdPartyBrokerage: 20,   // High threat (data sold to unregulated brokers)
    cloudRetentionIndefinite: 15// Medium threat (permanent liability)
  }
};
