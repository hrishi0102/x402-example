"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// --- Main component ---
export default function HomePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [response, setResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);

  async function callProtectedAPI() {
    try {
      setLoading(true);
      setResponse(null);
      setIsPaymentRequired(false);

      // Simple fetch to see if paywall triggers
      const res = await fetch("/api/protected");
      if (res.status === 402) {
        const data = await res.json();
        // Optional: parse price dynamically from response
        const priceText = data?.price || "$0.01";
        setPrice(priceText);
        // Store the 402 response to show it
        setResponse(JSON.stringify(data, null, 2));
        setIsPaymentRequired(true);
        setShowModal(true);
        return;
      }

      // No payment needed, show result in modal
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setIsPaymentRequired(false);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setResponse(err?.message || "Error making request");
      setIsPaymentRequired(false);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  }

  async function payAndRetry() {
    try {
      setLoading(true);
      setIsPaymentRequired(false);

      if (!walletClient) {
        throw new Error("Wallet not connected");
      }

      // wrapFetchWithPayment expects a WalletClient (from createWalletClient or useWalletClient)
      const fetchWithPayment = wrapFetchWithPayment(fetch, walletClient);
      const res = await fetchWithPayment("/api/protected", { method: "GET" });

      // If we got a successful response, payment was processed
      if (res.ok) {
        const responseData = await res.json();

        const header = res.headers.get("x-payment-response");
        if (header) {
          const paymentResponse = decodeXPaymentResponse(header);
          console.log("Payment Info:", paymentResponse);
        }

        // Store payment verification token in sessionStorage
        const paymentToken = `payment_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}`;
        sessionStorage.setItem("payment_verified", paymentToken);
        sessionStorage.setItem("payment_timestamp", Date.now().toString());

        // Navigate to premium page on successful payment
        router.push("/premium?success=true");
      } else {
        throw new Error("Payment failed");
      }
    } catch (err) {
      console.error(err);
      setResponse(
        err?.message ||
          "Payment or request failed. Please ensure your wallet is connected."
      );
      setShowModal(true);
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center space-y-6 p-6 relative bg-[var(--background)] text-[var(--foreground)]">
      <h1 className="text-3xl font-bold">x402 Buyer Demo</h1>
      <p className="text-gray-400 dark:text-gray-500 max-w-md">
        Demonstrates how to unlock a paywalled API route using{" "}
        <code className="text-gray-300 dark:text-gray-400">crypto</code>
        <code className="text-gray-300 dark:text-gray-400"></code>.
      </p>

      <div className="flex flex-col items-center gap-4">
        <ConnectButton />

        {isConnected && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        )}

        <button
          onClick={callProtectedAPI}
          disabled={loading || !isConnected}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Loading..." : "Call Paid API"}
        </button>
      </div>

      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col space-y-4 border border-gray-200 dark:border-gray-700">
            {isPaymentRequired ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    🔒 Payment Required
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  This API requires a payment of{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {price || "$0.01"}
                  </span>
                  .
                </p>
                {response && (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      402 Response:
                    </p>
                    <pre className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-left text-sm p-4 rounded-lg overflow-auto flex-1 border border-gray-200 dark:border-gray-700">
                      {response}
                    </pre>
                  </div>
                )}
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={payAndRetry}
                    disabled={loading || !isConnected || !walletClient}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Processing..." : "Pay & Unlock"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    API Response
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
                {response && (
                  <pre className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-left text-sm p-4 rounded-lg overflow-auto flex-1 border border-gray-200 dark:border-gray-700">
                    {response}
                  </pre>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
