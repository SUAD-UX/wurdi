'use client';

import { AlertTriangle, CheckCircle2, Copy, LoaderCircle, LogOut, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import type { ConnectedWallet } from '@/types/portfolio';
import { truncateAddress } from '@/utils/format';

type WalletAuthState = 'idle' | 'connecting' | 'signing' | 'authenticated' | 'error';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export interface ConnectedWalletCardProps {
  wallet: ConnectedWallet;
}

export function ConnectedWalletCard({ wallet }: ConnectedWalletCardProps) {
  const [status, setStatus] = useState<WalletAuthState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [displayAddress, setDisplayAddress] = useState(wallet.address);
  const [network, setNetwork] = useState(wallet.network);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncError, setSyncError] = useState('');

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await response.json();

      if (data.authenticated && data.user?.walletAddress) {
        setIsAuthenticated(true);
        setDisplayAddress(data.user.walletAddress);
        setNetwork('Ethereum Mainnet');
        setStatus('authenticated');
        return;
      }

      setIsAuthenticated(false);
      setStatus('idle');
      setDisplayAddress(wallet.address);
      setNetwork(wallet.network);
    } catch {
      setIsAuthenticated(false);
      setStatus('error');
      setErrorMessage('Unable to read the current wallet session.');
    }
  }, [wallet.address, wallet.network]);

  useEffect(() => {
    let ignore = false;

    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        const data = await response.json();

        if (ignore) {
          return;
        }

        if (data.authenticated && data.user?.walletAddress) {
          setIsAuthenticated(true);
          setDisplayAddress(data.user.walletAddress);
          setNetwork('Ethereum Mainnet');
          setStatus('authenticated');
          return;
        }

        setIsAuthenticated(false);
        setStatus('idle');
        setDisplayAddress(wallet.address);
        setNetwork(wallet.network);
      } catch {
        if (!ignore) {
          setIsAuthenticated(false);
          setStatus('error');
          setErrorMessage('Unable to read the current wallet session.');
        }
      }
    };

    void loadSession();

    return () => {
      ignore = true;
    };
  }, [wallet.address, wallet.network]);

  async function handleConnect() {
    if (!window.ethereum) {
      setStatus('error');
      setErrorMessage('Install MetaMask or another browser wallet extension to continue.');
      return;
    }

    try {
      setErrorMessage('');
      setStatus('connecting');

      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const selectedAddress = accounts?.[0];

      if (!selectedAddress) {
        throw new Error('No wallet account was selected.');
      }

      setDisplayAddress(selectedAddress);
      setNetwork('Ethereum Mainnet');

      const challengeResponse = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: selectedAddress, chainId: 1 }),
      });

      const challengeData = await challengeResponse.json();

      if (!challengeResponse.ok || !challengeData.ok) {
        throw new Error(challengeData.message ?? 'Unable to request a wallet challenge.');
      }

      setStatus('signing');
      const signature = (await window.ethereum.request({
        method: 'personal_sign',
        params: [challengeData.challenge.message, selectedAddress],
      })) as string;

      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          address: selectedAddress,
          chainId: 1,
          nonce: challengeData.challenge.nonce,
          signature,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.ok) {
        throw new Error(verifyData.message ?? 'Wallet signature verification failed.');
      }

      setIsAuthenticated(true);
      setStatus('authenticated');
      setErrorMessage('');
      await refreshSession();
    } catch (error) {
      setIsAuthenticated(false);
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Wallet authentication failed. Please try again.',
      );
    }
  }

  async function handleDisconnect() {
    try {
      await fetch('/api/auth/session', { method: 'POST', cache: 'no-store' });
      setIsAuthenticated(false);
      setStatus('idle');
      setDisplayAddress(wallet.address);
      setNetwork(wallet.network);
      setErrorMessage('');
    } catch {
      setStatus('error');
      setErrorMessage('Unable to sign out of the current wallet session.');
    }
  }

  async function handleSync() {
    setSyncMessage('');
    setSyncError('');
    setIsSyncing(true);

    try {
      const res = await fetch('/api/wallet/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
        cache: 'no-store',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        const message = data?.message ?? `Sync failed with status ${res.status}`;
        setSyncError(message);
        setIsSyncing(false);
        return;
      }

      setSyncMessage('Sync completed successfully');
      // attempt to refresh session and any server-driven UI
      await refreshSession();
      // trigger portfolio/pnl refresh by fetching endpoints (clients will need to read them)
      try {
        await fetch('/api/portfolio', { cache: 'no-store' });
        await fetch('/api/pnl', { cache: 'no-store' });
      } catch {
        // ignore — best-effort
      }

      // notify any dashboard listeners to refresh their view
      try {
        window.dispatchEvent(new CustomEvent('wurdi:sync'));
      } catch {
        // ignore — environment may not support window in tests
      }
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Wallet sync failed.');
    } finally {
      setIsSyncing(false);
    }
  }

  const statusLabel =
    status === 'authenticated' ? 'Authenticated' : status === 'connecting' ? 'Connecting' : status === 'signing' ? 'Signing' : 'Disconnected';

  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-medium">Connected Wallet</h3>
        <span
          className={
            status === 'authenticated'
              ? 'text-secondary flex items-center gap-1.5 text-xs'
              : 'text-foreground-subtle flex items-center gap-1.5 text-xs'
          }
        >
          <span
            className={
              status === 'authenticated'
                ? 'bg-secondary h-1.5 w-1.5 rounded-full'
                : 'bg-foreground-subtle h-1.5 w-1.5 rounded-full'
            }
          />
          {statusLabel}
        </span>
      </div>

      <div className="mb-5 flex items-center gap-4">
        <div className="bg-primary/12 flex h-12 w-12 items-center justify-center rounded-full">
          <div className="from-secondary to-primary h-6 w-6 rounded-full bg-gradient-to-br" />
        </div>
        <div className="min-w-0">
          <button className="text-foreground hover:text-secondary flex items-center gap-1.5 text-base font-medium">
            {truncateAddress(displayAddress)}
            <Copy className="text-foreground-subtle h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <p className="text-foreground-subtle text-xs">{network}</p>
        </div>
      </div>

      {errorMessage ? (
        <div className="text-foreground-subtle mb-4 flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" strokeWidth={2} />
          {errorMessage}
        </div>
      ) : null}

      {syncError ? (
        <div className="text-foreground-subtle mb-4 flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-400" strokeWidth={2} />
          {syncError}
        </div>
      ) : null}

      {syncMessage ? (
        <div className="text-foreground-subtle mb-4 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
          {syncMessage}
        </div>
      ) : null}

      <div className="border-glass-border flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-foreground-subtle text-xs">Portfolio Sync</p>
          <p className="text-foreground-muted text-xs">{wallet.lastSyncedAgo}</p>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleDisconnect}>
              <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
              Disconnect
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              aria-disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                  Syncing
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                  Sync Now
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={handleConnect} disabled={status === 'connecting' || status === 'signing'}>
            {status === 'connecting' || status === 'signing' ? (
              <>
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                {status === 'signing' ? 'Signing' : 'Connecting'}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                Connect Wallet
              </>
            )}
          </Button>
        )}
      </div>
    </GlassCard>
  );
}
