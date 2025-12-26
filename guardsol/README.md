# 🛡️ GuardSol - Solana Wallet Security Platform

**Protect your Solana wallet from scams, malicious approvals, and risky tokens.**

🌐 **Live Demo:** [https://guardsol-js1arycwh-chandanamandarapus-projects.vercel.app](https://guardsol-js1arycwh-chandanamandarapus-projects.vercel.app)

---

## 🚨 The Problem

Solana users lose millions to:
- **Malicious token approvals** that drain wallets
- **Scam tokens** disguised as legitimate projects
- **Phishing attacks** targeting wallet holders
- **Lack of transparency** in wallet security

Most users don't know what approvals they've granted or which tokens in their wallet are dangerous until it's too late.

---

## ✨ The Solution

**GuardSol** is a comprehensive security platform that gives Solana users complete visibility and control over their wallet security. We combine automated risk analysis with community-powered scam detection to keep your assets safe.

### What Makes GuardSol Different?

1. **Real-Time Approval Scanning** - See every token approval you've granted and revoke dangerous ones with one click
2. **Community-Powered Scam Detection** - Decentralized reporting network where users protect each other
3. **Risk Scoring System** - Instant wallet security analysis based on multiple risk factors
4. **Reputation System** - Reward accurate reporters, penalize false reports
5. **Admin Verification** - Community votes on scam reports for accuracy
6. **Beautiful UI** - Modern "NEON SHIELD" design that's actually pleasant to use

---

## 🎯 Key Features

### 🔍 Wallet Security Scanner
- **Instant Risk Analysis**: Connect your wallet or paste any address to get a comprehensive security score
- **Token Approval Detection**: Automatically scans for dangerous token approvals that could drain your wallet
- **Risk Score Breakdown**: Detailed analysis of wallet age, transaction patterns, approval count, and community reports
- **Manual Address Lookup**: Check any Solana wallet address without connecting your wallet

### 🚫 Approval Management
- **View All Approvals**: See every token approval you've granted in one place
- **One-Click Revoke**: Instantly revoke individual approvals or batch revoke multiple at once
- **Risk Assessment**: Each approval is analyzed for potential danger
- **Transaction History**: Track when approvals were granted and by which programs

### 📊 Community Scam Reporting
- **Report Scam Wallets**: Submit reports for suspicious addresses with evidence
- **Dispute System**: Challenge incorrect reports with counter-evidence
- **Voting Mechanism**: Community votes to verify or reject reports
- **Reputation Tracking**: Build your reputation by submitting accurate reports

### 👥 Admin Panel
- **Report Management**: Review and verify community-submitted scam reports
- **Voting Interface**: Vote on pending reports with detailed evidence review
- **Dispute Resolution**: Handle challenges to existing reports
- **Network Statistics**: Monitor platform health and community activity

### 📈 Network Statistics Dashboard
- **Real-Time Metrics**: Track total reports, verified scams, active voters, and network health
- **Trend Analysis**: Visualize scam detection trends over time
- **Community Impact**: See how many users are protected by the network

### 🎨 Premium User Experience
- **Glassmorphism Design**: Modern, sleek interface with the "NEON SHIELD" theme
- **Smooth Animations**: Polished micro-interactions throughout the app
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode**: Eye-friendly design for extended use
- **Export & Share**: Download your risk report as PDF or share results

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks and concurrent features
- **Tailwind CSS** - Utility-first styling with custom design system
- **Recharts** - Beautiful, responsive data visualizations
- **React GA4** - Google Analytics integration for usage tracking

### Solana Integration
- **@solana/web3.js** - Core Solana blockchain interactions
- **@solana/wallet-adapter** - Multi-wallet support (Phantom, Solflare, etc.)
- **@solana/spl-token** - Token program interactions for approval scanning

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Vercel Serverless Functions** - API endpoints for scam checking, reporting, voting
- **Row Level Security** - Database-level security policies

### Security & Performance
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Secure cross-origin requests
- **Security Headers** - XSS, clickjacking, and MIME-sniffing protection
- **Cron Jobs** - Automated cleanup and maintenance

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- A Solana wallet (Phantom, Solflare, etc.)
- Supabase account (for database)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/guardsol.git
cd guardsol
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Solana Network
REACT_APP_SOLANA_NETWORK=mainnet-beta
# or devnet for testing: REACT_APP_SOLANA_NETWORK=devnet

# Optional: Custom RPC Endpoint (for better performance)
REACT_APP_RPC_ENDPOINT=your_custom_rpc_url

# Optional: Google Analytics
REACT_APP_GA_TRACKING_ID=your_ga_tracking_id
```

4. **Set up Supabase database**

Run the SQL script in your Supabase SQL editor:

```bash
# The setup_db.sql file contains all necessary table schemas
```

Tables created:
- `scam_reports` - Community-submitted scam reports
- `disputes` - Challenges to existing reports
- `user_reputation` - Reputation scores for reporters/voters

5. **Start the development server**
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

---

## 📦 Project Structure

```
guardsol/
├── api/                          # Vercel serverless functions
│   ├── check-scam.js            # Check if wallet is reported
│   ├── cleanup-rate-limits.js   # Automated cleanup cron
│   ├── get-stats.js             # Network statistics
│   ├── report-scam.js           # Submit scam reports
│   ├── submit-dispute.js        # Handle disputes
│   ├── update-voter-reputation.js
│   ├── verify-report.js         # Admin verification
│   └── vote-report.js           # Community voting
├── public/
│   ├── index.html
│   ├── privacy.html             # Privacy policy
│   └── terms.html               # Terms of service
├── src/
│   ├── components/
│   │   ├── AdminPanel.jsx       # Admin dashboard
│   │   ├── ApprovalScanner.jsx  # Token approval scanner
│   │   ├── CommunityReports.jsx # Report display
│   │   ├── DisputeModal.jsx     # Dispute submission
│   │   ├── Header.jsx           # Navigation header
│   │   ├── NetworkStats.jsx     # Statistics dashboard
│   │   ├── ReportCard.jsx       # Individual report card
│   │   ├── ReportScamModal.jsx  # Scam reporting form
│   │   ├── ReputationGuide.jsx  # Reputation system guide
│   │   ├── RiskScoreDisplay.jsx # Risk analysis display
│   │   ├── ScamTester.jsx       # Scam check interface
│   │   ├── TokenList.jsx        # Token portfolio view
│   │   ├── TokenStats.jsx       # Token statistics
│   │   ├── VotingButton.jsx     # Vote on reports
│   │   ├── WalletInfo.jsx       # Wallet connection
│   │   └── UI/                  # Reusable UI components
│   │       ├── GlassCard.jsx
│   │       └── NeonButton.jsx
│   ├── utils/
│   │   ├── analytics.js         # Google Analytics
│   │   ├── approvals.js         # Approval detection logic
│   │   ├── community-api.js     # API client
│   │   ├── config.js            # Configuration validation
│   │   ├── reputation.js        # Reputation calculations
│   │   ├── revoke.js            # Approval revocation
│   │   ├── riskScoreData.js     # Risk scoring algorithm
│   │   ├── solana.js            # Solana utilities
│   │   └── tokens.js            # Token fetching
│   ├── App.js                   # Main application
│   └── index.js                 # Entry point
├── docs/
│   └── METRICS.md               # Live metrics tracking
├── config-overrides.js          # Webpack customization
├── vercel.json                  # Vercel deployment config
├── setup_db.sql                 # Database schema
└── package.json
```

---

## 🔧 Configuration

### Webpack Configuration
The project uses `react-app-rewired` to customize webpack without ejecting. This is necessary for Solana web3.js polyfills.

See `config-overrides.js` for:
- Buffer polyfills
- Crypto polyfills
- Stream polyfills
- Process polyfills

### Vercel Configuration
The `vercel.json` file configures:
- Serverless function settings (1024MB memory, 10s timeout)
- API route rewrites
- Security headers (XSS, clickjacking, MIME-sniffing protection)
- CORS headers for API endpoints
- Cron job for rate limit cleanup (daily at midnight)

---

## 🎨 Design System

GuardSol uses a custom "NEON SHIELD" design system:

### Colors
- **Primary**: Cyan/Blue neon (`#00f0ff`, `#0066ff`)
- **Secondary**: Purple/Pink accents (`#9333ea`, `#ec4899`)
- **Success**: Green (`#10b981`)
- **Warning**: Yellow (`#f59e0b`)
- **Danger**: Red (`#ef4444`)
- **Background**: Dark gradients (`#0a0a1a` to `#1a1a2e`)

### Components
- **GlassCard**: Glassmorphism container with backdrop blur
- **NeonButton**: Glowing buttons with hover effects
- **CircularProgress**: Animated progress indicators
- **LoadingSpinner**: Smooth loading animations

---

## 🔐 Security Features

### Smart Contract Security
- **Approval Detection**: Scans for token approvals that could drain wallets
- **Risk Analysis**: Multi-factor risk scoring algorithm
- **Revocation**: Safe approval revocation through Solana token program

### API Security
- **Rate Limiting**: Prevents abuse and spam
- **Input Validation**: All inputs sanitized and validated
- **SQL Injection Protection**: Parameterized queries via Supabase
- **CORS Protection**: Configured for secure cross-origin requests

### Database Security
- **Row Level Security (RLS)**: Database-level access control
- **Public Read, Authenticated Write**: Secure data access patterns
- **Encrypted Connections**: All database connections use SSL

---

## 📊 How It Works

### 1. Wallet Risk Scoring

The risk score is calculated based on:

```javascript
Risk Score = (
  Wallet Age Score (25%) +
  Transaction Count Score (25%) +
  Approval Count Score (25%) +
  Community Report Score (25%)
)
```

- **0-30**: 🟢 Low Risk (Safe)
- **31-60**: 🟡 Medium Risk (Caution)
- **61-100**: 🔴 High Risk (Dangerous)

### 2. Approval Scanning

1. Fetches all tokens in wallet
2. Checks each token for granted approvals
3. Analyzes approval amounts and delegates
4. Flags suspicious or unlimited approvals
5. Provides one-click revocation

### 3. Community Reporting

1. **Submit Report**: User reports suspicious wallet with evidence
2. **Community Vote**: Other users vote to verify or reject
3. **Reputation Impact**: Accurate reports increase reputation, false reports decrease it
4. **Admin Verification**: Admins can verify reports for immediate effect
5. **Dispute Process**: Incorrect reports can be challenged with evidence

### 4. Reputation System

- **Starting Score**: 0 points
- **Accurate Report**: +10 points
- **False Report**: -5 points
- **Helpful Vote**: +2 points
- **Disputed Report Upheld**: +5 points
- **Disputed Report Overturned**: -10 points

---

## 🌐 API Endpoints

All API endpoints are serverless functions deployed on Vercel:

### `POST /api/check-scam`
Check if a wallet address has been reported as a scam.

**Request:**
```json
{
  "address": "wallet_address_here"
}
```

**Response:**
```json
{
  "isScam": true,
  "reports": [...],
  "verifiedCount": 5
}
```

### `POST /api/report-scam`
Submit a new scam report.

**Request:**
```json
{
  "walletAddress": "scam_wallet_address",
  "reporterAddress": "reporter_wallet_address",
  "reason": "Phishing attempt",
  "evidenceLink": "https://...",
  "category": "phishing"
}
```

### `POST /api/vote-report`
Vote on a pending report.

**Request:**
```json
{
  "reportId": "uuid",
  "voterAddress": "voter_wallet_address",
  "voteType": "verify"
}
```

### `GET /api/get-stats`
Get network statistics.

**Response:**
```json
{
  "totalReports": 150,
  "verifiedReports": 120,
  "pendingReports": 30,
  "activeVoters": 45,
  "networkHealth": 95
}
```

---

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Configure Environment Variables**

In Vercel Dashboard → Settings → Environment Variables, add:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_SOLANA_NETWORK`
- `REACT_APP_RPC_ENDPOINT` (optional)
- `REACT_APP_GA_TRACKING_ID` (optional)

5. **Redeploy** after adding environment variables

### Custom Domain (Optional)

In Vercel Dashboard → Settings → Domains, add your custom domain.

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Connect wallet (Phantom, Solflare, etc.)
- [ ] View wallet risk score
- [ ] Scan for token approvals
- [ ] Revoke an approval
- [ ] Submit a scam report
- [ ] Vote on a report
- [ ] Check admin panel
- [ ] Test dispute submission
- [ ] Verify network stats display
- [ ] Test manual address lookup
- [ ] Export risk report as PDF
- [ ] Share results

### Test on Different Networks

```bash
# Devnet (for testing)
REACT_APP_SOLANA_NETWORK=devnet npm start

# Mainnet (production)
REACT_APP_SOLANA_NETWORK=mainnet-beta npm start
```

---

## 📈 Roadmap

### ✅ Completed (v1.0)
- [x] Wallet connection and risk scoring
- [x] Token approval scanner with revocation
- [x] Community scam reporting system
- [x] Voting and verification mechanism
- [x] Admin panel for report management
- [x] Reputation system
- [x] Dispute resolution
- [x] Network statistics dashboard
- [x] NEON SHIELD UI theme
- [x] Vercel deployment
- [x] Analytics integration

### 🚧 In Progress (v1.1)
- [ ] NFT approval scanning
- [ ] Email notifications for reports
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Advanced analytics dashboard

### 🔮 Future (v2.0)
- [ ] AI-powered scam detection
- [ ] Integration with other blockchains (Ethereum, Polygon)
- [ ] Automated approval monitoring
- [ ] Telegram/Discord bot
- [ ] API for third-party integrations
- [ ] Premium features for power users

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs
1. Check if the bug is already reported in [Issues](https://github.com/yourusername/guardsol/issues)
2. Create a new issue with detailed reproduction steps
3. Include screenshots and error messages

### Suggesting Features
1. Open a new issue with the "feature request" label
2. Describe the feature and its use case
3. Explain why it would benefit users

### Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style
- Use ESLint and Prettier (configured in project)
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Solana Foundation** - For the amazing blockchain infrastructure
- **Supabase** - For the powerful backend platform
- **Vercel** - For seamless deployment
- **Solana Community** - For feedback and support
- **All Contributors** - Thank you for making GuardSol better!

---

## 📞 Contact & Support

- **Website**: [https://guardsol-js1arycwh-chandanamandarapus-projects.vercel.app](https://guardsol-js1arycwh-chandanamandarapus-projects.vercel.app)
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/guardsol/issues)
- **Twitter**: [@GuardSol](https://twitter.com/guardsol) (coming soon)
- **Discord**: [Join our community](https://discord.gg/guardsol) (coming soon)

---

## 💡 Why GuardSol?

In the fast-moving world of crypto, security is everything. We built GuardSol because we saw too many people lose their hard-earned crypto to scams and malicious approvals. 

**Our mission**: Make Solana the safest blockchain ecosystem by empowering users with transparency, control, and community protection.

Every wallet scan, every report, every vote makes the network safer for everyone. Join us in building a more secure Solana.

---

## ⭐ Star Us!

If GuardSol helped protect your wallet, please consider:
- ⭐ Starring this repository
- 🐦 Sharing on Twitter
- 📢 Telling your friends
- 🤝 Contributing to the project

**Together, we can make Solana safer for everyone.**

---

<div align="center">

**Built with ❤️ for the Solana community**

[Live Demo](https://guardsol-js1arycwh-chandanamandarapus-projects.vercel.app) • [Report Bug](https://github.com/yourusername/guardsol/issues) • [Request Feature](https://github.com/yourusername/guardsol/issues)

</div>
