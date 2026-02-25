# 🛡️ ProofSnap — Proof-of-Capture & Media Authentication

> **Capture. Hash. Sign. Verify. Trust.**

ProofSnap is a mobile application that combats deepfakes and media manipulation by generating cryptographic proofs at the moment of capture, anchoring them on the **DataHaven blockchain**, syncing to **Supabase cloud**, and running AI-powered authenticity detection.

---

## 🏗️ Architecture

```
┌──────────────────────────────────┐
│        Mobile App (Expo)         │
│  ┌─────────┐  ┌───────────────┐  │
│  │  Camera  │  │  Crypto       │  │
│  │ Capture  │  │  SHA-256 +    │  │
│  │          │  │  Ed25519      │  │
│  └────┬─────┘  └──────┬───────┘  │
│       │               │          │
│  ┌────▼───────────────▼───────┐  │
│  │   Verification Pipeline    │  │
│  │  1. Hash → 2. Sign →      │  │
│  │  3. DataHaven Anchor →    │  │
│  │  4. AI Detection →        │  │
│  │  5. Plagiarism →          │  │
│  │  6. Trust Score →         │  │
│  │  7. Watermark →           │  │
│  │  8. Supabase Cloud Sync   │  │
│  └────┬───────────────────────┘  │
└───────│──────────────────────────┘
        │
   ┌────▼────────────────┐   ┌────────────────┐
   │  DataHaven Testnet  │   │ Supabase Cloud │
   │  (Substrate + EVM)  │   │ PostgreSQL +   │
   │  Chain ID: 55931    │   │ Object Storage │
   │  Smart Contract     │   └────────────────┘
   └─────────────────────┘
        │
   ┌────▼────────────────┐
   │  ProofSnap API      │
   │  (Express.js)       │
   │  AI + Plagiarism    │
   └─────────────────────┘
```

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📸 **Proof-of-Capture** | Hash media at capture time using SHA-256 |
| ✍️ **Digital Signatures** | Ed25519 key pair signing per device |
| ⛓️ **DataHaven Anchoring** | Immutable proof on DataHaven blockchain (EVM) |
| ☁️ **Supabase Cloud Sync** | Proof records synced to PostgreSQL + Object Storage |
| 🤖 **AI Deepfake Detection** | SightEngine API for deepfake & AI-gen detection |
| 🔍 **Plagiarism Check** | Reverse image similarity analysis |
| 📊 **Trust Score** | 0-100 score with S/A/B/C/F grading |
| 💧 **Watermarking** | Visible & invisible provenance watermarks |
| 🌙 **Dark/Light Theme** | Automatic system theme detection |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Expo CLI (`npm install -g expo-cli`)
- Android device or emulator (Expo Go)

### Installation

```bash
# Navigate to project
cd ProofSnap

# Install dependencies
npm install

# Start the dev server
npx expo start
```

### Running on Device
1. Install **Expo Go** from Play Store / App Store
2. Scan the QR code from the terminal
3. The app will load on your device

### Backend Server (Optional)
```bash
cd server
npm install
npm run dev
```

> Without the backend, AI detection returns realistic simulated results.

## 📁 Project Structure

```
ProofSnap/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout & auth routing
│   ├── onboarding.tsx      # 3-page onboarding pager
│   ├── (tabs)/             # Main tab navigation
│   │   ├── _layout.tsx     # Tab bar config
│   │   ├── index.tsx       # Home dashboard
│   │   ├── capture.tsx     # Camera & verification
│   │   ├── gallery.tsx     # Media gallery grid
│   │   └── profile.tsx     # Profile & settings
│   └── verify/
│       └── [id].tsx        # Verification detail view
├── components/             # Reusable UI components
│   ├── TrustBadge.tsx      # Grade badge component
│   ├── TrustScoreCircle.tsx # Animated score circle
│   ├── VerificationSteps.tsx # Step timeline
│   └── MediaCard.tsx       # Grid & list cards
├── lib/                    # Business logic
│   ├── crypto.ts           # Key gen, hashing, signing
│   ├── db.ts               # SQLite database layer
│   ├── blockchain.ts       # DataHaven EVM interaction
│   ├── supabase.ts         # Supabase cloud integration
│   ├── ai-detection.ts     # AI deepfake detection
│   ├── trust-score.ts      # Trust scoring algorithm
│   ├── watermark.ts        # Watermarking engine
│   ├── pipeline.ts         # 8-step verification orchestrator
│   └── types.ts            # TypeScript interfaces
├── stores/
│   └── media-store.ts      # Zustand state management
├── hooks/
│   └── useThemeColors.ts   # Theme hook
├── constants/
│   ├── Colors.ts           # Theme & config constants
│   └── abi.ts              # Smart contract ABI
├── contracts/
│   └── MediaProof.sol      # Solidity smart contract
├── server/                 # Backend API
│   ├── index.js            # Express server
│   ├── package.json
│   └── README.md
└── app.json                # Expo configuration
```

## 🔐 Security Architecture

### Cryptographic Pipeline
1. **SHA-256 Hash** — Computed from raw file bytes at capture time
2. **Ed25519 Signature** — Private key signs the hash (key stored in SecureStore)
3. **Blockchain Anchor** — Hash + signature stored on DataHaven immutably
4. **Supabase Sync** — Proof record synced to PostgreSQL cloud database
4. **Any modification** to the file changes the hash → broken chain of trust

### Key Storage
- Private keys: `expo-secure-store` (hardware-backed keychain)
- Public keys: Local SQLite DB + on-chain
- Wallet: Ethereum wallet via `ethers.js`

## 📊 Trust Score Algorithm

| Factor | Impact |
|--------|--------|
| Deepfake score > 0.5 | -40 points |
| AI-generated > 0.5 | -30 points |
| Hash mismatch | -50 points |
| Signature invalid | -30 points |
| No blockchain proof | -10 points |
| Plagiarism > 50% | -20 points |
| Has metadata | +2 bonus |

### Grades
- **S** (95-100) — Pristine, cryptographically perfect
- **A** (80-94) — Verified authentic
- **B** (60-79) — Minor concerns
- **C** (40-59) — Significant issues
- **F** (0-39) — Failed verification

## ⛓️ Smart Contract Deployment (DataHaven)

1. Open [Remix IDE](https://remix.ethereum.org)
2. Paste `contracts/MediaProof.sol`
3. Compile with Solidity 0.8.20
4. Add DataHaven Testnet to MetaMask:
   - **RPC:** `https://services.datahaven-testnet.network/testnet`
   - **Chain ID:** `55931`
   - **Symbol:** `MOCK`
5. Get test MOCK tokens from [DataHaven Faucet](https://apps.datahaven.xyz/faucet)
6. Deploy via MetaMask (DataHaven Testnet)
7. Update `CONTRACT_ADDRESS` in `constants/Colors.ts`

## ☁️ Supabase Setup (Optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `lib/supabase.ts` comments in the SQL Editor
3. Copy your project URL and anon key
4. Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `constants/Colors.ts`
5. For the backend server, set `SUPABASE_URL` and `SUPABASE_KEY` env vars

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 54 + React Native 0.81 |
| Routing | expo-router v6 |
| State | Zustand v5 |
| Crypto | expo-crypto + @noble/ed25519 |
| Blockchain | ethers v6 + DataHaven Testnet (EVM) |
| Cloud | Supabase (PostgreSQL + Object Storage) |
| AI Detection | SightEngine API |
| Database | expo-sqlite v16 |
| Key Storage | expo-secure-store |
| Animations | react-native-reanimated v4 |
| Camera | expo-camera v17 |

## 💰 Cost

**$0** — Everything uses free tiers:
- Expo (free)
- DataHaven Testnet (free MOCK tokens from faucet)
- Supabase free tier (500 MB database, 1 GB storage)
- Render.com free tier (backend)
- SightEngine free tier (500 ops/month)

## 📄 License

MIT — Built for HackSRM Hackathon
