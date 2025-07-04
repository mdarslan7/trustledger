access(all) contract ClaimVerifier {

    access(all) struct Claim {
        access(all) let claim: String
        access(all) let verdict: Bool
        access(all) let confidence: Int
        access(all) let source: String

        init(claim: String, verdict: Bool, confidence: Int, source: String) {
            self.claim = claim
            self.verdict = verdict
            self.confidence = confidence
            self.source = source
        }
    }

    access(all) var claims: [Claim]

    access(all) fun getClaims(): [Claim] {
        return self.claims
    }

    access(all) fun getLastClaim(): Claim {
        return self.claims[self.claims.length - 1]
    }

    access(all) fun getClaimCount(): Int {
        return self.claims.length
    }

    access(all) fun addClaim(claim: String, verdict: Bool, confidence: Int, source: String) {
        let newClaim = Claim(
            claim: claim,
            verdict: verdict,
            confidence: confidence,
            source: source
        )
        self.claims.append(newClaim)
    }

    init() {
        self.claims = []
    }
}