import { randomUUID } from 'node:crypto';
import { getAddress } from 'ethers';
import { z } from 'zod';
import { prisma } from '@/lib/db';

export const transactionIntentRequestSchema = z
  .object({
    walletAddress: z.string().min(1),
    chainId: z.number().int().positive(),
    destinationAddress: z.string().min(1),
    amount: z.coerce.number().positive().max(1_000_000_000_000),
    tokenAddress: z.string().optional().nullable(),
    assetSymbol: z.string().optional().nullable(),
    assetName: z.string().optional().nullable(),
    decimals: z.number().int().min(0).max(18).default(18),
  })
  .strict();

export const transactionConfirmationSchema = z
  .object({
    requestId: z.string().min(1),
    transactionHash: z.string().min(1),
    walletAddress: z.string().min(1),
    chainId: z.number().int().positive(),
  })
  .strict();

export type TransactionIntentStatus = 'prepared' | 'submitted' | 'pending' | 'confirmed' | 'failed' | 'expired' | 'verification_unavailable';

function normalizeAddress(address: string, label: string) {
  if (!address || typeof address !== 'string') {
    throw new Error(`${label} is required.`);
  }

  return getAddress(address.trim()).toLowerCase();
}

export function assertWalletMatchesIntent(walletAddress: string, expectedWalletAddress: string) {
  const normalizedWallet = normalizeAddress(walletAddress, 'Wallet address');
  const normalizedExpected = normalizeAddress(expectedWalletAddress, 'Prepared wallet address');

  if (normalizedWallet !== normalizedExpected) {
    throw new Error('The wallet in the confirmation does not match the prepared intent.');
  }
}

export function assertChainMatchesIntent(chainId: number, expectedChainId: number) {
  if (chainId !== expectedChainId) {
    throw new Error('The confirmation chain does not match the prepared intent.');
  }
}

export function isIntentExpired(expiresAt: Date) {
  return expiresAt.getTime() < Date.now();
}

export function validatePreparedIntentInput(input: unknown) {
  const parsed = transactionIntentRequestSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error('The transaction intent payload is invalid.');
  }

  const walletAddress = normalizeAddress(parsed.data.walletAddress, 'Wallet address');
  const destinationAddress = normalizeAddress(parsed.data.destinationAddress, 'Destination address');
  const amount = Number(parsed.data.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('The prepared transfer amount must be a positive number.');
  }

  return {
    walletAddress,
    chainId: parsed.data.chainId,
    destinationAddress,
    amount,
    tokenAddress: parsed.data.tokenAddress ? normalizeAddress(parsed.data.tokenAddress, 'Token address') : null,
    assetSymbol: parsed.data.assetSymbol ?? null,
    assetName: parsed.data.assetName ?? null,
    decimals: parsed.data.decimals,
  };
}

export async function createPreparedTransactionIntent({
  userId,
  input,
}: {
  userId: string;
  input: unknown;
}) {
  const validated = validatePreparedIntentInput(input);
  const wallet = await prisma.wallet.findFirst({
    where: {
      userId,
      address: validated.walletAddress,
    },
  });

  if (!wallet) {
    throw new Error('The wallet is not linked to this authenticated account.');
  }

  if (wallet.chainId !== validated.chainId) {
    throw new Error('The wallet chain does not match the requested transaction chain.');
  }

  const requestId = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

  const intent = await prisma.transactionIntent.create({
    data: {
      userId,
      walletAddress: validated.walletAddress,
      chainId: validated.chainId,
      destinationAddress: validated.destinationAddress,
      tokenAddress: validated.tokenAddress,
      assetSymbol: validated.assetSymbol,
      assetName: validated.assetName,
      amount: validated.amount,
      decimals: validated.decimals,
      requestId,
      status: 'prepared',
      expiresAt,
      metadata: {
        createdFrom: 'wallet-approval-flow',
      },
    },
  });

  return {
    id: intent.id,
    requestId: intent.requestId,
    status: intent.status,
    expiresAt: intent.expiresAt.toISOString(),
    walletAddress: intent.walletAddress,
    chainId: intent.chainId,
    destinationAddress: intent.destinationAddress,
    amount: Number(intent.amount),
    tokenAddress: intent.tokenAddress,
    assetSymbol: intent.assetSymbol,
  };
}

export async function confirmPreparedTransactionIntent({
  userId,
  input,
}: {
  userId: string;
  input: unknown;
}) {
  const parsed = transactionConfirmationSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error('The confirmation payload is invalid.');
  }

  const intent = await prisma.transactionIntent.findFirst({
    where: {
      userId,
      requestId: parsed.data.requestId,
    },
  });

  if (!intent) {
    throw new Error('The transaction intent was not found for this user.');
  }

  assertWalletMatchesIntent(parsed.data.walletAddress, intent.walletAddress);
  assertChainMatchesIntent(parsed.data.chainId, intent.chainId);

  if (isIntentExpired(intent.expiresAt)) {
    await prisma.transactionIntent.update({
      where: { id: intent.id },
      data: { status: 'expired', failureReason: 'The transaction intent expired before verification.', },
    });
    throw new Error('The transaction intent expired before confirmation could be verified.');
  }

  if (intent.status === 'confirmed') {
    return {
      ok: true,
      status: 'confirmed',
      message: 'This transaction was already verified and recorded as confirmed.',
    };
  }

  const transactionHash = parsed.data.transactionHash.trim();
  if (!transactionHash || !transactionHash.startsWith('0x')) {
    throw new Error('The transaction hash is malformed.');
  }

  const verification = await import('@/lib/blockchain').then(({ verifyTransactionOnChain }) =>
    verifyTransactionOnChain({
      chainId: intent.chainId,
      transactionHash,
      walletAddress: intent.walletAddress,
      destinationAddress: intent.destinationAddress,
      amount: Number(intent.amount),
      tokenAddress: intent.tokenAddress,
    }),
  );

  if (verification.status === 'verification_unavailable') {
    await prisma.transactionIntent.update({
      where: { id: intent.id },
      data: {
        status: 'verification_unavailable',
        transactionHash,
        failureReason: verification.message,
      },
    });

    return {
      ok: false,
      status: 'verification_unavailable',
      message: verification.message,
    };
  }

  if (verification.status !== 'verified') {
    await prisma.transactionIntent.update({
      where: { id: intent.id },
      data: {
        status: 'failed',
        transactionHash,
        failureReason: verification.message,
      },
    });

    return {
      ok: false,
      status: 'failed',
      message: verification.message,
    };
  }

  const updated = await prisma.transactionIntent.update({
    where: { id: intent.id },
    data: {
      status: 'confirmed',
      transactionHash,
      confirmedAt: new Date(),
      failureReason: null,
    },
  });

  return {
    ok: true,
    status: 'confirmed',
    requestId: updated.requestId,
    transactionHash,
    confirmedAt: updated.confirmedAt?.toISOString(),
  };
}
