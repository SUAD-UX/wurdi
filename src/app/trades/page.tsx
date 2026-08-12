import { DashboardShell } from '@/components/shared/DashboardShell';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { RecentTradesCard } from '@/components/dashboard/RecentTradesCard';
import { MOCK_USER_NAME, MOCK_TRADES, MOCK_WALLET } from '@/constants/mock-dashboard';

export default function TradesPage() {
  return (
    <DashboardShell
      userName={MOCK_USER_NAME}
      walletAddress={MOCK_WALLET.address}
      network={MOCK_WALLET.network}
      hasNotifications
    >
      <ScrollReveal>
        <RecentTradesCard trades={MOCK_TRADES} />
      </ScrollReveal>
    </DashboardShell>
  );
}
