# 🛡️ PrivacyGuard UX: HCI Privacy & Ethical AI Research Sandbox

> **Course:** Human-Computer Interaction (HCI) - 5th Semester  
> **Core HCI Topics Covered:**  
> - **Topic 12:** Privacy & Data Ethics in UX  
> - **Topic 5:** Ethical AI in HCI  
> **Tech Stack:** HTML5, Tailwind CSS (CDN-based, Zero-build), Modular ES6 JavaScript, Responsive Cyber-Clean Design  
> **Deployment Target:** GitHub Pages (Zero-configuration)

---

## 📖 Executive Summary & Academic Motivation

Modern user interfaces increasingly employ **deceptive design patterns (Dark Patterns)** engineered to subvert user autonomy, extract non-consensual telemetry, and harvest personal intellectual property for proprietary artificial intelligence model training. 

**PrivacyGuard UX** is an interactive, empirical Human-Computer Interaction (HCI) research web application built to deconstruct manipulative interface mechanics and juxtapose them against **Dr. Ann Cavoukian’s 7 Principles of Privacy by Design (PbD)**, **Harry Brignull’s Deceptive Patterns Taxonomy**, **Jakob Nielsen’s Usability Heuristics**, and **IEEE / EU AI Act standards**.

---

## 🏛️ System Architecture & File Structure

The project employs a cleanly separated, professional modular architecture with zero compilation dependencies, ensuring instantaneous, failure-free deployment to **GitHub Pages**:

```
d:\IQRA UNI\5th Semester\HCI\Project 3 PrivacyGuard UX/
│
├── index.html                   # Semantic HTML5 cyber-clean dashboard layout
├── css/
│   └── styles.css               # Glassmorphic cyber styling, glowing indicators, custom switches
├── js/
│   ├── app.js                   # Application entry point, routing & module orchestrator
│   ├── data/
│   │   └── hci-ethics-data.js   # Theoretical Knowledge Base (Brignull, Cavoukian, GDPR, Nielsen)
│   └── modules/
│       ├── dark-pattern-sim.js  # Feature 1: Side-by-side Dark Pattern vs Ethical UX live banner simulator
│       ├── privacy-calc.js      # Feature 2: Real-time dynamic Privacy Risk Meter & SVG Gauge
│       ├── ai-consent-matrix.js # Feature 3: Ethical AI Training & Telemetry Matrix (Topic 5)
│       └── examiner-modal.js    # Feature 4: Interactive Element Inspector & Academic Viva Dossier
└── README.md                    # Academic documentation & viva defense cheat-sheet
```

---

## 🎯 Core Features Implemented

### 1. "Dark Pattern vs. Ethical UX" Side-by-Side Live Simulator (HCI Topic 12)
* **Deceptive Banner (Dark Pattern):**
  * **Asymmetrical Visual Contrast:** A glowing 48px CTA button (`"⚡ ACCEPT ALL"`) vs. an invisible, low-contrast, unstyled link for preferences.
  * **Confirmshaming:** Guilt-inducing microcopy (*"No thanks, I dislike safe & relevant browsing"*).
  * **Pre-selection Bias:** Checkboxes pre-checked by default for 427 ad-tech vendors (violates CJEU *Planet49*).
  * **Roach Motel Obstruction:** Disabling tracking requires navigating nested menus and manually unchecking 427 separate checkboxes without a "Deselect All" button.
* **Privacy-by-Design Banner (Ethical UX):**
  * **Equal Visual Prominence:** Mandated by EDPB Guidelines 05/2020 (`"REJECT OPTIONAL"` and `"ACCEPT CHOICES"` share identical button dimensions, padding, and visual hierarchy).
  * **Privacy as Default (PbD Principle 2):** All non-essential telemetry toggles default to the **OFF** state.
  * **1-Click Symmetrical Opt-Out:** Withdrawing consent takes exactly 1 click, satisfying GDPR Article 7(3).
* **Live HCI Behavioral Audit:** Real-time telemetry tracking comparing user friction (1 Click vs 428 Clicks) and cognitive load rating.

### 2. Dynamic Privacy Risk Score Calculator
* Interactive switches and continuous sliders for multi-vector threat modeling:
  1. High-precision GPS & WiFi Triangulation (+25 Pts)
  2. Biometric & Facial Emotion Mesh Profiling (+30 Pts)
  3. Ambient Microphone & Audio Eavesdropping (+20 Pts)
  4. 3rd-Party Data Broker Syndication (+20 Pts)
  5. Browser Canvas Fingerprinting (+15 Pts)
  6. Telemetry Retention Horizon (Immediate Ephemeral → Indefinite Permanent Storage)
* **Real-Time Animated SVG Gauge:**
  * Dynamic radial path animation transitioning smoothly through 4 threat tiers:
    * 🟢 **0 – 20:** *Fortified (PbD Compliant)*
    * 🟡 **21 – 45:** *Moderate Exposure (Cautionary Telemetry)*
    * 🟠 **46 – 75:** *High Surveillance Risk*
    * 🔴 **76 – 100:** *Critical Hazard (Predatory Exploitation)*
* **Dynamic Ethical Heuristics Audit:** Real-time generation of applicable GDPR articles (Art. 5(1)(e), Art. 9) and Cavoukian principles violated.

### 3. Ethical AI Consent Matrix (HCI Topic 5)
* Demonstrates how Large Language Models (LLMs) and generative AI systems must handle user prompts ethically:
  * **Foundation Model Retraining Opt-In/Opt-Out:** Decouples model access from training surveillance. Opting out incurs **0% latency or feature penalties** (Positive-Sum UX).
  * **Human Contractor Annotation Access:** Granular control over outsourced RLHF reviewers reading confidential prompts.
  * **Differential Privacy ($\epsilon$-noise) & Client-Side PII Masking:** Live sanitization regex that scrubs names, sensitive medical conditions, phone numbers, and private API keys before payload transmission.
  * **Interactive Live Prompt Sandbox:** Allows examiners to test sample inputs (Medical diagnoses, API tokens) and view the exact JSON telemetry packet emitted to the server.

### 4. Educator / Examiner Explainer Mode (Viva Defense Dossier)
* **Interactive Inspect Element Tags:** Every dark pattern in the simulator features a `[🔍 Inspect Pattern]` badge that directly links the UI component to Harry Brignull’s taxonomy and Nielsen’s heuristics.
* **Academic Dossier Modal:** A comprehensive tabbed reference suite containing:
  1. *Deceptive Patterns Taxonomy & Regulatory Standards*
  2. *Ann Cavoukian’s 7 Privacy by Design Principles*
  3. *Jakob Nielsen’s 10 Usability Heuristics Applied to Data Ethics*
  4. *Examiner Viva Q&A Defense Cheat-Sheet* (Instant answers for the professor)
  5. *Print / PDF Export Ready* for physical coursework submissions.

---

## 🔬 Theoretical Foundations & Literature Citations

1. **Brignull, Harry (2010).** *Deceptive Design (formerly Dark Patterns)*. [deceptive.design](https://deceptive.design).
2. **Cavoukian, Ann, Ph.D. (2009).** *Privacy by Design: The 7 Foundational Principles*. Information and Privacy Commissioner of Ontario, Canada.
3. **Nielsen, Jakob (1994).** *10 Usability Heuristics for User Interface Design*. Nielsen Norman Group.
4. **European Data Protection Board (EDPB) (2020).** *Guidelines 05/2020 on consent under Regulation 2016/679*.
5. **Court of Justice of the European Union (CJEU) (2019).** *Planet49 GmbH (Case C-673/17)* — Pre-ticked checkboxes do not constitute valid consent.
6. **IEEE Standards Association (2021).** *IEEE 7000-2021: Model Process for Addressing Ethical Concerns during System Design*.
7. **European Parliament & Council (2024).** *Regulation (EU) 2024/1689 (Artificial Intelligence Act)*.

---

## 🚀 How to Run Locally & Deploy to GitHub Pages

### Running Locally
Because this project uses native ES6 JavaScript modules and official CDN stylesheets, you can run it with any static web server:

```bash
# Option 1: Using Python (Built-in)
python -m http.server 8000

# Option 2: Using Node.js npx serve
npx serve .

# Option 3: VS Code Live Server Extension
# Right click "index.html" -> "Open with Live Server"
```
Open `http://localhost:8000` in any modern web browser.

### Deploying to GitHub Pages (100% Free & Fast)
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "feat: PrivacyGuard UX HCI research sandbox ready for deployment"
   ```
2. Create a new repository on [GitHub](https://github.com) named `PrivacyGuard-UX`.
3. Link your remote repository and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/PrivacyGuard-UX.git
   git push -u origin main
   ```
4. On GitHub, navigate to **Settings** > **Pages** > **Branch: main** > **Save**.
5. Your live interactive URL will be available at:  
   `https://<your-username>.github.io/PrivacyGuard-UX/`

---

## 🎓 Grading Rubric Alignment (For Teacher Viva)

| HCI Criteria | Project Implementation & Proof |
| :--- | :--- |
| **Heuristic Evaluation** | Direct mapping of Nielsen Heuristics #1, #3, #4, #8 against deceptive and ethical UI patterns. |
| **User Autonomy & Control** | Symmetrical 1-click opt-out (GDPR Art. 7(3)) vs. 428-click roach motel simulation. |
| **Ethical AI Integration** | Decoupled model retraining consent, differential privacy masking, and ephemeral vector storage. |
| **Code Modularity** | Cleanly separated data layer, modular ES6 architecture, high-contrast accessible styling. |
| **Presentation Readiness** | Built-in "Examiner Mode" with interactive inspector badges and viva defense cheat-sheet. |
