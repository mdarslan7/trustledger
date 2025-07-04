import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import elliptic from "elliptic";
import { Buffer } from "buffer";
import pkg from "js-sha3";
const { sha3_256 } = pkg;
window.Buffer = Buffer;

const EC = new elliptic.ec("p256");

const PRIVATE_KEY = import.meta.env.VITE_FLOW_PRIVATE_KEY;
const ADDRESS = import.meta.env.VITE_FLOW_ADDRESS;
const KEY_INDEX = parseInt(import.meta.env.VITE_FLOW_KEY_INDEX || "0");

fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn");

const ecKey = EC.keyFromPrivate(PRIVATE_KEY, "hex");

export const authzFn = async (account = {}) => {
  const addr = fcl.sansPrefix(ADDRESS);
  const keyId = KEY_INDEX;

  return {
    ...account,
    addr,
    keyId,
    signingFunction: async (signable) => {
      const message = Buffer.from(signable.message, "hex");

      const hashedMessage = Buffer.from(sha3_256(message), "hex");

      const sig = ecKey.sign(hashedMessage);

      const signature = Buffer.concat([
        sig.r.toArrayLike(Buffer, "be", 32),
        sig.s.toArrayLike(Buffer, "be", 32),
      ]).toString("hex");

      return {
        addr: fcl.withPrefix(addr),
        keyId,
        signature,
      };
    },
  };
};

export async function publishClaim({ claim, verdict, confidence, source }) {
  try {
    const txId = await fcl
      .send([
        fcl.transaction`
        import ClaimVerifier from 0xc87ca22251ccabb4

        transaction(claim: String, verdict: Bool, confidence: Int, source: String) {
          prepare(acct: &Account) {
            ClaimVerifier.addClaim(claim: claim, verdict: verdict, confidence: confidence, source: source)
          }
        }
      `,
        fcl.args([
          fcl.arg(claim, t.String),
          fcl.arg(verdict, t.Bool),
          fcl.arg(confidence, t.Int),
          fcl.arg(source, t.String),
        ]),
        fcl.payer(authzFn),
        fcl.proposer(authzFn),
        fcl.authorizations([authzFn]),
        fcl.limit(100),
      ])
      .then(fcl.decode);

    console.log("Transaction submitted:", txId);

    // Wait for the transaction to seal
    const result = await fcl.tx(txId).onceSealed();
    console.log("Transaction sealed:", result);

    return txId;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

export async function getClaims() {
  const result = await fcl
    .send([
      fcl.script`
      import ClaimVerifier from 0xc87ca22251ccabb4

      access(all) fun main(): [ClaimVerifier.Claim] {
        return ClaimVerifier.getClaims()
      }
    `,
    ])
    .then(fcl.decode);

  return result;
}

export async function getClaimCount() {
  const result = await fcl
    .send([
      fcl.script`
      import ClaimVerifier from 0xc87ca22251ccabb4

      access(all) fun main(): Int {
        return ClaimVerifier.getClaimCount()
      }
    `,
    ])
    .then(fcl.decode);

  return result;
}
