import { Settings } from 'lucide-react';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { EmptyState } from '@/components/shared/EmptyState';
import { GlassCard } from '@/components/ui/GlassCard';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { MOCK_WALLET } from '@/constants/mock-dashboard';

export default function SettingsPage() {
  return (
    <DashboardShell
      userName=""
      walletAddress=""
      network={MOCK_WALLET.network}
      hasNotifications
    >
      <div className="flex max-w-md flex-col gap-6">
        <GlassCard className="p-6">
          <h3 className="text-foreground mb-1 text-sm font-medium">Appearance</h3>
          <p className="text-foreground-subtle mb-4 text-xs">
            Switch between WURDI&apos;s dark and light themes.
          </p>
          <ThemeToggle />
        </GlassCard>

        <EmptyState
          icon={Settings}
          title="More settings coming soon"
          description="Account, security, and notification preferences will live here once authentication is wired in."
        />
      </div>
    </DashboardShell>
  );
}
