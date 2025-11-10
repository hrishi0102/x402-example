"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PremiumContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get("success");
  const [paymentData, setPaymentData] = useState(false);

  useEffect(() => {
    // Check if payment was actually verified (not just URL manipulation)
    if (success === "true") {
      const paymentToken = sessionStorage.getItem("payment_verified");
      const paymentTimestamp = sessionStorage.getItem("payment_timestamp");

      if (paymentToken && paymentTimestamp) {
        // Verify payment was recent (within last 5 minutes)
        const timestamp = parseInt(paymentTimestamp, 10);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - timestamp < fiveMinutes) {
          setPaymentData(true);
          // Clear the token after verification
          sessionStorage.removeItem("payment_verified");
          sessionStorage.removeItem("payment_timestamp");
        }
      }
    }
  }, [success]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center space-y-6 p-6 bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-md w-full space-y-6">
        {paymentData && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
              Payment Successful! 🎉
            </h1>
            <p className="text-green-700 dark:text-green-300">
              ✅ WOHOOOO Payment successful! Congratulations - you’ve bribed the
              digital gatekeeper. Welcome to the VIP side of the internet. You
              now have access to the PREMIUM API DATA !!!!
            </p>
          </div>
        )}

        {!paymentData && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Premium Access
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              You don't have active premium access. Please make a payment to
              continue.
            </p>
          </div>
        )}

        <button
          onClick={() => router.push("/")}
          className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Go Back Home
        </button>
      </div>
    </main>
  );
}

export default function PremiumPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-col items-center justify-center min-h-screen text-center space-y-6 p-6 bg-[var(--background)] text-[var(--foreground)]">
          <div className="max-w-md w-full space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
              <p className="text-gray-600 dark:text-gray-300">Loading...</p>
            </div>
          </div>
        </main>
      }
    >
      <PremiumContent />
    </Suspense>
  );
}
