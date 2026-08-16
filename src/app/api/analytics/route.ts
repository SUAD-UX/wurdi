import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth/user';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();

    const goals = await prisma.savingsGoal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const savings = await prisma.savingsRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    const totalSaved = savings.reduce((sum, record) => sum + Number(record.amount), 0);
    const monthlySeries = savings.map((record) => ({
      date: record.createdAt.toISOString(),
      value: Number(record.amount),
    }));

    return NextResponse.json({
      ok: true,
      data: {
        totalSaved,
        goalProgress: goals.map((goal) => ({
          id: goal.id,
          name: goal.name,
          targetAmount: Number(goal.targetAmount),
          currentAmount: Number(goal.currentAmount),
          status: goal.status,
          progress: goal.targetAmount.toNumber() > 0
            ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
            : 0,
        })),
        savingsSeries: monthlySeries,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Authentication required.' },
      { status: 401 },
    );
  }
}
