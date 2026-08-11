'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from '@/components/shared/Sidebar';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  walletAddress: string;
}

/**
 * Mobile-only navigation drawer (below the `md` breakpoint). Reuses the same
 * <Sidebar variant="full" /> content as desktop — one source of truth for nav
 * items, no separate mobile nav list to keep in sync.
 */
export function MobileDrawer({ isOpen, onClose, userName, walletAddress }: MobileDrawerProps) {
  // Lock body scroll while the drawer is open, and allow Escape to close it.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 md:hidden',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-[var(--duration-liquid)] ease-[var(--ease-liquid)]',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Slide-in panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'bg-background-elevated absolute inset-y-0 left-0 w-72 max-w-[80vw] shadow-2xl transition-transform duration-[var(--duration-liquid)] ease-[var(--ease-liquid)]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="absolute top-6 right-4">
          <IconButton aria-label="Close menu" onClick={onClose}>
            <X className="h-[18px] w-[18px]" strokeWidth={2} />
          </IconButton>
        </div>
        <Sidebar
          variant="full"
          userName={userName}
          walletAddress={walletAddress}
          onNavigate={onClose}
        />
      </div>
    </div>
  );
}
