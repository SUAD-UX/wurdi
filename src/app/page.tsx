import { DashboardShell } from '@/components/shared/DashboardShell';
import { DashboardLive } from '@/components/dashboard/DashboardLive';


export default function DashboardPage() {
  return (
    <DashboardShell userName={''} walletAddress={''} network={''} hasNotifications>
      <DashboardLive />
    </DashboardShell>
  );
}
