# TrustLedger: External Verification Infrastructure for AI & Autonomous Systems

> TrustLedger is a Flow-based platform that verifies AI-generated claims using external evidence and stores the results permanently on the blockchain.

## 🎯 The Problem 

**AI systems make claims, but how do we verify they're actually true?**

- **AI hallucinates** 15-30% of the time, even GPT-4
- **83% of people** can't distinguish AI content from human content
- **Misinformation spreads 6x faster** than verified truth
- **AI self-validation** amplifies hallucinations instead of catching them

Current solutions either rely on AI validating itself (unreliable) or humans checking everything (doesn't scale). **We have built an external verification system.**

## 🚀 Solution: External Evidence Verification

**TrustLedger verifies claims against external evidence, not AI opinions - creating verification infrastructure for autonomous AI systems.**

**How it works:**

1. **User submits any claim** (AI-generated or human-made)
2. **System queries external databases** (Wikidata for now) for factual evidence
3. **Evidence is compared** to the original claim
4. **Verification result stored permanently** on Flow blockchain

**Key insight:** We use AI as a tool to fetch and compare data, but the verification comes from external evidence sources, not AI's internal knowledge. This creates autonomous verification infrastructure that AI systems can rely on.

TrustLedger creates this external verification system through a clear process:

```
User Submits Claim → Generate Evidence Query → Wikidata Database (external facts)
→ Compare Claim vs External Evidence → Flow Blockchain (permanent verification record)
```

### **Why This Approach Works:**

- ✅ **External evidence sources**: Uses Wikidata's 100M+ verified facts, not AI's memory
- ✅ **No AI self-validation**: AI helps fetch data, but verification comes from external sources
- ✅ **Immutable verification records**: Both TRUE and FALSE results stored permanently
- ✅ **Evidence-based verification**: Every result is backed by retrievable external data
- ✅ **Structured process**: Consistent, auditable verification workflow

## Flow Integration & Benefits

- **✅ Cadence Smart Contracts**: Deployed `ClaimVerifier.cdc` on Flow Testnet
- **✅ Walletless Authentication**: Zero-friction user onboarding using Flow's native walletless auth
- **✅ FCL Integration**: Complete Flow Client Library implementation with proper cryptographic signing

### **Implementation:**

```javascript
// Walletless authentication with proper Flow cryptography
export const authzFn = async (account = {}) => {
  return {
    signingFunction: async (signable) => {
      // SHA3-256 hashing + ECDSA P-256 signing (Flow's requirements)
      const message = Buffer.from(signable.message, "hex");
      const hashedMessage = Buffer.from(sha3_256(message), "hex");
      const sig = ecKey.sign(hashedMessage);
      // ... signature formatting
    },
  };
};
```

**The Result:** Anyone can verify claims and record them on blockchain **without downloading wallets, buying crypto, or understanding blockchain.**

## Technical Architecture & Tech Stack

### **AI Integration Layer (Google Gemini)**

- **Intelligent SPARQL Query Generation**: Gemini analyzes claims and generates precise Wikidata queries
- **Evidence-Based Comparison**: AI compares claims against external facts (not internal knowledge)
- **Confidence Scoring**: Smart assessment of verification reliability
- **Natural Language Processing**: Converts human claims into structured database queries

### **Frontend Stack (React + Vite)**

- Modern, responsive UI with Tailwind CSS and Lucide React icons
- Real-time verification flow with loading states and error handling
- Seamless blockchain interaction (users don't know they're using Web3)
- Flow Explorer integration for transaction transparency
- Two-step process: Verify claim, then optionally ledge to blockchain

### **Backend & External APIs**

- **Wikidata SPARQL Endpoint**: 100M+ verified facts database
- **Google Gemini API**: AI-powered query generation and evidence comparison
- **Flow RPC API**: Blockchain transaction processing
- **RESTful API Design**: Clean separation between verification and ledging

### **External Evidence Verification Process (AI-Powered)**

```javascript
// 1. AI-powered query generation for external evidence discovery
const contextPrompt = `Generate SPARQL query to find evidence for: "${claim}"`;
const query = await callGemini(contextPrompt); // Gemini creates precise Wikidata queries

// 2. Query external database for factual evidence (NOT AI's internal knowledge)
const response = await fetch(
  `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`
);

// 3. AI-powered evidence comparison against external facts
const comparisonPrompt = `Compare claim: "${claim}" against external evidence: ${wikidata_response}. 
Provide verdict (true/false) and confidence score (0-100).`;
const verdict = await callGemini(comparisonPrompt); // Gemini analyzes evidence, not opinions
```

### **Blockchain Layer (Flow + Cadence)**

```cadence
// Smart contract stores AI-verified external evidence results
access(all) contract ClaimVerifier {
    access(all) struct Claim {
        access(all) let claim: String      // Original claim to verify
        access(all) let verdict: Bool      // AI-verified result based on external evidence
        access(all) let confidence: Int    // AI confidence score (0-100)
        access(all) let source: String     // External evidence source (Wikidata)
        access(all) let evidence: String   // Raw external evidence data
    }

    access(all) fun addClaim(claim: String, verdict: Bool, confidence: Int, source: String, evidence: String) {
        // Creates permanent, auditable verification record with AI analysis
        let newClaim = Claim(
            claim: claim,
            verdict: verdict,
            confidence: confidence,
            source: source,
            evidence: evidence
        )
        self.claims.append(newClaim)
    }
}
```

### **Cryptographic & Security Layer**

- **SHA3-256 Hashing**: Flow-compliant cryptographic standards
- **ECDSA P-256 Signing**: Secure transaction authentication
- **Walletless Authentication**: Flow's native account linking
- **Immutable Records**: Blockchain-secured verification trails

### **Why Flow Was Essential:**

- **Walletless auth** -> Zero barriers for mainstream adoption
- **Account linking** -> Perfect for autonomous AI system integration
- **Cadence safety** -> Secure, immutable trust records that can't be manipulated

## 🔗 Live Demo

- **🌐 Frontend**: [`Demo URL`](https://trustledger.vercel.app/)
- **⛓️ Smart Contract**: [`0xc87ca22251ccabb4`](https://testnet.flowscan.io/contract/A.c87ca22251ccabb4.ClaimVerifier)
- **🧪 Test Transaction**: [`f05e15d6c1ab0641...`](https://testnet.flowdiver.io/tx/f05e15d6c1ab0641f963260be4153a1c6568abb789cc725ea78752226a01ac3f)

### **Try the Demo:**

1. Visit the app
2. Enter any claim (try: "Tokyo is the capital of Japan")
3. Watch system query Wikidata for external evidence
4. See claim compared against external facts (not AI knowledge)
5. Record the verification result permanently on Flow blockchain
6. **No wallet required!**

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/mdarslan7/trustledger

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Gemini API key and Flow credentials (private key, address, key index)

# Run the development server
npm run dev

# Test the smart contract
flow test cadence/tests/ClaimVerifier_test.cdc
```

## The Future

**This isn't just an app. It's external verification infrastructure for autonomous AI systems.**

The goal is that when autonomous AI systems make claims, TrustLedger provides external verification against factual databases. When AI-generated content needs validation, TrustLedger creates auditable verification trails using external evidence. When autonomous AI systems need accountability, TrustLedger ensures every claim can be traced back to external sources.

**We're not building another dApp. We're building the verification infrastructure for AI & autonomous systems.**

---

## Team
- **Md Arslan** – Full-stack Developer  
[`LinkedIn`](https://www.linkedin.com/in/mdarslan7/) [`X`](https://www.x.com/md_arslan7)

---

_Built for PL_Genesis: Modular Worlds Hackathon - AI & Autonomous Infrastructure Track_
