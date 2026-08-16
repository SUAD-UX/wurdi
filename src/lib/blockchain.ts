export interface BlockchainProviderStatus {
  configured: boolean;
  supported: boolean;
  liveVerified: boolean;
  message: string;
  rpcUrlConfigured: boolean;
  indexerUrlConfigured: boolean;
}

export interface BlockchainProviderConfig {
  chainId: number;
  rpcUrl?: string;
  indexerUrl?: string;
  provider: 'none' | 'rpc' | 'indexer' | 'hybrid';
}

export function getBlockchainProviderConfig(): BlockchainProviderConfig {
  const chainId = Number(process.env.CHAIN_ID ?? '1');
  const rpcUrl = process.env.RPC_URL?.trim();
  const indexerUrl = process.env.INDEXER_URL?.trim();

  const provider = rpcUrl && indexerUrl ? 'hybrid' : rpcUrl ? 'rpc' : indexerUrl ? 'indexer' : 'none';

  return {
    chainId: Number.isFinite(chainId) ? chainId : 1,
    rpcUrl: rpcUrl || undefined,
    indexerUrl: indexerUrl || undefined,
    provider,
  };
}

export function getBlockchainProviderStatus(): BlockchainProviderStatus {
  const config = getBlockchainProviderConfig();

  if (config.provider === 'none') {
    return {
      configured: false,
      supported: true,
      liveVerified: false,
      rpcUrlConfigured: false,
      indexerUrlConfigured: false,
      message: 'No blockchain RPC/indexer configuration is present. Real on-chain data is intentionally unavailable.',
    };
  }

  return {
    configured: true,
    supported: true,
    liveVerified: false,
    rpcUrlConfigured: Boolean(config.rpcUrl),
    indexerUrlConfigured: Boolean(config.indexerUrl),
    message: 'Blockchain provider configuration is present, but live verification has not been completed in this environment.',
  };
}

export type BlockchainVerificationStatus = 'verified' | 'pending' | 'failed' | 'verification_unavailable';

export interface TransactionVerificationResult {
  status: BlockchainVerificationStatus;
  verified: boolean;
  message: string;
  chainId?: number;
  blockNumber?: number;
  receipt?: Record<string, unknown>;
}

export async function verifyTransactionOnChain({
  chainId,
  transactionHash,
  walletAddress,
  destinationAddress,
  amount,
  tokenAddress,
}: {
  chainId: number;
  transactionHash: string;
  walletAddress: string;
  destinationAddress: string;
  amount: number;
  tokenAddress?: string | null;
}): Promise<TransactionVerificationResult> {
  const config = getBlockchainProviderConfig();
  const normalizedTxHash = transactionHash.trim();

  if (!normalizedTxHash || !normalizedTxHash.startsWith('0x')) {
    return {
      status: 'failed',
      verified: false,
      message: 'The transaction hash is malformed.',
    };
  }

  if (config.provider === 'none' || !config.rpcUrl) {
    return {
      status: 'verification_unavailable',
      verified: false,
      message: 'Blockchain verification is unavailable because no RPC endpoint is configured.',
    };
  }

  if (config.chainId !== chainId) {
    return {
      status: 'failed',
      verified: false,
      message: 'The transaction chain does not match the configured application chain.',
      chainId,
    };
  }

  try {
    const response = await fetch(config.rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionReceipt',
        params: [normalizedTxHash],
      }),
    });

    if (!response.ok) {
      return {
        status: 'verification_unavailable',
        verified: false,
        message: 'The blockchain provider returned an unexpected response.',
      };
    }

    const data = (await response.json()) as { result?: Record<string, unknown>; error?: { message?: string } };

    if (data.error) {
      return {
        status: 'pending',
        verified: false,
        message: data.error.message ?? 'The transaction receipt is not yet available.',
      };
    }

    const receipt = data.result as Record<string, unknown> | undefined;
    if (!receipt) {
      return {
        status: 'pending',
        verified: false,
        message: 'The transaction has not yet produced a receipt.',
      };
    }

    const statusValue = (receipt.status as string | undefined) ?? '0x0';
    const from = String((receipt.from as string | undefined) ?? '').toLowerCase();
    const to = String((receipt.to as string | undefined) ?? '').toLowerCase();
    const value = (receipt.value as string | undefined) ?? '0';

    if (statusValue !== '0x1') {
      return {
        status: 'failed',
        verified: false,
        message: 'The blockchain transaction failed or the receipt indicates a non-successful execution.',
        receipt,
      };
    }

    if (from !== walletAddress.toLowerCase()) {
      return {
        status: 'failed',
        verified: false,
        message: 'The transaction sender does not match the linked wallet.',
        receipt,
      };
    }

    if (to !== destinationAddress.toLowerCase()) {
      return {
        status: 'failed',
        verified: false,
        message: 'The transaction destination does not match the prepared intent.',
        receipt,
      };
    }

    if (!tokenAddress && value !== '0x0') {
      const expectedWei = BigInt(Math.round(amount * 1e18)).toString(16);
      if (value.toLowerCase() !== `0x${expectedWei}`.toLowerCase()) {
        return {
          status: 'failed',
          verified: false,
          message: 'The transaction amount does not match the prepared intent.',
          receipt,
        };
      }
    }

    return {
      status: 'verified',
      verified: true,
      message: 'The blockchain transaction was independently verified.',
      chainId,
      blockNumber: Number((receipt.blockNumber as string | undefined) ?? 0),
      receipt,
    };
  } catch (error) {
    return {
      status: 'verification_unavailable',
      verified: false,
      message: error instanceof Error ? error.message : 'The blockchain provider could not be reached.',
    };
  }
}

export async function fetchWalletBalance() {
  const config = getBlockchainProviderConfig();

  if (config.provider === 'none') {
    return {
      ok: false,
      status: 'unavailable',
      reason: 'Wallet balance retrieval is not configured for a live RPC provider in this environment.',
      balances: [],
    };
  }

  return {
    ok: false,
    status: 'unavailable',
    reason: 'Live blockchain balance retrieval is not yet verified in this environment. No wallet balances are treated as authoritative until a confirmed provider response is received.',
    balances: [],
    provider: config.provider,
  };
}
