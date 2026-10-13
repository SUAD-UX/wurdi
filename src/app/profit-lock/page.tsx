import { LockKeyhole } from 'lucide-react';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { EmptyState } from '@/components/shared/EmptyState';

export default function ProfitLockPage() {
  return (
    <DashboardShell userName="" walletAddress="" network="">
      <EmptyState
        icon={LockKeyhole}
        title="Profit Lock"
        description="Lock a portion of your profits automatically. This feature is coming soon."
      />
    </DashboardShell>
  );
}
