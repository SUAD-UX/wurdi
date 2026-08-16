import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth/user';

const goalPatchSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    targetAmount: z.number().min(0).optional(),
    currentAmount: z.number().min(0).optional(),
    currency: z.string().optional(),
    targetDate: z.string().datetime().optional().nullable(),
    status: z.enum(['active', 'completed', 'archived']).optional(),
  })
  .strict();

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;
    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId: user.id },
    });

    if (!goal) {
      return NextResponse.json({ ok: false, message: 'Goal not found.' }, { status: 404 });
    }

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = goalPatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: 'The goal payload is invalid.' }, { status: 400 });
    }

    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId: user.id },
    });

    if (!goal) {
      return NextResponse.json({ ok: false, message: 'Goal not found.' }, { status: 404 });
    }

    const updated = await prisma.savingsGoal.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.targetAmount !== undefined ? { targetAmount: parsed.data.targetAmount } : {}),
        ...(parsed.data.currentAmount !== undefined ? { currentAmount: parsed.data.currentAmount } : {}),
        ...(parsed.data.currency !== undefined ? { currency: parsed.data.currency } : {}),
        ...(parsed.data.targetDate !== undefined ? { targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null } : {}),
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: updated.id,
        name: updated.name,
        targetAmount: Number(updated.targetAmount),
        currentAmount: Number(updated.currentAmount),
        currency: updated.currency,
        targetDate: updated.targetDate?.toISOString() ?? null,
        status: updated.status,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Authentication required.' },
      { status: 401 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;
    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId: user.id },
    });

    if (!goal) {
      return NextResponse.json({ ok: false, message: 'Goal not found.' }, { status: 404 });
    }

    await prisma.savingsGoal.delete({ where: { id } });
    return NextResponse.json({ ok: true, data: { deleted: true } });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Authentication required.' },
      { status: 401 },
    );
  }
}
