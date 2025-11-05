"use client";

import { useState } from "react";
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

// --- Setup wallet directly here (simple version) ---
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;
const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(),
});

// --- Main component ---
export default function HomePage() {
  const [response, setResponse] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);

  async function callProtectedAPI() {
    try {
      setLoading(true);
      setResponse(null);

      // Simple fetch to see if paywall triggers
      const res = await fetch("/api/protected");
      if (res.status === 402) {
        const data = await res.json();
        // Optional: parse price dynamically from response
        const priceText = data?.price || "$0.01";
        setPrice(priceText);
        setShowPaywall(true);
        return;
      }

      // No payment needed, show result
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setResponse(err?.message || "Error making request");
    } finally {
      setLoading(false);
    }
  }

  async function payAndRetry() {
    try {
      setLoading(true);
      setShowPaywall(false);
      setResponse("Processing payment...");

      const fetchWithPayment = wrapFetchWithPayment(fetch, account);
      const res = await fetchWithPayment("/api/protected", { method: "GET" });
      const data = await res.json();

      const header = res.headers.get("x-payment-response");
      if (header) {
        const paymentResponse = decodeXPaymentResponse(header);
        console.log("Payment Info:", paymentResponse);
      }

      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setResponse("Payment or request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center space-y-6 p-6 relative">
      <h1 className="text-3xl font-bold">x402 Buyer Demo (Next.js)</h1>
      <p className="text-gray-600 max-w-md">
        Demonstrates how to unlock a paywalled API route using <code>viem</code>{" "}
        + <code>x402-fetch</code>.
      </p>

      <button
        onClick={callProtectedAPI}
        disabled={loading}
        className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Call Paid API"}
      </button>

      {response && (
        <pre className="bg-gray-100 text-left text-sm p-4 rounded-lg max-w-2xl overflow-auto">
          {response}
        </pre>
      )}

      {showPaywall && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center space-y-4">
            <h2 className="text-xl font-semibold">🔒 Payment Required</h2>
            <p className="text-gray-600">
              This API requires a payment of{" "}
              <span className="font-semibold">{price || "$0.01"}</span>.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowPaywall(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={payAndRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Pay & Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
