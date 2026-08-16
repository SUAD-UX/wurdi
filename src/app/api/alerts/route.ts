import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthenticatedUser } from '@/lib/auth/user';

const alertUpdateSchema = z
  .object({
    ids: z.array(z.string()).optional(),
    isRead: z.boolean().optional(),
  })
  .strict();

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const alerts = await prisma.userAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      ok: true,
      data: alerts.map((alert) => ({
        id: alert.id,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        isRead: alert.isRead,
        metadata: alert.metadata ?? {},
        createdAt: alert.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Authentication required.' },
      { status: 401 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const parsed = alertUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: 'The alert payload is invalid.' }, { status: 400 });
    }

    const ids = parsed.data.ids ?? [];
    const isRead = parsed.data.isRead ?? true;

    const alerts = await prisma.userAlert.updateMany({
      where: { userId: user.id, ...(ids.length > 0 ? { id: { in: ids } } : {}) },
      data: { isRead },
    });

    return NextResponse.json({ ok: true, data: { count: alerts.count } });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Authentication required.' },
      { status: 401 },
    );
  }
}
