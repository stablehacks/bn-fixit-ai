import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromRequest } from '@/lib/auth/session';
import { memoryStore } from '@/lib/db/memory-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContextFromRequest(req);
    const auditEvents = await memoryStore.getAuditEvents(auth.organizationId);
    return NextResponse.json({ success: true, data: auditEvents });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch audit events' },
      { status: err.status || 500 }
    );
  }
}
