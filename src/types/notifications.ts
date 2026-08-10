/**
 * Notification architecture (types only, for now).
 *
 * WURDI needs to reach users when a savings action needs confirmation and they're
 * not actively in the app (see WURDI_SAVINGS_CONFIRMATION_REQUIRED example in the
 * product spec). This file defines the *shape* of that system so a real provider
 * (web push, email, in-app toast, etc.) can be plugged in later via
 * services/notifications.ts without changing any component that reads notifications.
 */

export type NotificationKind =
  | 'savings_confirmation_required'
  | 'savings_wallet_not_connected'
  | 'savings_transfer_succeeded'
  | 'savings_transfer_failed';

export interface NotificationAction {
  label: string;
  /** Route or callback identifier the UI resolves — kept as a string so this type has no UI dependency. */
  actionId: string;
}

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  action?: NotificationAction;
}
