'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { MobileDrawer } from '@/components/shared/MobileDrawer';
import { Topbar } from '@/components/shared/Topbar';

export interface DashboardShellProps {
  userName: string;
  walletAddress: string;
  network: string;
  hasNotifications?: boolean;
  children: ReactNode;
}

/**
 * The one responsive layout every dashboard route renders inside — there is no
 * separate mobile/tablet page or route, just CSS breakpoints plus one bit of
 * client state (mobile drawer open/closed):
 *
 *   < md   (mobile)  — Sidebar hidden, hamburger in Topbar opens <MobileDrawer>
 *   md-xl  (tablet)  — <Sidebar variant="rail"> icon-only strip, always visible
 *   >= xl  (desktop) — <Sidebar variant="full"> with labels, always visible
 *
 * Which one is visible at a given width is pure CSS (`hidden md:flex xl:hidden`
 * etc.) — no JS media-query listener, no layout shift on resize, and it can't
 * get out of sync with actual viewport width.
 */
export function DashboardShell({
  userName,
  walletAddress,
  network,
  hasNotifications,
  children,
}: DashboardShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="bg-background flex min-h-screen">
      {/* Tablet: collapsed icon rail */}
      <div className="hidden md:flex xl:hidden">
        <Sidebar variant="rail" userName={userName} walletAddress={walletAddress} />
      </div>

      {/* Desktop: full sidebar */}
      <div className="hidden xl:flex">
        <Sidebar variant="full" userName={userName} walletAddress={walletAddress} />
      </div>

      {/* Mobile: off-canvas drawer, opened via the Topbar hamburger */}
      <MobileDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        userName={userName}
        walletAddress={walletAddress}
      />

      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          <Topbar
            userName={userName}
            network={network}
            hasNotifications={hasNotifications}
            onMenuClick={() => setIsMobileNavOpen(true)}
          />
          {children}
        </div>
      </main>
    </div>
  );
}
