import { randomBytes } from 'node:crypto';
import { getAddress, verifyMessage } from 'ethers';
import { prisma } from '@/lib/db';

export interface WalletAuthRequest {
  address: string;
  chainId?: number;
  signature: string;
  nonce: string;
}

export interface WalletChallengeData {
  nonce: string;
  chainId: number;
  expiresAt: Date;
  message: string;
  address: string;
}

export const SUPPORTED_CHAIN_IDS = [1];

export function normalizeWalletAddress(address: string) {
  if (!address || typeof address !== 'string') {
    throw new Error('Wallet address is required.');
  }

  return getAddress(address.trim()).toLowerCase();
}

function getAppDomain() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return 'wurdi.local';
  }

  try {
    return new URL(appUrl).hostname;
  } catch {
    return 'wurdi.local';
  }
}

export function buildWalletChallengeMessage(address: string, nonce: string, chainId: number) {
  const normalizedAddress = normalizeWalletAddress(address);
  const issuedAt = new Date().toISOString();
  return [
    'WURDI wallet sign-in',
    `Domain: ${getAppDomain()}`,
    `Chain ID: ${chainId}`,
    `Address: ${normalizedAddress}`,
    `Nonce: ${nonce}`,
    `Issued at: ${issuedAt}`,
  ].join('\n');
}

export async function createWalletChallenge(address: string, chainId = 1): Promise<WalletChallengeData> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Set the PostgreSQL connection string before enabling wallet authentication.');
  }

  const normalizedAddress = normalizeWalletAddress(address);

  if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
    throw new Error('This wallet chain is not supported yet. WURDI currently accepts Ethereum Mainnet.');
  }

  const nonce = randomBytes(16).toString('hex');
  const challengeMessage = buildWalletChallengeMessage(normalizedAddress, nonce, chainId);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

  await prisma.walletChallenge.deleteMany({
    where: {
      walletAddress: normalizedAddress,
      usedAt: null,
    },
  });

  const challenge = await prisma.walletChallenge.create({
    data: {
      walletAddress: normalizedAddress,
      nonce,
      chainId,
      message: challengeMessage,
      expiresAt,
    },
  });

  return {
    nonce: challenge.nonce,
    chainId: challenge.chainId,
    expiresAt: challenge.expiresAt,
    message: challenge.message,
    address: challenge.walletAddress,
  };
}

export async function verifyWalletSignature(request: WalletAuthRequest) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Set the PostgreSQL connection string before enabling wallet authentication.');
  }

  const normalizedAddress = normalizeWalletAddress(request.address);
  const requestedChainId = request.chainId ?? 1;

  if (!SUPPORTED_CHAIN_IDS.includes(requestedChainId)) {
    throw new Error('This wallet chain is not supported yet. WURDI currently accepts Ethereum Mainnet.');
  }

  const challenge = await prisma.walletChallenge.findFirst({
    where: {
      walletAddress: normalizedAddress,
      nonce: request.nonce,
      usedAt: null,
    },
  });

  if (!challenge) {
    throw new Error('Invalid or expired wallet challenge. Request a fresh signature challenge.');
  }

  if (challenge.chainId !== requestedChainId) {
    throw new Error('The wallet chain in the request does not match the security challenge.');
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    await prisma.walletChallenge.update({
      where: { id: challenge.id },
      data: { usedAt: new Date() },
    });
    throw new Error('The wallet challenge expired. Please try connecting again.');
  }

  const recoveredAddress = verifyMessage(challenge.message, request.signature);
  const normalizedRecoveredAddress = normalizeWalletAddress(recoveredAddress);

  if (normalizedRecoveredAddress !== normalizedAddress) {
    throw new Error('The wallet signature does not match the requested wallet address.');
  }

  await prisma.walletChallenge.update({
    where: { id: challenge.id },
    data: { usedAt: new Date() },
  });

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ walletAddress: normalizedAddress }, { wallets: { some: { address: normalizedAddress } } }],
    },
    include: { wallets: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        walletAddress: normalizedAddress,
        displayName: `Wallet ${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`,
      },
      include: { wallets: true },
    });
  }

  let wallet = await prisma.wallet.findUnique({
    where: { address: normalizedAddress },
  });

  if (wallet && wallet.userId !== user.id) {
    throw new Error('This wallet is already linked to another WURDI account.');
  }

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        address: normalizedAddress,
        chainId: requestedChainId,
        isPrimary: true,
      },
    });
  }

  if (!user.walletAddress) {
    await prisma.user.update({
      where: { id: user.id },
      data: { walletAddress: normalizedAddress },
    });
  }

  return {
    userId: user.id,
    walletAddress: normalizedAddress,
    chainId: wallet.chainId,
  };
}
