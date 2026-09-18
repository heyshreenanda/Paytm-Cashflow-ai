# Paytm CashFlow AI 💳 📈

> **Next-Generation Predictive Liquidity & Pre-Purchase Impact Copilot**  
> Predict. Explain. Plan. Empowering everyday users and merchants with deterministic cash-flow forecasting and explainable AI.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-paytm--cashflow--ai.vercel.app-00BAF2?style=for-the-badge&logo=vercel&logoColor=white)](https://paytm-cashflow-ai.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-Backend-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Groq](https://img.shields.io/badge/Groq%20AI-Fast%20Inference-F05032?style=for-the-badge&logoColor=white)](https://groq.com/)

---

## 🔗 Live Application Demo

Experience the interactive application directly in your browser:  
👉 **[https://paytm-cashflow-ai.vercel.app/](https://paytm-cashflow-ai.vercel.app/)**

---

## 💡 The Problem: The "Blind Spot" in Modern Digital Payments

While UPI and digital wallets make payments instantaneous, they provide **zero forward-looking visibility**. 

* **The Balance Illusion:** A user with ₹28,000 in their account sees an affirmative balance and makes a ₹3,000 discretionary purchase, unaware that Rent (₹12,000) and an appliance EMI (₹6,500) are scheduled to clear in 5 days.
* **The Week 3 Cash Crunch:** By Week 3 of the month, fixed obligations converge with daily living costs, dragging available liquidity down to a precarious safety floor or triggering overdrafts, bounced auto-debits, and penalty charges.
* **No Pre-Purchase Impact Feedback:** Existing budgeting apps only report *historical* spending after the money is already gone. Users have no safe way to test: *"Can I afford this right now without compromising my rent or loan repayment next week?"*

---

## 🚀 How Paytm CashFlow AI Solves This

**Paytm CashFlow AI** introduces a **predictive, pre-purchase simulation engine** coupled with **explainable AI financial reasoning**:

1. **Before You Spend, Not After:** Simulate any transaction amount and category in a sandboxed session before any real UPI transfer occurs.
2. **Deterministic 30-Day Liquidity Trajectory:** Plots everyday forward-looking balances accounting for income cycles, recurring EMIs, utility bills, and historical discretionary spend velocity.
3. **Identifies Peak Pressure Windows:** Pinpoints the exact week and day where cash reserves reach their minimum buffer (e.g., Week 3 liquidity floor).
4. **Explainable AI Reasoning:** Employs high-speed inference (Groq / Gemini) to convert complex multi-variable obligations into plain-English, actionable advice.
5. **Zero Financial Hallucinations:** AI explanations are strictly grounded in deterministic mathematical calculations from the underlying financial engine.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Client Layer (React 18 + Vite)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ Dashboard View  │  │ Cash-Flow Chart │  │ Pre-Purchase Simulator  │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘  │
│  ┌────────┴────────┐  ┌────────┴────────┐  ┌────────────┴────────────┐  │
│  │ What-If Engine  │  │ Commitments Map │  │ AI Copilot & PDF Export │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘  │
└───────────┼────────────────────┼────────────────────────┼───────────────┘
            │                    │                        │
            ▼                    ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Express.js API Backend (Node.js)                   │
│                                                                         │
│  • GET  /api/state               • POST /api/simulate-transaction       │
│  • POST /api/apply-simulation    • POST /api/reset-simulation           │
│  • POST /api/commitments         • GET  /api/report                     │
│  • POST /api/copilot             • GET  /api/health                     │
└───────────────────┬───────────────────────────────────┬─────────────────┘
                    │                                   │
                    ▼                                   ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────┐
│     Deterministic Financial Engine   │  │   AI Cognitive Reasoning      │
│                                      │  │                               │
│ • Daily Balance Projection Math      │  │ • Groq AI API (Qwen 3.8 /     │
│ • Debt-to-Income (DTI) Assessment   │  │   Llama 3.3 Fast Inference)   │
│ • Safety Buffer Delta Calculation    │  │ • Gemini 3.6 Flash Fallback   │
│ • Health Score Breakdown (0-100)     │  │ • Grounded Explainability     │
│ • Pressure Period Floor Detection    │  │ • Zero-Hallucination Sandbox  │
└──────────────────────────────────────┘  └───────────────────────────────┘
```

### Architectural Breakdown

1. **Client Tier (`/src`)**:
   * **Reactive State Management**: Synchronizes baseline financial state with active simulation layers.
   * **Interactive Visualizations**: Powered by `recharts` for multi-line forecast curves, safety buffer zones, and category distributions.
   * **Accessible Interface**: Built using Tailwind CSS with dark-mode aesthetic, mathematical spacing, and high-contrast typography.

2. **Server & Engine Tier (`/server` & `/src/services`)**:
   * **Deterministic Financial Engine**: Computes daily balance trajectories, debt obligations, buffer deltas, and multi-factor health scores using transparent mathematical algorithms.
   * **Stateful Simulation Controller**: Allows testing arbitrary transactions without modifying base ledger data, supporting instant revert or commit actions.

3. **Inference & Explanation Tier (`/server/aiService.ts`)**:
   * **Groq AI Integration**: Uses OpenAI-compatible endpoints with ultra-low latency inference to generate contextual financial summaries.
   * **Gemini Resilience Fallback**: Seamlessly falls back to `gemini-3.6-flash` if external credentials vary.
   * **Deterministic Rule-Based Fallback**: Guarantees uninterrupted operation even during offline development.

---

## 🌟 Key Functional Modules

### 1. Live Pre-Purchase Simulator
* Test transactions (e.g., ₹3,000 for shopping) in real-time.
* Instant visual preview:
  * **Balance Delta:** Current Balance vs. Simulated Balance.
  * **Buffer Delta:** Projected month-end buffer impact.
  * **Cash-Flow Pressure Indicator:** Notifies if the spend jeopardizes upcoming commitments.
  * **Groq AI Explanation:** 2-sentence explanation of how the spend affects Week 3 obligations.

### 2. Multi-Horizon Cash-Flow Forecast
* Daily trajectory from Day 1 to Day 30 of the current cycle.
* Displays projected balance alongside an adjustable safety threshold (₹5,000 redline).
* Highlights the critical **Week 3 Pressure Period** caused by the cumulative clearance of rent and EMI.

### 3. Commitments & Debt Timeline
* Visual schedule of non-negotiable outflows:
  * **Rent:** ₹12,000 (Due 5th)
  * **Appliance EMI:** ₹6,500 (Due 12th)
  * **Broadband & Utilities:** ₹1,500 (Due 20th)
  * **Health Insurance Annual Renewal:** ₹12,000 (Due 25th)
* Add custom obligations dynamically to model new recurring subscriptions or bills.

### 4. What-If Scenario Sandbox
* **Personal Loan Modeler:** Calculate monthly EMI, total interest, and impact on debt-to-income ratio for loans up to ₹10,00,000.
* **Income Fluctuation Simulator:** Model delayed salary or freelance income variances.
* **Expense Shock Simulator:** Stress-test the budget against unexpected medical or home repair costs.

### 5. Paytm Cash-Flow Health Score (0–100)
Multi-factor mathematical health index derived from:
* **Buffer Stability (35%)**: Ratio of projected buffer to monthly expenses.
* **Commitment Coverage (25%)**: Liquid balance vs. upcoming 14-day obligations.
* **Debt-to-Income (20%)**: Fixed EMI obligations as a percentage of income.
* **Liquidity Floor (20%)**: Distance between lowest projected balance and zero.

### 6. Vector PDF Financial Reports
* Download executive-ready financial reports with one click.
* Includes summary statistics, categorized spending velocity, upcoming obligations, and AI financial briefs.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Fast, responsive single-page architecture |
| **Styling** | Tailwind CSS | High-contrast, clean dark-mode financial UI |
| **Charts** | Recharts | Forward-looking liquidity area charts & comparisons |
| **Icons** | Lucide React | Clean, standard UI iconography |
| **Backend** | Express.js, Node.js | REST API routing and simulation orchestration |
| **AI Layer** | Groq API (`qwen/qwen3.8-27b`) | Sub-second plain-English financial reasoning |
| **AI Fallback**| `@google/genai` (`gemini-3.6-flash`) | Secondary cloud intelligence layer |
| **PDF Engine**| jsPDF & jsPDF-AutoTable | Client-side vector report generation |

---

## 🚦 Getting Started Locally

### Prerequisites
* Node.js 18.x or higher
* npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/paytm-cashflow-ai.git
cd paytm-cashflow-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your credentials:
```env
# Groq API Credentials (for fast AI financial explanations)
GROQ_API_KEY=your_groq_api_key_here
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=qwen/qwen3.8-27b

# Optional: Gemini API Key (for secondary resilience fallback)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be live at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📡 API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and uptime verification |
| `GET` | `/api/state` | Returns user profile, current balance, forecast, commitments, and active simulation |
| `POST` | `/api/simulate-transaction` | Calculates financial impact of a simulated spend without saving |
| `POST` | `/api/apply-simulation` | Activates simulated transaction in the session state |
| `POST` | `/api/reset-simulation` | Clears active simulation and restores baseline ledger |
| `POST` | `/api/commitments` | Adds a new upcoming scheduled commitment to the schedule |
| `GET` | `/api/report` | Returns period-specific report data with Groq AI summary |
| `POST` | `/api/copilot` | Answers natural language financial queries with grounded facts |

---

## 🛡️ Responsible AI & Financial Disclaimer

* **Informs, Never Decides:** Paytm CashFlow AI provides forward-looking estimates and scenario analysis to assist users in making informed personal decisions. It does not initiate real banking transfers without explicit user approval.
* **Deterministic Grounding:** All figures (balances, buffers, ratios) originate strictly from mathematical calculations; AI models are used solely to explain and summarize those verified figures.

---

## 🌐 Live Deployment

Try the production build deployed at:  
👉 **[https://paytm-cashflow-ai.vercel.app/](https://paytm-cashflow-ai.vercel.app/)**
