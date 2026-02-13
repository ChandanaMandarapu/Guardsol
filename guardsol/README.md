# 🛡️ GuardSol

> **The Semantic Security Layer for Solana.**  

## 🌐 Overview

**GuardSol** is a next-generation security dashboard designed to bridge the gap between complex on-chain data and human understanding. While standard wallets show *what* you are signing, GuardSol tells you *what it means*.

Built for the **Token-2022** era, GuardSol introduces the **NTG (New Token Guard)** engine, capable of parsing advanced extension-specific risks (Transfer Hooks, Permanent Delegates, Confidential Transfers) that legacy scanners miss.

---

## 🚀 Complete Feature Set

### 1. 🧬 NTG Scanner (Token-2022 Engine)
The first dedicated scanner for Solana's Token Extension Standard.

**Core Capabilities:**
- **Deep Extension Parsing**: Automatically detects and analyzes all Token-2022 extensions including Transfer Hooks, Permanent Delegates, Transfer Fees, Interest-Bearing tokens, and Confidential Transfers
- **Permanent Delegate Detection**: Flags tokens where the issuer retains absolute control over your funds, even after transfer
- **Transfer Hook Analysis**: Identifies programmable blocking mechanisms that can prevent token transfers
- **RWA Intelligence**: Specialized presets for analyzing Real World Assets and regulated stablecoins (e.g., PYUSD, tokenized securities)
- **Risk Scoring Engine**: Proprietary algorithm that calculates risk scores (0-100) based on extension combinations and patterns
- **Extension Breakdown**: Visual display of every active extension with human-readable explanations

**Technical Implementation:**
- Custom Token-2022 parser (`parser.js`) that decodes extension data from account info
- Risk engine (`riskEngine.js`) with preset configurations for common token types
- Real-time RPC integration via Helius for live token data

### 2. 🔍 G-SIG Visualizer (Governance Signature Intelligence Graph)
Advanced governance token analysis and authority tracking.

**Features:**
- **Authority Chain Visualization**: Interactive graph showing mint authority, freeze authority, and update authority relationships
- **Multi-Signature Detection**: Identifies and displays multisig configurations for governance tokens
- **Authority Risk Assessment**: Flags centralized control patterns and single points of failure
- **Historical Authority Changes**: Tracks authority transfers and revocations over time
- **Visual Network Graph**: D3.js-powered interactive visualization of token authority structures

**Use Cases:**
- Verify DAO token decentralization
- Audit governance token security before investing
- Identify potential rug pull risks in new token launches

### 3. 🧪 Transaction Simulator (X-Ray)
Pre-execution transaction analysis and simulation.

**Capabilities:**
- **Visual Simulation**: Paste any Base64 transaction string to see specific balance changes *before* execution
- **Instruction Decoder**: Breaks down complex program interactions into readable steps
- **Balance Change Preview**: Shows exact token transfers, SOL movements, and account modifications
- **Risk Pattern Detection**: Automatically flags high-risk patterns like drainers, excessive authority delegation, or suspicious program calls
- **Demo Transaction Loader**: Pre-loaded example transactions for testing and learning
- **Multi-Program Support**: Handles complex transactions involving Token Program, Token-2022, System Program, and custom programs

**Technical Stack:**
- Solana Web3.js transaction parsing
- Helius RPC simulation endpoint
- Custom instruction decoder for human-readable output

### 4. 🛡️ Wallet Security Dashboard
Comprehensive wallet health monitoring and risk assessment.

**Components:**

**Risk Score Display:**
- **Dynamic Risk Score (0-100)**: Proprietary algorithm evaluating wallet age, interaction history, token exposure, and approval patterns
- **Real-Time Threat Detection**: Instant cross-reference against 30,000+ known malicious domains and wallets
- **Wallet Health Check**: Scans for dangling approvals, open sessions, and excessive permissions
- **Historical Risk Tracking**: Monitor how your wallet's risk profile changes over time

**Wallet Info Panel:**
- Connected wallet address display
- SOL balance tracking
- Network status indicator
- Quick disconnect functionality

**Token Stats:**
- Total token count
- Portfolio value estimation
- Token diversity metrics
- Suspicious token flagging

### 5. 🔐 Approval Scanner
Automated detection of dangerous token approvals and delegations.

**Features:**
- **Active Approval Detection**: Scans all connected wallet tokens for active approvals and delegates
- **Permanent Delegate Alerts**: Highlights tokens with permanent delegate extensions (Token-2022)
- **Revocation Tools**: One-click revoke functionality for dangerous approvals
- **Approval History**: Track when approvals were granted and to which programs
- **Batch Scanning**: Analyze all tokens in wallet simultaneously
- **Visual Risk Indicators**: Color-coded warnings for high-risk approvals

### 6. ⚖️ Community Defense System
Decentralized threat intelligence and reputation management.

**Voting System:**
- **Quadratic Voting**: Decentralized reputation system where user votes are weighted by their "trust score," preventing bot manipulation
- **Upvote/Downvote Mechanism**: Community-driven flagging of suspicious addresses
- **Vote Weight Calculation**: Based on wallet age, transaction history, and previous voting accuracy
- **Real-Time Vote Aggregation**: Instant updates to address reputation scores

**Reporting Infrastructure:**
- **Crowdsourced Reporting**: Users can flag suspicious addresses directly from the dashboard via the Report Scam Modal
- **Evidence Submission**: Upload screenshots, transaction hashes, and detailed descriptions
- **Category Classification**: Scam types (phishing, rug pull, impersonation, etc.)
- **Community Reports View**: Browse all flagged addresses with vote counts and evidence

**Dispute Resolution:**
- **Dispute Modal**: Incorrectly flagged wallets can submit disputes for community review
- **Evidence-Based Appeals**: Upload proof of legitimacy (verified social profiles, audit reports, etc.)
- **Community Jury System**: Trusted community members review and vote on disputes
- **Automatic Unflagging**: Disputes with sufficient support automatically clear the flag

### 7. 🛠️ Utilities & Tools

**Export Functionality:**
- **Export Button**: One-click download of full risk reports
- **JSON Format**: Machine-readable export for integration with other tools
- **PDF-Ready Output**: Formatted data for sharing with auditors or team members
- **Comprehensive Data**: Includes risk scores, token analysis, approval scans, and community votes

**Social Sharing:**
- **Share Button**: Instantly warn others on X (Twitter) or Telegram
- **Pre-Formatted Messages**: Auto-generated warning text with wallet address and risk score
- **Direct Links**: Share specific token or wallet analysis pages
- **Community Alerts**: Broadcast high-risk findings to the GuardSol community

**Admin Governance:**
- **Admin Panel**: Specialized interface for moderators to review disputes and manage the global blacklist
- **Dispute Queue Management**: Review pending disputes with full evidence display
- **Blacklist Control**: Add/remove addresses from the global scam database
- **Moderator Actions Log**: Transparent record of all admin decisions
- **Community Trust Metrics**: Monitor voting patterns and detect manipulation attempts

### 8. 📊 Network Statistics
Real-time Solana network monitoring and ecosystem insights.

**Metrics Displayed:**
- **TPS (Transactions Per Second)**: Live network throughput
- **Active Validators**: Current validator count
- **Epoch Progress**: Visual progress bar for current epoch
- **Network Health**: Overall network status indicator
- **Recent Blocks**: Latest block production stats
- **Fallback Data**: Mock data for local development when RPC is unavailable

### 9. 🎨 User Interface & Experience

**Design System:**
- **Glassmorphism UI**: Modern, translucent card-based design with backdrop blur effects
- **Neon Accents**: Cyan/purple gradient theme with glowing effects
- **Dark Mode**: Optimized for extended use with reduced eye strain
- **Responsive Layout**: Fully functional on desktop, tablet, and mobile devices
- **Loading States**: Smooth loading spinners and skeleton screens
- **Error Handling**: User-friendly error messages with recovery suggestions

**Interactive Components:**
- **Circular Progress Indicators**: Visual representation of risk scores and loading states
- **Glass Cards**: Reusable UI component for consistent styling
- **Neon Buttons**: Animated hover effects with gradient backgrounds
- **Security Ticker**: Scrolling banner with real-time security alerts
- **Modal System**: Overlay modals for reports, disputes, and detailed views

### 10. 📱 Navigation & Routing

**Multi-Page Application:**
- **Home Dashboard**: Wallet scanning and risk assessment
- **NTG Scanner**: Dedicated Token-2022 analysis page
- **Transaction Simulator**: Standalone transaction testing environment
- **Admin Panel**: Governance and moderation interface
- **Reputation Guide**: Educational modal explaining the voting system

**Header Navigation:**
- Quick page switching
- Active page indicator
- Wallet connection status
- Help/Guide access

---

## 🛠️ Technical Architecture

GuardSol is built for speed, security, and reliability, leveraging the best of the Solana stack.

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TailwindCSS | High-performance, glassmorphism UI with component-based architecture |
| **Blockchain** | Solana Web3.js + @solana/spl-token | Direct RPC interaction, instruction parsing, and Token-2022 support |
| **Data Layer** | Helius RPC | Enterprise-grade transaction simulation and account indexing |
| **Backend** | Supabase | Real-time community voting, dispute tracking, and scam database |
| **Security** | TweetNaCl.js | Client-side cryptographic verification for wallet signatures |
| **Analytics** | Google Analytics 4 | User behavior tracking and feature usage metrics |
| **Caching** | Custom RPC Cache | Reduces redundant RPC calls and improves performance |

**Key Files & Modules:**

```
src/
├── components/          # React UI components
│   ├── AdminPanel.jsx          # Moderator dashboard
│   ├── ApprovalScanner.jsx     # Token approval detector
│   ├── DisputeModal.jsx        # Dispute submission interface
│   ├── ReportScamModal.jsx     # Scam reporting form
│   ├── RiskScoreDisplay.jsx    # Risk visualization
│   ├── TxSimulator.jsx         # Transaction simulator
│   ├── VotingButton.jsx        # Quadratic voting UI
│   └── WalletInfo.jsx          # Wallet connection panel
├── ntg/                # Token-2022 engine
│   ├── parser.js               # Extension decoder
│   ├── riskEngine.js           # Risk calculation logic
│   ├── presets.js              # Token type configurations
│   ├── votingService.js        # Community voting backend
│   └── components/
│       ├── NTGDashboard.jsx    # Main NTG interface
│       └── GSigVisualizer.jsx  # Authority graph renderer
└── utils/              # Helper functions
    ├── analytics.js            # GA4 integration
    ├── cache.js                # RPC response caching
    ├── config.js               # Environment validation
    ├── errors.js               # Error handling utilities
    ├── gSigTracer.js           # Authority chain tracer
    ├── rpcCache.js             # RPC call optimizer
    ├── tokens.js               # Token fetching logic
    ├── transactionSimulator.js # Tx simulation engine
    └── validation.js           # Input validation
```

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

**Environment Variables:**
- `REACT_APP_HELIUS_RPC_URL`: Helius API key for RPC access (required for NTG scanner and transaction simulator)
- `REACT_APP_SUPABASE_URL`: Supabase project URL (required for community features)
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous key (required for voting and reports)

---

## 🎯 Use Cases

**For Individual Users:**
- Scan wallets before interacting with new dApps
- Verify token legitimacy before purchasing
- Detect and revoke dangerous approvals
- Simulate transactions before signing
- Report scams to protect the community

**For DAOs & Projects:**
- Audit governance token authority structures
- Verify Token-2022 extension configurations
- Monitor community sentiment via voting data
- Identify potential security vulnerabilities
- Provide security reports to token holders

**For Developers:**
- Test Token-2022 implementations
- Debug transaction failures
- Analyze program interactions
- Validate authority configurations
- Integrate GuardSol data via export functionality

---

## 🔒 Security & Privacy

- **Client-Side Processing**: All wallet analysis happens in your browser
- **No Private Key Storage**: GuardSol never requests or stores private keys
- **Read-Only Operations**: All RPC calls are read-only queries
- **Open Source**: Full code transparency for community auditing
- **Supabase RLS**: Row-level security on all database operations
- **Rate Limiting**: Protection against abuse of community features

---

## 🤝 Contributing

GuardSol is a community-first project. We welcome PRs, especially those improving:
- Risk detection heuristics
- Token-2022 extension support
- Transaction simulation accuracy
- UI/UX enhancements
- Documentation

**Lead Developer**: [Chandana Mandarapu](https://github.com/ChandanaMandarapu)

---

## 📄 License

MIT License - See LICENSE file for details

---

> *Disclaimer: GuardSol is an analytical tool. Always do your own research (DYOR). Security is a journey, not a destination.*
