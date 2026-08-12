import { Bell } from 'lucide-react';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { MOCK_USER_NAME, MOCK_WALLET } from '@/constants/mock-dashboard';

export default function AlertsPage() {
  return (
    <DashboardShell
      userName={MOCK_USER_NAME}
      walletAddress={MOCK_WALLET.address}
      network={MOCK_WALLET.network}
      hasNotifications
    >
      <EmptyState
        icon={Bell}
        title="No alerts yet"
        description="Savings confirmations and account updates will show up here — see services/notifications.ts for the architecture this connects to."
      />
    </DashboardShell>
  );
}
