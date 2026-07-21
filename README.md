# <p align="center"><img src="./assets/logo.svg" alt="ForceLens Logo" width="80" height="80"><br>ForceLens</p>

<p align="center">
  <strong>Salesforce Apex & Flow Intelligence Engine</strong>
</p>

<p align="center">
  <a href="https://forcelens.vercel.app/"><img src="https://img.shields.io/badge/Website-forcelens.vercel.app-blue.svg?style=flat-square&logo=vercel" alt="Website"></a>
  <a href="https://chromewebstore.google.com/detail/kgjfgfpcglhhodepffbhoalfppdjbdhi?utm_source=item-share-cb"><img src="https://img.shields.io/badge/Chrome_Extension-Free-indigo.svg?style=flat-square&logo=google-chrome&logoColor=white" alt="Chrome Web Store"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-All%20Rights%20Reserved-lightgrey.svg?style=flat-square" alt="All Rights Reserved License"></a>
  <img src="https://img.shields.io/badge/Security-Local--First-green.svg?style=flat-square" alt="Security: Local First">
  <img src="https://img.shields.io/badge/AI-BYOK-orange.svg?style=flat-square" alt="AI: BYOK ready">
</p>

<p align="center">
  <strong>Stop reading logs. Start seeing the execution.</strong>
</p>

<p align="center">
  ForceLens turns raw, line-by-line Salesforce Apex logs into the exact order of execution — triggers, flows, queries, and limits — and explains it with the AI model you already pay for. Bring your own key. 100% local-first.
</p>

---

## ✦ Why ForceLens?

Salesforce Developer Console shows you raw logs. Every other tool makes you copy log IDs, hunt down trace flags, open new tabs, and dig for logs. 

**ForceLens collapses that entire ritual into a single action.** It is not just a log viewer; it is an intelligence layer that meets you exactly where your eyes already are.

<p align="center">
  <img src="./assets/forcelens_home.png" alt="ForceLens Analysis Workspace" width="90%">
</p>

---

## ✦ Core Features

### 1. One-Click "Smart Capture"
No more manually setting up trace flags or hunting for logs in Setup. Click **Smart Capture**, run your transaction, and ForceLens captures, groups, and displays the log automatically without you ever leaving the page.

### 2. True Order of Execution
ForceLens reconstructs Salesforce's true execution flow. See exactly when before/after triggers, validation rules, flows, workflows, and roll-ups fired, and how limits were consumed at every single step.

### 3. One Flow, Four Expert Lenses
Hand any Flow to ForceLens and choose a perspective:
- **Developer Lens**: Null-handling, loop-bulkification, fault paths, and query optimization.
- **Business Analyst Lens**: Translates complex Flow logic into human-readable business rules.
- **QA Lens**: Auto-generates test scenarios, edge cases, and user acceptance criteria.
- **Security Lens**: Flags insecure patterns, DML access risks, and privilege elevation.
Export complete reports directly as `.docx` files.

### 4. Bring Your Own Key (BYOK) AI
Configure your own API keys for **Claude, GPT-4o, Groq, or OpenRouter**. All AI queries go directly from your browser to the provider — no middleman servers, no markup fees, and complete data isolation.

### 5. Local-First History
Your last 200 analyzed sessions are saved in your browser's local storage. Filter by org, log ID, or date, and resume debugging custody instantly.

### 6. The 12 Workspace Diagnostic Lenses
ForceLens parses logs into 12 dedicated interactive views:
- **Overview**: High-level execution metrics, speed indicators, and transaction health scoring.
- **Log Explorer**: Color-coded log line grid with level filters and regex text search.
- **Execution Tree**: Complete hierarchical call tree showing nested triggers, methods, and flows.
- **Order of Execution**: Architectural layout displaying exact event firing order.
- **Apex Debug**: Isolated console showing only `System.debug()` output lines.
- **AI Pulse**: Explains limits warnings, complex loops, and execution code paths in natural language.
- **Errors**: Dedicated warnings panel highlighting failed validations, query caps, and DML faults.
- **Timeline**: Horizontal flame chart plotting block durations to identify latency hot spots.
- **DML**: Direct grid tracking DML occurrences, rows mutated, and nested-loop DML warnings.
- **SOQL**: Database log auditing query count, rows returned, and duplicate/non-selective queries.
- **Performance**: Deep profiler highlighting execution hotspots.
- **Limits**: Real-time counter detailing Governor Limit utilization per block.

---

## ✦ Security & Privacy First

We believe developer tools should never expose proprietary code or client logs. 
* **Zero Telemetry Servers**: ForceLens has no backend server. Your logs are parsed inside your browser sandbox.
* **Direct AI Connection**: Outbound calls to AI providers (Anthropic, OpenAI, Groq, OpenRouter) are made directly from your browser.
* **Encrypted Local Storage**: Your API keys and historical logs are stored safely within Chrome’s secure local storage.

---

## ✦ How It Integrates

ForceLens adds a single, powerful **"Inspect Log"** button in the three places your eyes already live:

1. **Debug Logs List Table** (Setup)
2. **Debug Log Detail Page** (Setup)
3. **Developer Console Log Tab Strip**
4. **Salesforce Flow Builder Canvas**

<p align="center">
  <img src="./assets/forcelens_integration_logs_grid.png" alt="Salesforce Setup Integration" width="45%"> &nbsp;
  <img src="./assets/forcelens_integration_dev_console.png" alt="Developer Console Integration" width="45%">
</p>

---

## ✦ Getting Started

### Installation
1. Visit the [Chrome Web Store](https://chromewebstore.google.com/detail/kgjfgfpcglhhodepffbhoalfppdjbdhi?utm_source=item-share-cb) page.
2. Click **Add to Chrome**.
3. Open any Salesforce Sandbox, Scratch Org, Developer Edition, or Production environment.

### Setup AI (Optional)
1. Click the ForceLens extension icon.
2. Select **Settings** (or **Configure AI**).
3. Insert your API Key for Claude, GPT, Groq, or OpenRouter.
4. Save key (stored locally).

---

## ✦ Works Everywhere
- Lightning Experience & Salesforce Classic
- Developer Console & Flow Builder
- Developer, Sandbox, Scratch, and Production Environments

---

## ✦ Technical Specifications
- **Parser Engine**: Pure JavaScript client-side parser.
- **Parsing Speed**: Handles 100k+ log lines in `< 100ms`.
- **Sandbox Security**: Runs strictly within Chrome Extension sandbox isolation.
- **Authentication**: Zero OAuth configurations required; leverages active cookies (browser session context) to authenticate requests.

---

## ✦ FAQ

**Q: Is it really free?**  
A: Yes. Smart Capture, the execution tree, Order of Execution, Flow analysis, local history, and all 12 workspace lenses are free forever — they run entirely on your machine, so there is no server for us to charge for. The only cost is the API usage fee charged directly by your chosen AI provider, and only if you configure your own key for the AI summaries.

**Q: Is my code or data safe?**  
A: Absolutely. ForceLens has no centralized backend server. Logs are parsed on your local machine and stored inside Chrome’s secure local extension storage. Outbound AI requests connect directly from your browser to the AI provider endpoint with zero middlemen.

**Q: Which editions of Salesforce are supported?**  
A: It works everywhere debug logs are generated: Developer Orgs, Scratch Orgs, Sandboxes, and Production Environments.

---

## ✦ License
Distributed under proprietary terms. All rights reserved. See [LICENSE](file:///c:/Users/HP/Desktop/ForceLense%20Site/LICENSE) for more information.

---

## ✦ Crafted By
Designed and crafted with care by **[Prit Sakhvala](https://github.com/sakhvalaps)**, Salesforce Developer.
