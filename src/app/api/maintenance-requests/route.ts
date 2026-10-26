import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromRequest } from '@/lib/auth/session';
import { memoryStore } from '@/lib/db/memory-store';
import { IssueCategory, UrgencyLevel } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContextFromRequest(req);
    const requests = await memoryStore.getMaintenanceRequests(auth.organizationId);
    return NextResponse.json({ success: true, data: requests });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error' },
      { status: err.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContextFromRequest(req);
    const body = await req.json();

    const {
      property_id,
      unit_number,
      category,
      description,
      reported_at,
      tenant_name,
      tenant_phone,
      photo_url,
      urgency,
    } = body;

    // Validation
    if (!property_id || !unit_number || !description) {
      return NextResponse.json(
        { success: false, error: 'Property, unit number, and description are required.' },
        { status: 400 }
      );
    }

    // Verify property belongs to organization
    const property = await memoryStore.getProperty(auth.organizationId, property_id);
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Referenced property not found in your organization.' },
        { status: 404 }
      );
    }

    const newRequest = await memoryStore.createMaintenanceRequest({
      organization_id: auth.organizationId,
      property_id,
      unit_number: String(unit_number).trim(),
      category: (category as IssueCategory) || 'general_maintenance',
      description: String(description).trim(),
      urgency: (urgency as UrgencyLevel) || 'normal',
      status: 'submitted',
      reported_at: reported_at || new Date().toISOString(),
      created_by: `${auth.userName} (${auth.role})`,
      tenant_name: tenant_name ? String(tenant_name).trim() : undefined,
      tenant_phone: tenant_phone ? String(tenant_phone).trim() : undefined,
      photo_url: photo_url ? String(photo_url).trim() : undefined,
    });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create maintenance request' },
      { status: err.status || 500 }
    );
  }
}
