import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth/user';

const goalSchema = z
  .object({
    name: z.string().min(1).max(120),
    targetAmount: z.number().min(0),
    currentAmount: z.number().min(0).optional(),
    currency: z.string().default('USD'),
    targetDate: z.string().datetime().optional().nullable(),
    status: z.enum(['active', 'completed', 'archived']).optional(),
  })
  .strict();

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      ok: true,
      data: goals.map((goal) => ({
        id: goal.id,
        name: goal.name,
        targetAmount: Number(goal.targetAmount),
        currentAmount: Number(goal.currentAmount),
        currency: goal.currency,
        targetDate: goal.targetDate?.toISOString() ?? null,
        status: goal.status,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Authentication required.' },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const parsed = goalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: 'The goal payload is invalid.' }, { status: 400 });
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        targetAmount: parsed.data.targetAmount,
        currentAmount: parsed.data.currentAmount ?? 0,
        currency: parsed.data.currency,
        targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
        status: parsed.data.status ?? 'active',
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: goal.id,
        name: goal.name,
        targetAmount: Number(goal.targetAmount),
        currentAmount: Number(goal.currentAmount),
        currency: goal.currency,
        targetDate: goal.targetDate?.toISOString() ?? null,
        status: goal.status,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Authentication required.' },
      { status: 401 },
    );
  }
}
