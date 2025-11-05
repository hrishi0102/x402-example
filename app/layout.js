// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "x402 Next.js Demo",
  description: "Protect Next.js API routes with crypto payments via x402",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
