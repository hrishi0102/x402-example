// app/layout.tsx
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "x402 Next.js Demo",
  description: "Protect Next.js API routes with crypto payments via x402",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
