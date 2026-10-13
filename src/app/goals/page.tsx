import { Target } from 'lucide-react';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { MOCK_WALLET } from '@/constants/mock-dashboard';

export default function GoalsPage() {
  return (
    <DashboardShell
      userName=""
      walletAddress=""
      network={MOCK_WALLET.network}
      hasNotifications
    >
      <EmptyState
        icon={Target}
        title="No savings goals yet"
        description="Set a target — an emergency fund, a down payment, a milestone — and WURDI will track progress as your savings grow."
      />
    </DashboardShell>
  );
}
