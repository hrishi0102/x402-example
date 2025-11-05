import { Address } from "viem";
import { paymentMiddleware, Network, Resource } from "x402-next";

const payTo = "0x6a475ed41c9a172332dba2308e5d6d059f650e12";

export const middleware = paymentMiddleware(
  payTo,
  {
    "/api/protected": {
      price: "$0.01",
      network: "base-sepolia",
      config: {
        description: "Access to protected content",
      },
    },
  },
  {
    url: "https://x402.org/facilitator",
  },
  {
    appName: "Next x402 Demo",
    appLogo: "/x402-icon-blue.png",
  }
);

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/protected/:path*"],
};
