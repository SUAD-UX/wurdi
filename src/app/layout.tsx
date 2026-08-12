import type { Metadata } from 'next';
import './globals.css';
import { IntroGate } from '@/components/shared/IntroGate';

export const metadata: Metadata = {
  title: 'WURDI — Wealth. Disciplined.',
  description: 'Track. Analyze. Grow. Secure your future. Non-custodial Web3 wealth management.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" data-theme="dark" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <div className="wurdi-bg-candles" aria-hidden="true" />
        <div className="wurdi-bg-datapoints" aria-hidden="true" />
        <div className="wurdi-bg-dataline" aria-hidden="true">
          <svg viewBox="0 0 1200 140" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 90 L100 70 L200 95 L300 55 L400 80 L500 40 L600 65 L700 30 L800 60 L900 45 L1000 70 L1100 35 L1200 55"
              fill="none"
              stroke="#6fcfae"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <IntroGate>{children}</IntroGate>
      </body>
    </html>
  );
}
