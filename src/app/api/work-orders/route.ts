import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromRequest } from '@/lib/auth/session';
import { memoryStore } from '@/lib/db/memory-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContextFromRequest(req);
    const workOrders = await memoryStore.getWorkOrders(auth.organizationId);
    const requests = await memoryStore.getMaintenanceRequests(auth.organizationId);
    const contractors = await memoryStore.getContractors(auth.organizationId);
    const properties = await memoryStore.getProperties(auth.organizationId);

    const requestMap = new Map(requests.map(r => [r.id, r]));
    const contractorMap = new Map(contractors.map(c => [c.id, c]));
    const propertyMap = new Map(properties.map(p => [p.id, p]));

    // Enrich work order data for UI
    const enriched = workOrders.map(wo => {
      const relatedReq = requestMap.get(wo.request_id);
      const contractor = wo.contractor_id ? contractorMap.get(wo.contractor_id) : undefined;
      const property = relatedReq ? propertyMap.get(relatedReq.property_id) : undefined;

      return {
        ...wo,
        maintenance_request: relatedReq,
        contractor,
        property,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch work orders' },
      { status: err.status || 500 }
    );
  }
}
