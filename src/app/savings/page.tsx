import { DashboardShell } from '@/components/shared/DashboardShell';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { SavingsVaultCard } from '@/components/savings/SavingsVaultCard';
import {
  MOCK_SAVINGS,
  MOCK_SAVINGS_CONFIRMATION_PROFIT,
  MOCK_WALLET,
} from '@/constants/mock-dashboard';

export default function SavingsPage() {
  return (
    <DashboardShell
      userName=""
      walletAddress=""
      network={MOCK_WALLET.network}
      hasNotifications
    >
      <div className="max-w-md">
        <ScrollReveal>
          <SavingsVaultCard
            vault={MOCK_SAVINGS}
            previewProfitUsd={MOCK_SAVINGS_CONFIRMATION_PROFIT}
          />
        </ScrollReveal>
      </div>
    </DashboardShell>
  );
}
