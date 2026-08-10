import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WURDI — Wealth. Disciplined.",
  description: "Track. Analyze. Grow. Secure your future. Non-custodial Web3 wealth management.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <div className="wurdi-bg-candles" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
