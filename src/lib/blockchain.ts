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

export async function fetchWalletBalance(address: string) {
  const config = getBlockchainProviderConfig();

  if (config.provider === 'none') {
    return {
      ok: false,
      status: 'unavailable',
      reason: 'Wallet balance retrieval is not configured for a live RPC/indexer provider in this environment.',
      balances: [],
    };
  }

  // Helper: convert hex wei (0x...) to decimal ETH string with up to 18 decimals
  function weiHexToEthString(hex: string) {
    try {
      const wei = BigInt(hex);
      const WEI_PER_ETH = BigInt('1000000000000000000');
      const integer = wei / WEI_PER_ETH;
      const fraction = wei % WEI_PER_ETH;
      if (fraction === BigInt(0)) return integer.toString();
      // fractional part padded to 18 digits, then trimmed
      let frac = fraction.toString().padStart(18, '0');
      // trim trailing zeros
      frac = frac.replace(/0+$/, '');
      return `${integer.toString()}.${frac}`;
    } catch (e) {
      return '0';
    }
  }

  // Try RPC-based native balance retrieval (eth_getBalance)
  if (config.rpcUrl) {
    try {
      const res = await fetch(config.rpcUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] }),
      });

      if (!res.ok) {
        return {
          ok: false,
          status: 'unavailable',
          reason: 'The RPC provider returned a non-OK response.',
          balances: [],
        };
      }

      const data = await res.json();
      if (data.error) {
        return {
          ok: false,
          status: 'unavailable',
          reason: data.error.message ?? 'RPC provider error',
          balances: [],
        };
      }

      const result = (data.result as string | undefined) ?? '0x0';
      const ethString = weiHexToEthString(result);

      return {
        ok: true,
        status: 'ok',
        provider: 'rpc',
        balances: [
          {
            symbol: 'ETH',
            name: 'Ether',
            address: null,
            decimals: 18,
            quantity: ethString,
            chainId: config.chainId,
            isNative: true,
          },
        ],
      };
    } catch (error) {
      return {
        ok: false,
        status: 'unavailable',
        reason: error instanceof Error ? error.message : 'The RPC provider could not be reached.',
        balances: [],
      };
    }
  }

  // If we reach here, an indexer URL was configured but RPC was not available.
  return {
    ok: false,
    status: 'unavailable',
    reason: 'An indexer URL is configured but no RPC URL is available. Token-level balances require an indexer; please provide a compatible INDEXER_URL or an RPC_URL.',
    balances: [],
    provider: 'indexer',
  };
}
