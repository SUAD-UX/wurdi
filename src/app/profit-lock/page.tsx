'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BrowserProvider,
  Contract,
  formatEther,
  isAddress,
  JsonRpcProvider,
  parseUnits,
  type ContractRunner,
} from 'ethers';
import { ArrowUpRight, CheckCircle2, Clock3, ExternalLink, LoaderCircle, Wallet } from 'lucide-react';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { VaultCore } from '@/components/savings/VaultCore';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

const MONAD_CHAIN_ID = 10143;
const MONAD_CHAIN_ID_HEX = '0x279f';
const MONAD_RPC_URL = 'https://testnet-rpc.monad.xyz';
const MONAD_EXPLORER_URL = 'https://testnet.monadvision.com';
const VAULT_ADDRESS =
  process.env.NEXT_PUBLIC_VAULT_ADDRESS ?? '0x3f607f7CD4AA3aC6992a0E5408515574BCb03Bc8';
const VAULT_ABI = [
  'function lockProfit(uint64 lockSeconds) payable',
  'function withdraw()',
  'function positions(address) view returns (uint256 amount, uint64 unlockAt)',
] as const;
const LOCK_DURATIONS = [
  { label: '1 minute · Demo', seconds: 60 },
  { label: '1 day', seconds: 86_400 },
  { label: '7 days', seconds: 604_800 },
  { label: '30 days', seconds: 2_592_000 },
] as const;

interface VaultPosition {
  amount: bigint;
  unlockAt: number;
}

interface WalletProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

function shortenedAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatUnlockTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatRemainingTime(seconds: number): string {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const remainingSeconds = seconds % 60;
  return [
    days ? `${days}d` : '',
    hours ? `${hours}h` : '',
    minutes ? `${minutes}m` : '',
    `${remainingSeconds}s`,
  ].filter(Boolean).join(' ');
}

function isUnknownChainError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 4902;
}

function isWalletRejection(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 4001;
}

function userSafeError(error: unknown, fallback: string): string {
  if (isWalletRejection(error)) return 'Transaction cancelled in your wallet.';
  if (!(error instanceof Error)) return fallback;

  const safeMessages = [
    'Install or open an EVM wallet to use Profit Lock.',
    'No valid wallet account was selected.',
    'Switch your wallet to Monad Testnet to continue.',
    'Vault contract is not configured. Set NEXT_PUBLIC_VAULT_ADDRESS and restart the app.',
    'Enter a demo profit greater than zero.',
  ];
  return safeMessages.includes(error.message) ? error.message : fallback;
}

async function connectVaultWallet(): Promise<{
  address: string;
  signer: ContractRunner;
}> {
  const injectedProvider = window.ethereum as WalletProvider | undefined;
  if (!injectedProvider) {
    throw new Error('Install or open an EVM wallet to use Profit Lock.');
  }

  const accounts = await injectedProvider.request({ method: 'eth_requestAccounts' });
  if (!Array.isArray(accounts) || typeof accounts[0] !== 'string' || !isAddress(accounts[0])) {
    throw new Error('No valid wallet account was selected.');
  }

  try {
    await injectedProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_CHAIN_ID_HEX }],
    });
  } catch (error) {
    if (!isUnknownChainError(error)) {
      throw error;
    }
    await injectedProvider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: MONAD_CHAIN_ID_HEX,
        chainName: 'Monad Testnet',
        nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
        rpcUrls: [MONAD_RPC_URL],
        blockExplorerUrls: [MONAD_EXPLORER_URL],
      }],
    });
    await injectedProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_CHAIN_ID_HEX }],
    });
  }

  const provider = new BrowserProvider(injectedProvider as ConstructorParameters<typeof BrowserProvider>[0]);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== MONAD_CHAIN_ID) {
    throw new Error('Switch your wallet to Monad Testnet to continue.');
  }

  return {
    address: accounts[0],
    signer: await provider.getSigner(accounts[0]),
  };
}

function getLockAmountWei(profit: string, percentage: number): bigint {
  if (!/^\d+(\.\d{0,18})?$/.test(profit.trim())) {
    return BigInt(0);
  }
  try {
    return parseUnits(profit.trim(), 18) * BigInt(percentage) / BigInt(100);
  } catch {
    return BigInt(0);
  }
}

export default function ProfitLockPage() {
  const [profitInput, setProfitInput] = useState('1');
  const [percentage, setPercentage] = useState(20);
  const [durationSeconds, setDurationSeconds] = useState<number>(60);
  const [walletAddress, setWalletAddress] = useState('');
  const [position, setPosition] = useState<VaultPosition>({ amount: BigInt(0), unlockAt: 0 });
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000));
  const [isPending, setIsPending] = useState(false);
  const [isLoadingPosition, setIsLoadingPosition] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [pulse, setPulse] = useState(false);

  const vaultAddress = useMemo(
    () => (isAddress(VAULT_ADDRESS) ? VAULT_ADDRESS : ''),
    [],
  );
  const lockAmountWei = useMemo(
    () => getLockAmountWei(profitInput, percentage),
    [profitInput, percentage],
  );
  const unlockCountdown = Math.max(0, position.unlockAt - nowSeconds);

  const refreshPosition = useCallback(async (address: string) => {
    if (!vaultAddress || !isAddress(address)) return;

    setIsLoadingPosition(true);
    try {
      const provider = new JsonRpcProvider(MONAD_RPC_URL, MONAD_CHAIN_ID);
      const contract = new Contract(vaultAddress, VAULT_ABI, provider);
      const result = await contract.getFunction('positions').staticCall(address);
      setPosition({
        amount: BigInt(result[0]),
        unlockAt: Number(result[1]),
      });
    } catch {
      setStatusMessage('Vault position is temporarily unavailable. Please try again.');
    } finally {
      setIsLoadingPosition(false);
    }
  }, [vaultAddress]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowSeconds(Math.floor(Date.now() / 1000));
    }, 1000);

    let active = true;
    const loadSettingsAndWallet = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        const body = await response.json();
        const savedPercentage = body?.user?.preferences?.savingsPreference;
        if (active && Number.isInteger(savedPercentage) && savedPercentage >= 5 && savedPercentage <= 50) {
          setPercentage(savedPercentage);
        }
      } catch {
        // Keep the clearly labeled default percentage when preferences are unavailable.
      }

      try {
        const injectedProvider = window.ethereum as WalletProvider | undefined;
        if (!injectedProvider) return;
        const accounts = await injectedProvider.request({ method: 'eth_accounts' });
        if (active && Array.isArray(accounts) && typeof accounts[0] === 'string' && isAddress(accounts[0])) {
          setWalletAddress(accounts[0]);
          await refreshPosition(accounts[0]);
        }
      } catch {
        if (active) setStatusMessage('Unable to read the wallet or vault position right now.');
      }
    };

    void loadSettingsAndWallet();
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [refreshPosition]);

  async function handleLockProfit() {
    setStatusMessage('');
    setTransactionHash('');
    setIsSuccess(false);
    setIsPending(true);

    try {
      if (!vaultAddress) {
        throw new Error('Vault contract is not configured. Set NEXT_PUBLIC_VAULT_ADDRESS and restart the app.');
      }
      if (lockAmountWei <= BigInt(0)) {
        throw new Error('Enter a demo profit greater than zero.');
      }

      const { address, signer } = await connectVaultWallet();
      setWalletAddress(address);

      const contract = new Contract(vaultAddress, VAULT_ABI, signer);
      const lockProfit = contract.getFunction('lockProfit');
      await lockProfit.staticCall(durationSeconds, { value: lockAmountWei });
      setStatusMessage('Simulation passed. Confirm the transaction in your wallet.');
      const transaction = await lockProfit(durationSeconds, { value: lockAmountWei });
      setTransactionHash(transaction.hash);
      setStatusMessage('Transaction submitted. Waiting for Monad Testnet confirmation.');

      const receipt = await transaction.wait();
      if (!receipt || receipt.status !== 1) {
        throw new Error('The transaction did not succeed on-chain.');
      }

      setIsSuccess(true);
      setStatusMessage('Profit locked successfully on Monad Testnet.');
      setPulse(false);
      requestAnimationFrame(() => setPulse(true));
      window.setTimeout(() => setPulse(false), 1500);
      await refreshPosition(address);
    } catch (error) {
      setStatusMessage(userSafeError(error, 'Unable to lock profit right now. Check the vault and try again.'));
    } finally {
      setIsPending(false);
    }
  }

  async function handleWithdraw() {
    setStatusMessage('');
    setTransactionHash('');
    setIsSuccess(false);
    setIsPending(true);
    let requestedAddress = walletAddress;

    try {
      if (!vaultAddress) {
        throw new Error('Vault contract is not configured. Set NEXT_PUBLIC_VAULT_ADDRESS and restart the app.');
      }
      const { address, signer } = await connectVaultWallet();
      requestedAddress = address;
      setWalletAddress(address);

      const provider = new JsonRpcProvider(MONAD_RPC_URL, MONAD_CHAIN_ID);
      const readContract = new Contract(vaultAddress, VAULT_ABI, provider);
      const positionResult = await readContract.getFunction('positions').staticCall(address);
      const unlockAt = Number(positionResult[1]);
      setPosition({ amount: BigInt(positionResult[0]), unlockAt });

      if (unlockAt > Math.floor(Date.now() / 1000)) {
        setStatusMessage(`Still locked until ${formatUnlockTime(unlockAt)}`);
        return;
      }

      const contract = new Contract(vaultAddress, VAULT_ABI, signer);
      const withdraw = contract.getFunction('withdraw');
      await withdraw.staticCall();
      const transaction = await withdraw();
      setTransactionHash(transaction.hash);
      setStatusMessage('Withdrawal submitted. Waiting for Monad Testnet confirmation.');
      const receipt = await transaction.wait();
      if (!receipt || receipt.status !== 1) {
        throw new Error('The withdrawal did not succeed on-chain.');
      }
      setIsSuccess(true);
      setStatusMessage('Vault funds withdrawn successfully.');
      await refreshPosition(address);
    } catch (error) {
      if (requestedAddress && vaultAddress) {
        try {
          const provider = new JsonRpcProvider(MONAD_RPC_URL, MONAD_CHAIN_ID);
          const contract = new Contract(vaultAddress, VAULT_ABI, provider);
          const result = await contract.getFunction('positions').staticCall(requestedAddress);
          const unlockAt = Number(result[1]);
          if (unlockAt > Math.floor(Date.now() / 1000)) {
            setStatusMessage(`Still locked until ${formatUnlockTime(unlockAt)}`);
            return;
          }
        } catch {
          setStatusMessage('Unable to verify the vault position. Please try again.');
          return;
        }
      }
      setStatusMessage(userSafeError(error, 'Unable to withdraw right now. Please try again.'));
    } finally {
      setIsPending(false);
    }
  }

  const explorerAddressUrl = vaultAddress
    ? `${MONAD_EXPLORER_URL}/address/${vaultAddress}`
    : MONAD_EXPLORER_URL;

  return (
    <DashboardShell userName="" walletAddress="" network="Monad Testnet">
      <section className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-foreground text-2xl font-semibold">Profit Lock</h2>
            <p className="text-foreground-subtle mt-1 text-sm">
              Review your demo allocation before approving an on-chain vault transaction.
            </p>
          </div>
          <VaultCore pulse={pulse} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
          <div className="flex flex-col gap-5">
            <GlassCard className="space-y-5 p-6">
              <label className="block">
                <span className="text-foreground mb-1.5 block text-sm font-medium">
                  Demo profit (MON)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.000001"
                  inputMode="decimal"
                  value={profitInput}
                  onChange={(event) => setProfitInput(event.target.value)}
                  className="border-glass-border-strong bg-background-elevated text-foreground focus:border-secondary/50 w-full rounded-xl border px-3 py-2.5 outline-none"
                />
                <span className="text-foreground-subtle mt-1 block text-xs">
                  Demo amount for the receipt preview; the wallet will show the exact transaction value.
                </span>
              </label>

              <div>
                <p className="text-foreground mb-2 text-sm font-medium">Saved percentage</p>
                <div className="border-glass-border bg-glass inline-flex items-center gap-2 rounded-xl border px-3 py-2">
                  <span className="text-foreground text-sm font-semibold">{percentage}%</span>
                  <span className="text-foreground-subtle text-xs">from your saved preference</span>
                </div>
              </div>

              <fieldset>
                <legend className="text-foreground mb-2 text-sm font-medium">Lock duration</legend>
                <div className="grid grid-cols-2 gap-2">
                  {LOCK_DURATIONS.map((duration) => (
                    <button
                      key={duration.seconds}
                      type="button"
                      aria-pressed={durationSeconds === duration.seconds}
                      onClick={() => setDurationSeconds(duration.seconds)}
                      className={cn(
                        'border-glass-border rounded-xl border px-3 py-2 text-sm transition-colors',
                        durationSeconds === duration.seconds
                          ? 'border-secondary/50 bg-secondary/10 text-secondary'
                          : 'bg-glass text-foreground-muted hover:text-foreground',
                      )}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-foreground font-medium">Transaction receipt preview</h3>
                <span className="text-foreground-subtle text-xs">Review before approval</span>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground-subtle">Demo profit</dt>
                  <dd className="text-foreground">{profitInput || '0'} MON</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground-subtle">Percentage</dt>
                  <dd className="text-foreground">{percentage}%</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground-subtle">Amount to lock</dt>
                  <dd className="text-secondary font-semibold">{formatEther(lockAmountWei)} MON</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground-subtle">Destination</dt>
                  <dd className="text-right">
                    {vaultAddress ? (
                      <a
                        href={explorerAddressUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-secondary inline-flex items-center gap-1 hover:underline"
                      >
                        {shortenedAddress(vaultAddress)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-rose-400">Vault address not configured</span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground-subtle">Network</dt>
                  <dd className="text-foreground">Monad Testnet · 10143</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground-subtle">Lock duration</dt>
                  <dd className="text-foreground">
                    {LOCK_DURATIONS.find((duration) => duration.seconds === durationSeconds)?.label}
                  </dd>
                </div>
              </dl>
              <p className="border-glass-border text-foreground-subtle mt-5 border-t pt-4 text-xs leading-relaxed">
                WURDI never holds your funds. The vault has no owner or admin.
              </p>
            </GlassCard>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleLockProfit} disabled={isPending || !vaultAddress} size="lg">
                {isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                {isPending ? 'Waiting for wallet' : 'Lock profit'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleWithdraw}
                disabled={isPending || !vaultAddress}
                size="lg"
              >
                <ArrowUpRight className="h-4 w-4" />
                Withdraw
              </Button>
            </div>

            {statusMessage && (
              <div
                role="status"
                aria-live="polite"
                className={cn(
                  'border-glass-border bg-glass rounded-xl border px-4 py-3 text-sm',
                  isSuccess ? 'text-secondary' : 'text-foreground-muted',
                )}
              >
                {isSuccess && <CheckCircle2 className="mr-2 inline h-4 w-4" />}
                {statusMessage}
                {transactionHash && (
                  <a
                    href={`${MONAD_EXPLORER_URL}/tx/${transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-secondary ml-2 inline-flex items-center gap-1 hover:underline"
                  >
                    View transaction <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          <GlassCard className="h-fit p-6">
            <div className="mb-4 flex items-center gap-2">
              <Clock3 className="text-secondary h-4 w-4" />
              <h3 className="text-foreground font-medium">Vault position</h3>
            </div>
            <div className="mb-4">
              <p className="text-foreground-subtle text-xs">Connected wallet</p>
              <p className="text-foreground mt-1 break-all text-sm">
                {walletAddress || 'Connect your wallet to read your position'}
              </p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs">Locked balance</p>
              <p className="text-foreground mt-1 text-2xl font-semibold">
                {isLoadingPosition ? 'Reading…' : `${formatEther(position.amount)} MON`}
              </p>
            </div>
            {position.unlockAt > 0 && (
              <div className="border-glass-border mt-4 border-t pt-4">
                <p className="text-foreground-subtle text-xs">Unlock time</p>
                <p className="text-foreground mt-1 text-sm">{formatUnlockTime(position.unlockAt)}</p>
                <p className="text-secondary mt-1 text-sm">
                  {unlockCountdown > 0 ? `Unlocks in ${formatRemainingTime(unlockCountdown)}` : 'Available to withdraw'}
                </p>
              </div>
            )}
            {walletAddress && (
              <button
                type="button"
                onClick={() => void refreshPosition(walletAddress)}
                disabled={isLoadingPosition}
                className="text-secondary mt-4 text-xs hover:underline disabled:opacity-50"
              >
                Refresh position
              </button>
            )}
          </GlassCard>
        </div>
      </section>
    </DashboardShell>
  );
}
