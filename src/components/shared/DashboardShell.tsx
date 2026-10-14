'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { MobileDrawer } from '@/components/shared/MobileDrawer';
import { Topbar } from '@/components/shared/Topbar';
import { SearchPalette } from '@/components/shared/SearchPalette';

export interface DashboardShellProps {
  userName: string;
  walletAddress: string;
  network: string;
  hasNotifications?: boolean;
  children: ReactNode;
}

interface CurrentUserState {
  userName: string;
  walletAddress: string;
  network: string;
}

/**
 * The one responsive layout every dashboard route renders inside — there is no
 * separate mobile/tablet page or route, just CSS breakpoints plus two bits of
 * client state (mobile drawer open/closed, search palette open/closed):
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUserState>({
    userName,
    walletAddress,
    network,
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (ignore) {
          return;
        }

        if (!response.ok) {
          setCurrentUser({ userName, walletAddress, network });
          return;
        }

        const data = await response.json();
        if (!data?.user) {
          setCurrentUser({ userName, walletAddress, network });
          return;
        }

        setCurrentUser({
          userName: data.user.displayName ?? userName,
          walletAddress: data.user.walletAddress ?? walletAddress,
          network: data.user.network ?? network,
        });
      } catch {
        if (!ignore) {
          setCurrentUser({ userName, walletAddress, network });
        }
      }
    };

    void loadCurrentUser();

    return () => {
      ignore = true;
    };
  }, [network, userName, walletAddress]);

  return (
    <div className="bg-background flex min-h-screen">
      {/* Tablet: collapsed icon rail */}
      <div className="hidden md:flex xl:hidden">
        <Sidebar
          variant="rail"
          userName={currentUser.userName}
          walletAddress={currentUser.walletAddress}
        />
      </div>

      {/* Desktop: full sidebar */}
      <div className="hidden xl:flex">
        <Sidebar
          variant="full"
          userName={currentUser.userName}
          walletAddress={currentUser.walletAddress}
        />
      </div>

      {/* Mobile: off-canvas drawer, opened via the Topbar hamburger */}
      <MobileDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        userName={currentUser.userName}
        walletAddress={currentUser.walletAddress}
      />

      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          <Topbar
            userName={currentUser.userName}
            hasNotifications={hasNotifications}
            onMenuClick={() => setIsMobileNavOpen(true)}
            onSearchClick={() => setIsSearchOpen(true)}
          />
          {children}
        </div>
      </main>
    </div>
  );
}
