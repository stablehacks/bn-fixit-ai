import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromRequest, assertAuthorized } from '@/lib/auth/session';
import { memoryStore } from '@/lib/db/memory-store';
import { WorkOrderStatus } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContextFromRequest(req);
    const workOrderId = params.id;
    const body = await req.json();

    const { status, notes, simulated_dispatch } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Target status is required.' },
        { status: 400 }
      );
    }

    // 1. Fetch work order
    const existing = await memoryStore.getWorkOrder(auth.organizationId, workOrderId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Work order not found or unauthorized.' },
        { status: 404 }
      );
    }
    assertAuthorized(auth, existing.organization_id, 'work order');

    // 2. Perform transition with validation
    const updated = await memoryStore.updateWorkOrderStatus(
      auth.organizationId,
      workOrderId,
      status as WorkOrderStatus,
      auth.userName,
      notes
    );

    // If simulated contractor dispatch requested
    if (simulated_dispatch && updated) {
      const contractor = updated.contractor_id
        ? await memoryStore.getContractor(auth.organizationId, updated.contractor_id)
        : null;
      const contractorName = contractor ? `${contractor.name} (${contractor.company})` : 'Assigned contractor';

      const simulatedNote = `[Simulated Action] Dispatch notification drafted and queued for ${contractorName}. No real external transmission sent.`;
      const currentSimulated = updated.simulated_actions || [];
      updated.simulated_actions = [...currentSimulated, simulatedNote];
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || 'Status transition failed' },
      { status: err.status || 400 }
    );
  }
}
