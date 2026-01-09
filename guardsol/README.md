# 🛡️ GuardSol

> **The Semantic Security Layer for Solana.**
> *Decode the Matrix. Sign with Confidence.*

## 🌐 Overview
**GuardSol** is a next-generation security dashboard designed to bridge the gap between complex on-chain data and human understanding. While standard wallets show *what* you are signing, GuardSol tells you *what it means*.

Built for the **Token-2022** era, GuardSol introduces the **NTG (New Token Guard)** engine, capable of parsing advanced extension specific risks (Transfer Hooks, Permanent Delegates) that legacy scanners miss.

---

## 🚀 Complete Feature List

### 1. 🧬 NTG Scanner (Token-2022 Engine)
The first dedicated scanner for Solana's Token Extension Standard.
- **Deep Extension Parsing**: Detects hidden pitfalls like `Transfer Hooks` (programmable blocking) and `Confidential Transfers`.
- **Permanent Delegate Detection**: Flags tokens where the issuer retains absolute control over your funds.
- **RWA Intelligence**: Specialized presets for analyzing Real World Assets and regulated stablecoins (e.g., PYUSD).

### 2. 🧪 Transaction Simulator (X-Ray)
- **Visual Simulation**: Paste any Base64 transaction string to see specific balance changes *before* execution.
- **Instruction Decoder**: Breaks down complex program interactions into readable steps.
- **Risk Analysis**: Automatically flags high-risk patterns like drainers or excessive authority delegation.

### 3. 🛡️ The "Neon Shield" Dashboard
- **Dynamic Risk Score (0-100)**: Proprietary algorithm evaluating wallet age, interaction history, and exposure.
- **Scam Database**: Instant cross-reference against 30,000+ known malicious domains and wallets.
- **Wallet Health Check**: Scans for dangling approvals and open sessions.

### 4. ⚖️ Community Defense System
- **Crowdsourced Reporting**: Users can flag suspicious addresses directly from the dashboard.
- **Dispute Resolution**: Incorrectly flagged wallets can submit disputes via the **Dispute Modal** for community review.
- **Quadratic Voting**: A decentralized reputation system where user votes are weighted by their "trust score," preventing bot manipulation.

### 5. 🛠️ Utilities & Tools
- **Export Analysis**: One-click **Export Button** to download full risk reports (JSON/PDF ready) for sharing or record-keeping.
- **Social Sharing**: Built-in **Share Button** to instantly warn others on X (Twitter) or Telegram.
- **Admin Governance**: specialized **Admin Panel** for moderators to review disputes and manage the global blacklist.

---

## 🛠️ Technical Architecture

GuardSol is built for speed and reliability, leveraging the best of the Solana stack.

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TailwindCSS | High-performance, glassmorphism UI |
| **Blockchain** | Solana Web3.js | Direct RPC interaction and instruction parsing |
| **Data Layer** | Helius RPC | Enterprise-grade simulation and account indexing |
| **Backend** | Supabase | Real-time community voting and dispute tracking |
| **Security** | TweetNaCl.js | Client-side cryptographic verification |

---

## 📦 Installation & Local Development

GuardSol is open-source and easy to run locally.

```bash
# 1. Clone the repository
git clone https://github.com/ChandanaMandarapu/guardsol.git

# 2. Navigate to project directory
cd guardsol

# 3. Install dependencies
npm install

# 4. Configure Environment
# Create a .env file and add your keys:
# REACT_APP_HELIUS_RPC_URL=your_helius_key
# REACT_APP_SUPABASE_URL=your_supabase_url
# REACT_APP_SUPABASE_ANON_KEY=your_supabase_key

# 5. Ignite the Shield
npm start
```

---

## 🗺️ Roadmap (Q1 2026)

- [x] **Phase 1: Foundation** - Risk Scanning & Basic UI (Completed Dec 2025)
- [x] **Phase 2: The NTG Update** - Token-2022 Support & Simulator (Completed Jan 2026)
- [ ] **Phase 3: The Ecosystem Layer (Coming Soon)**
---

## 🤝 Contributing

GuardSol is a community-first project. We welcome PRs, especially those improving our risk detection heuristics.

**Lead Developer**: [Chandana Mandarapu](https://github.com/ChandanaMandarapu)

---

> *Disclaimer: GuardSol is an analytical tool. Always do your own research (DYOR). Security is a journey, not a destination.*
