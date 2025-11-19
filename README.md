# x402 Payment Demo

A Next.js demo application showcasing **x402** - a protocol for paywalled API routes using cryptocurrency payments.

## What is x402?

x402 enables API endpoints to require micro-payments in cryptocurrency. When a client requests a protected route, they receive a `402 Payment Required` response with payment details. After payment, the request is automatically retried and succeeds.

## Features

- 🔒 Paywalled API routes using Next.js middleware
- 💰 Crypto payment integration via wallet (RainbowKit + wagmi)
- 🔄 Automatic payment flow with `x402-fetch`
- ✅ Premium content page after successful payment
- 🌐 Built on Base Sepolia testnet

## Tech Stack

- **Next.js 16** - React framework
- **x402-next** - Middleware for paywalled routes
- **x402-fetch** - Client-side payment wrapper
- **RainbowKit** - Wallet connection UI
- **wagmi** - Ethereum React hooks

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A crypto wallet (MetaMask, WalletConnect, etc.)
- A WalletConnect Cloud project ID (for RainbowKit)

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=your_walletconnect_project_id
```

**Getting a WalletConnect Project ID:**

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Add it to your `.env.local` file

### Installation

```bash
bun install
```

### Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Connect Wallet** - Click "Connect Wallet" and approve the connection
2. **Call Protected API** - Click "Call Paid API" to request the protected route
3. **Payment Required** - If payment is needed, you'll see a `402` response with payment details
4. **Pay & Unlock** - Click "Pay & Unlock" to process the crypto payment
5. **Access Premium** - After successful payment, you're redirected to the premium page

## Configuration

The payment middleware is configured in `middleware.js`:

- **Payment Address**: `0x6a...` - Replace with the address of merchant
- **Network**: Base Sepolia testnet
- **Price**: $0.001 per API call
- **Facilitator**: x402.org facilitator service for testnet

### Adding More Protected API Routes

To add additional paywalled API endpoints, update the `middleware.js` file:

1. **Add the route to the routes object:**

```javascript
export const middleware = paymentMiddleware(
  payTo,
  {
    "/api/protected": {
      price: "$0.001",
      network: "base-sepolia",
      config: {
        description: "Access to protected content",
      },
    },
    // Add your new route here
    "/api/premium": {
      price: "$0.01",
      network: "base-sepolia",
      config: {
        description: "Premium API access",
      },
    },
    "/api/data": {
      price: "$0.005",
      network: "base-sepolia",
      config: {
        description: "Data API endpoint",
      },
    },
  }
  // ... rest of config
);
```

2. **Update the matcher to include the new routes:**

```javascript
export const config = {
  matcher: [
    "/api/protected/:path*",
    "/api/premium/:path*", // Add new route pattern
    "/api/data/:path*", // Add new route pattern
  ],
};
```

**Route Configuration Options:**

- `price` - The payment amount (e.g., `"$0.001"`, `"$0.01"`)
- `network` - The blockchain network (e.g., `"base-sepolia"`, `"base"`)
- `config.description` - Human-readable description shown in payment UI

**Example: Different prices for different endpoints**

```javascript
{
  "/api/basic": {
    price: "$0.001",
    network: "base-sepolia",
    config: { description: "Basic API access" },
  },
  "/api/pro": {
    price: "$0.01",
    network: "base-sepolia",
    config: { description: "Pro API access" },
  },
  "/api/enterprise": {
    price: "$0.1",
    network: "base-sepolia",
    config: { description: "Enterprise API access" },
  },
}
```

## Learn More

- [x402 Protocol](https://x402.org)
- [Next.js Documentation](https://nextjs.org/docs)
- [RainbowKit Documentation](https://rainbowkit.com)
