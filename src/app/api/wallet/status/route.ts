import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth/user';
import { fetchWalletBalance } from '@/lib/blockchain';
import { normalizeWalletAddress } from '@/lib/pnl';
import Decimal from 'decimal.js';

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      provider: 'browser-wallet',
      status: 'wallet_auth_ready',
      message:
        'WURDI now supports server-verified wallet authentication via browser wallet signing. The browser signs locally, and the server verifies the signature before creating a session.',
      frontendConsumers: ['src/components/wallet/ConnectedWalletCard.tsx'],
    },
    { status: 200 },
  );
}

// POST with { action: 'sync' } will perform a wallet sync for the authenticated user.
export async function POST(request: Request) {
  try {
    // Require authentication first — POST will perform a sync for the authenticated user's primary wallet.
    const user = await requireAuthenticatedUser();

    const wallet = await prisma.wallet.findFirst({ where: { userId: user.id }, orderBy: { isPrimary: 'desc' } });
    if (!wallet) {
      return NextResponse.json({ ok: false, message: 'No wallet is linked to this user.' }, { status: 404 });
    }

    const normalized = normalizeWalletAddress(wallet.address);

    const result = await fetchWalletBalance(normalized);
    if (!result.ok) {
      const rpcConfigured = Boolean(process.env.RPC_URL?.trim());
      const indexerConfigured = Boolean(process.env.INDEXER_URL?.trim());

      if (!rpcConfigured && !indexerConfigured) {
        return NextResponse.json(
          { ok: false, message: 'RPC_URL (or INDEXER_URL) must be configured to perform a wallet sync.' },
          { status: 503 },
        );
      }

      return NextResponse.json({ ok: false, message: result.reason ?? 'Unable to fetch wallet balances.' }, { status: 502 });
    }

    const balances = result.balances ?? [];
    const native = balances.find((balance) => balance.isNative) ?? balances.find((balance) => balance.symbol === 'ETH');

    if (!native) {
      return NextResponse.json({ ok: false, message: 'No native ETH balance was returned by the provider.' }, { status: 200 });
    }

    const chainId = native.chainId ?? Number(process.env.CHAIN_ID ?? '1');

    const existingAsset = await prisma.asset.findFirst({ where: { chainId, address: null } });

    const asset = existingAsset
      ? await prisma.asset.update({ where: { id: existingAsset.id }, data: { symbol: native.symbol, name: native.name, decimals: native.decimals ?? 18, isNative: true } })
      : await prisma.asset.create({ data: { symbol: native.symbol, name: native.name, address: null, chainId, decimals: native.decimals ?? 18, isNative: true } });

    const quantity = String(native.quantity ?? '0');

    // Fetch USD price for ETH from CoinGecko (no API key required). If price lookup fails, keep prices at 0.
    let currentPrice = '0';
    let totalValue = '0';

    try {
      const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      if (priceRes.ok) {
        const priceBody = await priceRes.json();
        const usd = priceBody?.ethereum?.usd;
        if (typeof usd === 'number') {
          const q = new Decimal(quantity);
          const p = new Decimal(usd);
          currentPrice = p.toFixed(2);
          totalValue = q.mul(p).toFixed(2);
        }
      }
    } catch (e) {
      // Ignore price fetch errors — we'll persist zero prices instead of inventing values
    }

    const averageCost = '0';
    const costBasis = '0';
    const unrealizedPnl = '0';

    const holding = await prisma.portfolioHolding.upsert({
      where: {
        userId_walletAddress_assetId_chainId: {
          userId: user.id,
          walletAddress: normalized,
          assetId: asset.id,
          chainId,
        },
      },
      update: {
        quantity,
        averageCost,
        costBasis,
        currentPrice,
        totalValue,
        unrealizedPnl,
      },
      create: {
        userId: user.id,
        walletAddress: normalized,
        chainId,
        assetId: asset.id,
        quantity,
        averageCost,
        costBasis,
        currentPrice,
        totalValue,
        unrealizedPnl,
      },
    });

    return NextResponse.json({ ok: true, data: { holding: { id: holding.id, assetId: asset.id, walletAddress: normalized, chainId, quantity } } });
  } catch (error) {
    console.error(
      '[wallet-sync] Wallet sync failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
