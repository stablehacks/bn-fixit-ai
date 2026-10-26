import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromRequest, assertAuthorized } from '@/lib/auth/session';
import { memoryStore } from '@/lib/db/memory-store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContextFromRequest(req);
    const requestId = params.id;

    const request = await memoryStore.getMaintenanceRequest(auth.organizationId, requestId);
    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Maintenance request not found or unauthorized.' },
        { status: 404 }
      );
    }

    assertAuthorized(auth, request.organization_id, 'maintenance request');

    // Retrieve property details
    const property = await memoryStore.getProperty(auth.organizationId, request.property_id);
    // Retrieve historical memories for unit
    const memories = await memoryStore.getMemories(auth.organizationId);
    const unitMemories = memories.filter(
      m => m.property_id === request.property_id && m.unit_number.toLowerCase() === request.unit_number.toLowerCase()
    );

    return NextResponse.json({
      success: true,
      data: {
        ...request,
        property,
        historical_memories: unitMemories,
      },
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching maintenance request' },
      { status: err.status || 500 }
    );
  }
}
