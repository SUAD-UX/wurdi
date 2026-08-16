import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';

export interface AuthenticatedUser {
  id: string;
  displayName: string;
  walletAddress: string | null;
  network: string;
  chainId: number;
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  savingsPreference: number;
}

function getFallbackDisplayName(walletAddress: string | null) {
  if (walletAddress) {
    return `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }

  return 'WURDI User';
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      wallets: true,
      preferences: true,
    },
  });

  if (!user) {
    return null;
  }

  const primaryWallet = user.wallets.find((wallet) => wallet.isPrimary) ?? user.wallets[0] ?? null;
  const walletAddress = primaryWallet?.address ?? user.walletAddress ?? null;
  const chainId = primaryWallet?.chainId ?? 1;
  const network = chainId === 1 ? 'Ethereum Mainnet' : `Chain ${chainId}`;
  const theme = user.preferences?.theme === 'light' ? 'light' : 'dark';
  const savingsPreference = user.preferences?.savingsPreference ?? 20;

  return {
    id: user.id,
    displayName: user.displayName ?? getFallbackDisplayName(walletAddress),
    walletAddress,
    network,
    chainId,
    theme,
    notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
    savingsPreference,
  } satisfies AuthenticatedUser;
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error('Authentication required.');
  }

  return user;
}
