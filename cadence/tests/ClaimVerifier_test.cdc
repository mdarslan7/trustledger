import Test
import "ClaimVerifier"

access(all)
fun setup() {
    let err = Test.deployContract(
        name: "ClaimVerifier",
        path: "../contracts/ClaimVerifier.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())
}

access(all)
fun testAddClaim() {
    ClaimVerifier.addClaim(
        claim: "The sky is blue",
        verdict: true,
        confidence: 90,
        source: "Nature"
    )
    Test.assertEqual(ClaimVerifier.getClaimCount(), 1)
}