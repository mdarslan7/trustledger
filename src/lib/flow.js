import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import elliptic from "elliptic"
import { Buffer } from "buffer"
window.Buffer = Buffer // Ensure Buffer is available globally

const EC = new elliptic.ec("p256")

const PRIVATE_KEY = import.meta.env.VITE_FLOW_PRIVATE_KEY
const ADDRESS = import.meta.env.VITE_FLOW_ADDRESS.replace(/^0x/, "")
const KEY_INDEX = parseInt(import.meta.env.VITE_FLOW_KEY_INDEX || "0")

fcl.config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")

const ecKey = EC.keyFromPrivate(Buffer.from(PRIVATE_KEY, "hex"))

export const authzFn = async (account = {}) => {
  return {
    ...account,
    addr: fcl.sansPrefix(ADDRESS),
    keyId: KEY_INDEX,
    signingFunction: async (signable) => {
      const msg = Buffer.from(signable.message, "hex")
      const sig = ecKey.sign(msg)
      const signature = Buffer.concat([
        sig.r.toArrayLike(Buffer, "be", 32),
        sig.s.toArrayLike(Buffer, "be", 32),
      ]).toString("hex")

      return {
        addr: fcl.withPrefix(ADDRESS),
        keyId: KEY_INDEX,
        signature,
      }
    }
  }
}

export async function publishClaim({ claim, verdict, confidence, source }) {
  const txId = await fcl.send([
    fcl.transaction`
      import ClaimVerifier from 0xc87ca22251ccabb4

      transaction(claim: String, verdict: Bool, confidence: Int, source: String) {
        prepare(acct: AuthAccount) {
          ClaimVerifier.addClaim(claim: claim, verdict: verdict, confidence: confidence, source: source)
        }
      }
    `,
    fcl.args([
      fcl.arg(claim, t.String),
      fcl.arg(verdict === "verified", t.Bool),
      fcl.arg(confidence, t.Int),
      fcl.arg(source, t.String),
    ]),
    fcl.payer(authzFn),
    fcl.proposer(authzFn),
    fcl.authorizations([authzFn]),
    fcl.limit(100),
  ]).then(fcl.decode)

  return txId
}