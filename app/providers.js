"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "viem/chains";
import "@rainbow-me/rainbowkit/styles.css";

const { connectors } = getDefaultWallets({
  appName: "x402 Demo",
  projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID,
  chains: [baseSepolia],
});

const config = createConfig({
  chains: [baseSepolia],
  connectors,
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
