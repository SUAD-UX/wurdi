import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth/user';
import { buildPnlSummary } from '@/lib/pnl';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();

    const holdings = await prisma.portfolioHolding.findMany({
      where: { userId: user.id },
      include: { asset: true },
    });

    const trades = await prisma.tradeRecord.findMany({
      where: { userId: user.id },
      include: { asset: true },
      orderBy: { timestamp: 'asc' },
    });

    const summary = buildPnlSummary({
      trades: trades.map((trade) => ({
        quantity: Number(trade.quantity),
        unitPrice: Number(trade.unitPrice),
        totalValue: Number(trade.totalValue),
        fees: Number(trade.fees),
        type: trade.type,
        timestamp: trade.timestamp,
      })),
      holdings: holdings.map((holding) => ({
        quantity: Number(holding.quantity),
        averageCost: Number(holding.averageCost),
        currentPrice: Number(holding.currentPrice),
      })),
    });

    return NextResponse.json({ ok: true, data: summary });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Authentication required.' },
      { status: 401 },
    );
  }
}
