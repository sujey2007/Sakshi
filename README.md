# SAKSHI — Digital Forensics & Evidence Chain-of-Custody Platform

> *Sakshi* (साक्षी) means **"witness"**: an impartial record that cannot be changed after the fact.

SAKSHI is a mobile-first (React Native / Expo) evidence management app for Indian police and forensic officers. It combines **tamper-evident blockchain sealing** (Ethereum Sepolia via Hardhat), a **digital chain-of-custody tracker**, an **immutable audit trail**, and **AI legal assistance** (Google Gemini) grounded in the new Indian criminal laws (BNS / BNSS / BSA).

---

## 📌 Problem Statement

Digital and physical evidence is the backbone of criminal investigations, yet in practice the way it is collected, stored and handed over is still largely **manual and paper-based**:

1. **Evidence tampering and integrity doubts.** Photos, videos, documents and device dumps can be altered, replaced or "lost" between the crime scene and the courtroom. Defence counsel routinely challenge evidence because its integrity cannot be proven.
2. **Broken chain of custody.** Hand-overs between field officers, the malkhana (evidence room), forensic labs and courts are logged in physical registers. Entries go missing, are filled in later, or are illegible, which breaks the legal chain of custody.
3. **Admissibility hurdles.** Electronic evidence needs a certificate under **Section 65B of the Indian Evidence Act** (now **Section 63 of the Bharatiya Sakshya Adhiniyam, 2023**). These certificates are drafted manually, often late, and are frequently rejected for procedural lapses.
4. **No accountability trail.** There is rarely a reliable record of *who* accessed *which* evidence, *when*, *where* and *why*, so insider misuse is hard to detect.
5. **Legal complexity after the 2023 reforms.** The IPC, CrPC and Evidence Act were replaced by the **BNS, BNSS and BSA**. Field officers need fast, accurate guidance on applicable sections and on correctly formatted seizure memos (Section 105 BNSS mandates audio-video recording of search and seizure).
6. **Fragmented team coordination.** Investigation squads, case diaries and daily reports live in separate notebooks and chat groups with no single source of truth.

**In short: there is no single, trustworthy, tamper-evident system that follows a piece of evidence from seizure to courtroom while keeping officers legally compliant.**

---

## 💡 Our Solution

SAKSHI turns every action on a piece of evidence into a **verifiable, time-stamped, attributable record**, and helps officers stay legally compliant through built-in AI.

| Problem | How SAKSHI addresses it |
|---|---|
| Evidence tampering | Evidence fingerprints (hashes) are written to the `EvidenceStore` smart contract on Ethereum Sepolia. Once written, they cannot be edited or deleted, so any later change to the file shows up as a hash mismatch. |
| Broken chain of custody | A digital **Custody Tracker** records originator, current custodian, location, witness and transfer reason for every item. Each hand-over requires the recipient's name, ID, designation, reason and new location. |
| Admissibility | **Section 65B / BSA Section 63 certificates** are auto-drafted for every uploaded item and can be viewed as a formatted certificate with digital signature. |
| No accountability | Every login and every unlock of a sensitive module is written to an **audit trail** answering *Who / What / When / Where / Why*. |
| Legal complexity | The **Sakshi AI Legal Assistant** answers questions on IPC/BNS, and the **Forensic Narrator** turns voice or typed crime-scene notes into a structured **Seizure Memo** (Section 105 BNSS) with the suspected BNS offence. |
| Team fragmentation | **Squad Initialization** lets officers form case teams, assign officers and file daily reports in one place. |
| Unauthorised access | Biometric login (Face ID / fingerprint), an admin-controlled officer registry, a re-authentication gate on sensitive modules, and a 10-minute idle auto-logout. |

---

## ✨ Key Features

### 🔐 Identity Portal (`LoginScreen`)
- Officer login with **Name + Credential Key** validated against the admin-managed registry.
- **Biometric login** (Face ID / fingerprint) via `expo-local-authentication`.
- Separate **Administrator** login.
- Each login is recorded in the audit trail.

### 🧭 Tactical Dashboard (`DashboardScreen`)
- Central hub for all modules.
- **Security gate**: opening a sensitive module requires the credential key again, and the access is logged.
- **Session timer** with automatic logout after 10 minutes.

### 📸 Secure Evidence Upload (`UploadScreen`)
- Start a new case or continue an existing one using a case reference ID, and declare the evidence quantity.
- Capture each evidence item with the device camera, together with **pre-seal and post-seal chain-of-custody** checkpoints.
- When complete, the case is sealed and a **QR code** linking to the on-chain record (Sepolia Etherscan) is generated.

### 📒 Case Diary (`CaseDiaryScreen`)
Four tabs for each case:
- **Timeline**: chronological, GPS-tagged and verified case events.
- **Vault**: all evidence items synced from local storage.
- **Certificates**: auto-drafted **Section 65B** certificates with a document preview.
- **Tracker**: live chain-of-custody with digital **custody transfer** (recipient, ID, designation, reason, location).

### ✅ Verification Gate (`QRScanScreen`)
- Scan an evidence QR code to confirm the evidence hash and its tamper-proof status, then jump to the audit trail.

### 🧾 Audit Trail (`AuditScreen`)
- A *Who / What / When / Where / Why* log of every login and module access, with a hash reference for each entry.

### 👮 Squad Initialization (`TeamManagementScreen`)
- Create investigation squads linked to a case ID, assign officers, edit or restore teams, and submit **daily reports**.

### 🤖 AI Forensic Intelligence (Google Gemini 2.5 Flash)
- **Legal Chatbot** (`LegalChatbot`): an assistant for Indian forensic officers that answers questions with reference to the **IPC** and the **Bharatiya Nyaya Sanhita (BNS)**.
- **Forensic Narrator** (`ForensicNarrator`): record a voice narration at the scene (`expo-av`) or type raw notes. The AI returns:
  - the suspected offence (BNS section)
  - the extracted location
  - a formal **Seizure Memo** (Section 105 BNSS)
  - chain-of-custody recommendations

### 🛡️ Admin Command Center (`AdminDashboardScreen`)
- Master-key protected.
- Enrol and authorise officers into the registry.
- View authorised personnel, the case registry and the evidence handling timeline.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                 SAKSHI Mobile App (React Native / Expo)          │
│                                                                  │
│  Login ─► Dashboard ─► Upload │ Case Diary │ QR Verify │ Audit   │
│   (Biometric)  (Security Gate)  Teams │ Legal AI │ Narrator      │
│                                                                  │
│  AuthContext + AsyncStorage (session, officer registry,          │
│  audit trail, evidence vault, teams)                             │
└───────────┬─────────────────────┬──────────────────┬─────────────┘
            │ ethers.js           │ REST             │ Firebase SDK
            ▼                     ▼                  ▼
┌──────────────────────┐  ┌─────────────────┐  ┌───────────────────┐
│ EvidenceStore.sol    │  │ Google Gemini   │  │ Firebase Auth     │
│ Ethereum Sepolia     │  │ 2.5 Flash API   │  │ (OTP setup)       │
│ (Hardhat)            │  │ Legal AI and    │  │                   │
│ immutable hashes     │  │ Seizure Memo    │  │                   │
└──────────────────────┘  └─────────────────┘  └───────────────────┘
            ▲
            │ optional relay
┌──────────────────────┐
│ backend/scripts/     │
│ server.js (Express)  │
│ POST /store          │
└──────────────────────┘
```

### Evidence lifecycle

```
Seize ─► Capture (camera) ─► Hash ─► Seal on blockchain ─► QR code generated
  ─► Custody transfers logged ─► 65B certificate drafted ─► Verified in court via QR / hash
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native 0.81, Expo SDK 54, React 19, React Navigation (stack) |
| Device features | `expo-camera`, `expo-image-picker`, `expo-av` (audio), `expo-local-authentication` (biometrics), `expo-location`, `expo-crypto`, `expo-document-picker` |
| Local persistence | `@react-native-async-storage/async-storage` |
| Blockchain | Solidity 0.8.28, Hardhat, ethers.js (v6 in the backend, v5 in the app), Ethereum **Sepolia** testnet, TypeChain |
| AI | Google **Gemini 2.5 Flash** (`generativelanguage.googleapis.com`) |
| Auth / cloud | Firebase Auth (OTP setup) |
| Backend relay | Node.js, Express, CORS, dotenv |
| QR | `react-native-qrcode-svg` |
| Build / distribution | EAS Build (`eas.json`), Expo Updates, native Android project |

### 🧊 Explore the stack in 3D

Open **[`docs/stack-explorer.html`](docs/stack-explorer.html)** in any browser. To view it from GitHub, download the file or use GitHub Pages. The page gives you:

- **A 3D model of the stack.** Drag to rotate and scroll to zoom. The five layers are Interface, Device, Intelligence, Identity & data, and Blockchain. Click any block to see what it does in SAKSHI, why it was chosen, and which files use it.
- **"Trace an evidence item".** An animated packet follows one piece of evidence from camera → SHA-256 → vault → ethers.js → `EvidenceStore` → Sepolia → QR tag.
- **A tamper test.** A small in-browser blockchain that uses real SHA-256. Seal an item, then change it or rewrite an old block, and the check fails.
- **A section on the models SAKSHI uses and why.**

### Why each layer was chosen

| Layer | Technology | Why it was chosen |
|---|---|---|
| Interface | React Native + Expo | One JavaScript codebase for Android and iOS. Expo provides ready modules for camera, audio, biometrics and files, plus cloud builds (EAS) and over-the-air updates. |
| Device | expo-image-picker / camera, expo-av, expo-local-authentication, expo-crypto | Evidence is captured inside the app instead of coming from the gallery. Voice narration is quicker than typing at a scene. Biometrics tie the session to the person holding the phone. Hashing on the device fingerprints the file before it goes anywhere. |
| Intelligence | Gemini 2.5 Flash | Understands audio directly, responds quickly, costs little per call and handles Indian languages (see below). |
| Identity & data | Firebase Auth, AsyncStorage, AuthContext | Managed OTP sign-in, offline-first local records in the field, and a who/what/when/where/why audit trail. |
| Blockchain | Solidity, Hardhat, ethers.js, Ethereum Sepolia, Express relay | An append-only public ledger that nobody can edit. Hardhat is the standard tool to compile, test and deploy the contract. Sepolia is free and runs the same EVM as mainnet. |

---

## 📁 Project Structure

```
Sakshi/
├── backend/                        # Smart contracts and blockchain tooling (Hardhat)
│   ├── contracts/
│   │   ├── EvidenceStore.sol       # Stores evidence hashes on-chain
│   │   └── Counter.sol             # Hardhat sample contract
│   ├── scripts/
│   │   ├── deploy.js               # Deploys EvidenceStore
│   │   ├── server.js               # Express relay: POST /store, writes hash on-chain
│   │   └── send-op-tx.ts           # Sample OP transaction script
│   ├── ignition/modules/           # Hardhat Ignition deployment modules
│   ├── test/                       # Contract tests
│   ├── types/ethers-contracts/     # TypeChain-generated typings
│   └── hardhat.config.js           # Sepolia network configuration
│
└── frontend/                       # React Native / Expo mobile app
    ├── App.js                      # Root navigator (all screens)
    ├── app.json / eas.json         # Expo and EAS build config
    ├── android/                    # Native Android project
    └── src/
        ├── context/AuthContext.js  # Session management
        ├── navigation/             # Alternate navigator
        ├── services/
        │   ├── blockchainService.js  # sealEvidenceOnChain()
        │   └── firebaseConfig.js     # Firebase Auth init
        └── screens/
            ├── auth/          LoginScreen
            ├── dashboard/     DashboardScreen
            ├── admin/         AdminDashboardScreen
            ├── upload/        UploadScreen
            ├── caseDiary/     CaseDiaryScreen
            ├── verify/        QRScanScreen
            ├── LogAudit/      AuditScreen
            ├── audit/         AuditLogScreen
            ├── teams/         TeamManagementScreen
            └── ai/            LegalChatbot, ForensicNarrator
```

---

## ⛓️ Smart Contract: `EvidenceStore.sol`

```solidity
contract EvidenceStore {
    mapping(uint256 => string) private evidenceHashes;
    uint256 public evidenceCount;

    function storeEvidence(string memory _hash) public;           // append-only
    function getEvidence(uint256 _id) public view returns (string memory);
}
```

- **Append-only**: there is no update or delete function, so a stored hash is permanent.
- **Public verifiability**: anyone (a court, the defence, an auditor) can read a hash by its ID and compare it with the hash of the presented evidence file.

---

## 🔗 How the Blockchain Works in SAKSHI

SAKSHI never puts the photo or file on the blockchain. It stores only the file's **fingerprint**, a SHA-256 hash.

```
 Officer's phone                         Ethereum Sepolia (public, Proof of Stake)
┌──────────────────┐   signed tx      ┌───────────────────────────────────────────┐
│ 1. Capture photo │ ───────────────► │ Block N-1 ◄── Block N ◄── Block N+1 ...   │
│ 2. SHA-256 hash  │   ethers.js      │             storeEvidence("9f2c…e41a")    │
│ 3. Sign with key │                  │             evidenceCount = 42            │
└──────────────────┘                  └───────────────────────────────────────────┘
        ▲                                                │
        │   5. Verify: re-hash the file, then call getEvidence(42) (free read)
        └──────────────── match = untouched · mismatch = tampered ┘
```

1. **Capture.** The officer photographs the item in Evidence Upload. The case ID, time and custody checkpoints are attached.
2. **Fingerprint.** The file is reduced to a 64-character SHA-256 hash. The same file always gives the same hash, and a change to a single pixel gives a completely different one.
3. **Sign.** `ethers.js` builds a transaction and signs it with the sealing wallet's key.
4. **Seal.** Sepolia validators include the transaction in a block (one slot every ~12 s). `storeEvidence(hash)` increments `evidenceCount` and stores the hash under that ID permanently.
5. **Verify.** In court, anyone re-hashes the presented file and calls `getEvidence(id)`. If the hashes match, the evidence is exactly what was seized. The QR code on the evidence tag links to the record on Etherscan.

**Why tampering is detectable:** each block contains the hash of the block before it. Rewriting an old record changes that block's hash and breaks every later link. Under Proof of Stake, a rewrite would also require outvoting the honest validators, who would lose their staked ETH for trying.

**Why a blockchain instead of a normal database:**
- No admin, police officer or SAKSHI developer can edit or delete a sealed record.
- Courts and the defence can verify evidence independently, without trusting police servers.
- Every seal carries a public, trusted timestamp, which strengthens the chain of custody.

**Why only the hash goes on chain:**
- Storing files on Ethereum is expensive.
- It would make sensitive images public.
- A 32-byte hash is cheap, private and enough to prove the file is intact.

**Why Sepolia:** test ETH is free, and Sepolia runs the same EVM as Ethereum mainnet. The contract can move unchanged to mainnet, Polygon (the relay already reads a `POLYGON_RPC_URL`) or a government-run permissioned chain.

---

## 🤖 Models Used and Why

| Model | Where | What it does |
|---|---|---|
| **Google Gemini 2.5 Flash** (AI) | `LegalChatbot.js` | Answers officers' legal questions, prompted as *"an AI legal assistant for Indian forensic officers"* answering from the **IPC** and the **Bharatiya Nyaya Sanhita (BNS)**. |
| **Google Gemini 2.5 Flash** (AI, multimodal) | `ForensicNarrator.js` | Takes a voice recording (sent as base64 audio) or typed notes and returns a **Seizure Memo** under **Section 105 BNSS** with the suspected **BNS offence**, the location, memo details and chain-of-custody recommendations. |
| **SHA-256** (hash function) | Evidence fingerprint | Gives each file a unique 64-character fingerprint, which is the value sealed on chain. |
| **Proof of Stake** (consensus) | Ethereum Sepolia | Validators stake ETH to agree on blocks, which makes sealed records practically impossible to rewrite. |
| **Append-only ledger** (data model) | `EvidenceStore.sol` | `mapping(uint256 => string)` plus a counter, with no update or delete functions. |

**Why Gemini 2.5 Flash:**
- **Native audio understanding.** A voice note goes straight to the model, with no separate speech-to-text service to run or pay for.
- **Low latency.** Flash is Google's fast tier, which matters to an officer standing at a crime scene.
- **Low cost per request,** which suits a prototype with many field users.
- **Multilingual.** Officers can narrate in Hindi and other Indian languages.
- **Simple integration.** One HTTPS `generateContent` call made with `fetch` from the app, with no SDK or extra server.

> AI output is a **draft**. An officer must review the suggested BNS sections and memo before they enter the case diary.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or later and npm
- Expo CLI (`npx expo`) and the Expo Go app, or an Android/iOS emulator
- A Sepolia RPC URL and a funded Sepolia test wallet
- A Google Gemini API key

### 1. Backend: compile and deploy the contract

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=<your_sepolia_test_wallet_private_key>
ETHERSCAN_API_KEY=<optional>
```

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Note the printed contract address.

Optional relay server (`node scripts/server.js`) expects `POLYGON_RPC_URL`, `PRIVATE_KEY` and `CONTRACT_ADDRESS`, and requires `express` and `cors` to be installed.

### 2. Frontend: run the mobile app

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
EXPO_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
EXPO_PUBLIC_CONTRACT_ADDRESS=<deployed_contract_address>
GEMINI_API_KEY=<your_gemini_api_key>
```

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android or `w` for web.

### 3. First use
1. Log in as **Administrator** and enrol officers (name and credential key) in the registry.
2. Log out, then log in as an officer, or use biometric login.
3. Open **Upload** to start a case, capture evidence and seal it.
4. Use **Case Diary** to view the timeline, vault, 65B certificates and custody transfers.
5. Use **Verify** to scan evidence QR codes, and **Audit** to review every access.
6. Use **Legal AI** and **Forensic Narrator** for legal guidance and seizure memos.

---

## ⚠️ Current Status and Roadmap

SAKSHI is a **hackathon prototype**. Some parts are simulated for the demo:

- The officer registry, audit trail, teams and evidence vault are stored on the device (AsyncStorage). They should move to a secured backend database.
- Audit-log hashes and the QR scan are simulated. Real SHA-256 hashing of evidence files (`expo-crypto`) and live camera QR scanning are planned.
- The ABIs used by the app (`sealEvidence`) and by the relay (`storeEvidence(string,string,uint256)`) do not yet match the deployed `EvidenceStore` (`storeEvidence(string)`). They need to be unified.
- **Security:** blockchain signing keys and API keys must never be bundled in the mobile app. They belong behind the backend relay, with secrets in environment variables that are **not committed**. Add `.env` to `.gitignore` and rotate any keys that were committed.

**Planned:** IPFS or encrypted cloud storage for the evidence files, role-based access (Investigating Officer / Malkhana In-charge / FSL / Court), multi-signature custody hand-over, offline-first sync, and integration with CCTNS.

---

## 🤝 Team

Built by **Team HackHive**.

## 📄 License

The smart contracts are licensed under MIT (see the SPDX headers).
