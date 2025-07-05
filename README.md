# TrustLedger: External Verification Infrastructure for AI & Autonomous Systems

> A blockchain-based verification infrastructure that checks AI-generated claims against external evidence sources and creates permanent, auditable trust records on Flow blockchain - built for AI & Autonomous Infrastructure.

## 🎯 The Problem We Solve

**AI systems make claims, but how do we verify they're actually true?**

- 🤖 **AI hallucinates** 15-30% of the time, even GPT-4
- 📈 **83% of people** can't distinguish AI content from human content
- ⚡ **Misinformation spreads 6x faster** than verified truth
- 🔄 **AI self-validation** amplifies hallucinations instead of catching them

Current solutions either rely on AI validating itself (unreliable) or humans checking everything (doesn't scale). **We have built an external verification system.**

## 🚀 Our Solution: External Evidence Verification

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

## 🌊 Flow Integration & EVM++ Benefits

### **What We Integrated with Flow:**

- **✅ Cadence Smart Contracts**: Deployed `ClaimVerifier.cdc` on Flow Testnet
- **✅ Walletless Authentication**: Zero-friction user onboarding using Flow's native walletless auth
- **✅ FCL Integration**: Complete Flow Client Library implementation with proper cryptographic signing

### **How We Did It:**

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

## 🏗️ Technical Architecture

### **Frontend (React + Vite)**

- Modern, responsive UI with Tailwind CSS and Lucide React icons
- Real-time verification flow with loading states and error handling
- Seamless blockchain interaction (users don't know they're using Web3)
- Flow Explorer integration for transaction transparency
- Two-step process: Verify claim, then optionally ledge to blockchain

### **External Evidence Verification Process**

```javascript
// 1. Generate query to find relevant evidence (AI helps with query generation)
const contextPrompt = `Generate SPARQL query to find evidence for: "${claim}"`;
const query = await callGemini(contextPrompt);

// 2. Query external database for factual evidence (NOT AI knowledge)
const response = await fetch(
  `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`
);

// 3. Compare claim against external evidence (AI helps with comparison)
const verdict = await callGemini(
  `Compare claim: "${claim}" against external evidence: ${wikidata_response}`
);
```

### **Blockchain Layer (Flow + Cadence)**

```cadence
// Smart contract stores external verification results
access(all) contract ClaimVerifier {
    access(all) struct Claim {
        access(all) let claim: String      // Original claim to verify
        access(all) let verdict: Bool      // Verification result based on external evidence
        access(all) let confidence: Int    // Confidence score (0-100)
        access(all) let source: String     // External evidence source (Wikidata)
    }

    access(all) fun addClaim(claim: String, verdict: Bool, confidence: Int, source: String) {
        // Creates permanent, auditable verification record
        let newClaim = Claim(claim: claim, verdict: verdict, confidence: confidence, source: source)
        self.claims.append(newClaim)
    }
}
```

## 🎯 Killer App Potential

### **Immediate Impact:**

- **Mass Market Appeal**: Anyone can verify any claim in 3 clicks
- **No Barriers**: Walletless = mainstream adoption without crypto friction
- **Real Problem**: Addresses $78B annual cost of misinformation globally
- **Viral Potential**: People share fact-checks constantly on social media

### **Scale Vision:**

- 🌍 **Consumer**: Instant claim verification with permanent verification records
- 🏢 **Enterprise**: AI companies integrate for external verification of their outputs
- 🌐 **Platform**: Social media platforms use for real-time external fact-checking
- 🤖 **AI Integration**: Autonomous AI systems can verify their claims against external evidence
- 📊 **Verification Infrastructure**: Becomes the external verification layer for AI claims
- 🎯 **AI & Autonomous Track**: Built specifically for Flow's AI & Autonomous Infrastructure challenge

### **Why Flow Was Essential:**

- **Walletless auth** = Zero barriers for mainstream adoption
- **Account linking** = Perfect for autonomous AI system integration
- **Gasless user experience** = Free verification creates autonomous trust systems
- **Cadence safety** = Secure, immutable trust records that can't be manipulated

## 🔗 Live Demo

- **🌐 Frontend**: [Deploy to get live URL] _(Add your deployment URL after deploying)_
- **⛓️ Smart Contract**: [`0xc87ca22251ccabb4`](https://testnet.flowdiver.io/account/0xc87ca22251ccabb4)
- **🧪 Test Transaction**: [`f05e15d6c1ab0641...`](https://testnet.flowdiver.io/tx/f05e15d6c1ab0641f963260be4153a1c6568abb789cc725ea78752226a01ac3f)

### **Try the Demo:**

1. Visit the app
2. Enter any claim (try: "The Eiffel Tower is 324 meters tall")
3. Watch system query Wikidata for external evidence
4. See claim compared against external facts (not AI knowledge)
5. Record the verification result permanently on Flow blockchain
6. **No wallet required!**

## 👥 Team

**[Your Name/Handle]** - _Full-stack developer & blockchain architect_

- GitHub: [@your-github]
- Twitter: [@your-twitter]
- _Passionate about building verification infrastructure for AI & autonomous systems_

## 🏆 Why This Wins "Most Killer App Potential"

### **✅ Submission Requirements Met:**

- **✅ Deployed on Flow**: Live smart contract on Flow Testnet
- **✅ Public & Free**: Anyone can use without barriers
- **✅ Original Work**: Novel AI + blockchain verification architecture
- **✅ Working Demo**: Full end-to-end functionality

### **✅ Required Technologies:**

- **✅ Cadence Contracts**: `ClaimVerifier.cdc` deployed and tested
- **✅ FCL Module**: Complete integration with walletless auth
- **✅ EVM++ Benefits**: Gasless user experience, batched operations capability

### **🎯 Killer App Criteria:**

- **✅ Consumer-oriented**: Anyone can use, zero crypto knowledge needed
- **✅ AI & Autonomous focus**: External verification infrastructure for autonomous AI systems
- **✅ Mass adoption ready**: Walletless onboarding removes all barriers
- **✅ Industry-defining potential**: Could become the external verification standard for AI systems

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

## 🔮 The Future

**This isn't just an app - it's external verification infrastructure for autonomous AI systems.**

When autonomous AI systems make claims, TrustLedger provides external verification against factual databases. When AI-generated content needs validation, TrustLedger creates auditable verification trails using external evidence. When autonomous AI systems need accountability, TrustLedger ensures every claim can be traced back to external sources.

**We're not building another dApp. We're building the verification infrastructure for AI & autonomous systems.**

---

_Built for Flow's "Most Killer App Potential" Challenge 2025 - AI & Autonomous Infrastructure Track_
