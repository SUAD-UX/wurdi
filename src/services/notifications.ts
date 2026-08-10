import type { AppNotification, NotificationKind } from '@/types/notifications';

/**
 * STUB — not a real notification system yet.
 *
 * This defines the interface the rest of the app should depend on
 * (`NotificationService`), so when a real provider is built (web push, email,
 * in-app toast/bell feed, etc. — likely once auth exists) only this file changes.
 * No component should import a concrete provider directly.
 */
export interface NotificationService {
  send: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  list: () => Promise<AppNotification[]>;
  markRead: (id: string) => Promise<void>;
}

/**
 * Builds the standard copy for a savings-related notification, per the product
 * spec's examples ("You made $X profit... Review and confirm the transfer.").
 * Kept separate from the service itself so it's easy to unit test/reuse in the
 * confirmation UI without needing a real notification provider.
 */
export function buildSavingsNotificationCopy(
  kind: NotificationKind,
  params: { profitUsd?: number; savingsUsd?: number; savingsPercent?: number },
): { title: string; body: string } {
  switch (kind) {
    case 'savings_confirmation_required':
      return {
        title: 'WURDI Savings',
        body: `You made $${params.profitUsd} profit from trading. Your ${params.savingsPercent}% savings rule wants to save $${params.savingsUsd}. Review and confirm the transfer.`,
      };
    case 'savings_wallet_not_connected':
      return {
        title: 'WURDI Savings',
        body: `WURDI calculated a $${params.savingsUsd} savings allocation, but no transfer was made because your savings wallet isn't connected.`,
      };
    case 'savings_transfer_succeeded':
      return {
        title: 'Savings secured',
        body: `$${params.savingsUsd} moved to your savings wallet.`,
      };
    case 'savings_transfer_failed':
      return {
        title: 'Savings transfer not completed',
        body: 'Your wallet rejected the transaction. Nothing was transferred.',
      };
  }
}

/**
 * No-op implementation so the rest of the app can depend on NotificationService
 * today without a real backend. Swap this out — nothing else needs to change.
 */
export const notificationService: NotificationService = {
  async send() {
    // intentionally empty — real provider TBD
  },
  async list() {
    return [];
  },
  async markRead() {
    // intentionally empty — real provider TBD
  },
};
