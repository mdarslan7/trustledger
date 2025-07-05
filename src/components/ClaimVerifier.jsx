import { useState } from "react";
import { verifyClaim } from "../lib/verifyClaim";
import { publishClaim } from "../lib/flow";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Database,
  Loader2,
} from "lucide-react";

export default function ClaimVerifier() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [ledging, setLedging] = useState(false);
  const [ledgeResult, setLedgeResult] = useState(null);

  const handleVerify = async () => {
    if (!claim.trim()) return;
    setLoading(true);
    setResult(null);
    setLedgeResult(null);
    const res = await verifyClaim(claim);
    setResult(res);
    setLoading(false);
  };

  const handleLedge = async () => {
    if (!result) return;
    setLedging(true);
    try {
      const txId = await publishClaim({
        claim: claim,
        verdict: result.verified,
        confidence: result.confidence,
        source: result.source,
      });
      setLedgeResult({
        success: true,
        txId: txId,
        message: "Claim successfully recorded on Flow blockchain!",
      });
    } catch (error) {
      console.error("Error ledging claim:", error);
      setLedgeResult({
        success: false,
        error: error.message,
        message: "Failed to record claim on blockchain. Please try again.",
      });
    }
    setLedging(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleVerify();
    }
  };

  const getVerificationIcon = () => {
    if (result?.verified) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (result?.verified === false) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return <AlertCircle className="w-5 h-5 text-amber-600" />;
  };

  const getVerificationColor = () => {
    if (result?.verified) return "border-green-200 bg-green-50";
    if (result?.verified === false) return "border-red-200 bg-red-50";
    return "border-amber-200 bg-amber-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            TrustLedger
          </h1>
          <p className="text-slate-600">
            Verify the accuracy of claims using reliable sources
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Input Section */}
          <div className="p-6 border-b border-slate-100">
            <label
              htmlFor="claim-input"
              className="block text-sm font-medium text-slate-700 mb-3"
            >
              Enter your claim
            </label>
            <div className="relative">
              <textarea
                id="claim-input"
                placeholder="Type the claim you want to verify..."
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-slate-900 placeholder-slate-400"
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                {claim.length}/500
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="p-6">
            <button
              onClick={handleVerify}
              disabled={loading || !claim.trim()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying claim...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Verify Claim
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          {result && (
            <div
              className={`mx-6 mb-6 rounded-xl border-2 ${getVerificationColor()} transition-all duration-500`}
            >
              <div className="p-6">
                {/* Verification Status */}
                <div className="flex items-center gap-3 mb-4">
                  {getVerificationIcon()}
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {result.verified
                        ? "Claim Verified"
                        : "Claim Not Verified"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Confidence Level: {result.confidence}
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="mb-4">
                  <h4 className="font-medium text-slate-900 mb-2">Analysis</h4>
                  <p className="text-slate-700 leading-relaxed">
                    {result.explanation}
                  </p>
                </div>

                {/* Sources */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">
                        Sources
                      </h4>
                      <p className="text-sm text-slate-600">{result.source}</p>
                    </div>
                  </div>
                </div>

                {/* Ledge to Flow Button */}
                <div className="pt-4 border-t border-slate-200 mt-4">
                  <button
                    onClick={handleLedge}
                    disabled={ledging}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {ledging ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Recording on blockchain...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        Ledge to Flow Blockchain
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ledge Result Section */}
          {ledgeResult && (
            <div
              className={`mx-6 mb-6 rounded-xl border-2 ${
                ledgeResult.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              } transition-all duration-500`}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  {ledgeResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {ledgeResult.success
                        ? "Blockchain Record Created"
                        : "Blockchain Recording Failed"}
                    </h3>
                  </div>
                </div>

                <p className="text-slate-700 mb-3">{ledgeResult.message}</p>

                {ledgeResult.success && ledgeResult.txId && (
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-xs text-slate-600 mb-1">
                      Transaction ID:
                    </p>
                    <p className="font-mono text-sm text-slate-800 break-all">
                      {ledgeResult.txId}
                    </p>
                    <a
                      href={`https://testnet.flowscan.io/transaction/${ledgeResult.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-2 transition-colors"
                    >
                      View on Flow Explorer
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>
            Results are based on available information and should be verified
            independently
          </p>
        </div>
      </div>
    </div>
  );
}
