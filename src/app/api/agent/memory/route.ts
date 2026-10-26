import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromRequest } from '@/lib/auth/session';
import { memoryStore } from '@/lib/db/memory-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContextFromRequest(req);
    const searchParams = req.nextUrl.searchParams;
    const propertyId = searchParams.get('property_id');
    const unitNumber = searchParams.get('unit_number');

    const allMemories = await memoryStore.getMemories(auth.organizationId);

    let filtered = allMemories;
    if (propertyId) {
      filtered = filtered.filter(m => m.property_id === propertyId);
    }
    if (unitNumber) {
      filtered = filtered.filter(
        m => m.unit_number.toLowerCase() === unitNumber.toLowerCase() || m.unit_number === 'COMMON'
      );
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch memories' },
      { status: err.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContextFromRequest(req);
    const body = await req.json();

    const { property_id, unit_number, summary, details, source, memory_type } = body;

    if (!property_id || !unit_number || !summary || !details) {
      return NextResponse.json(
        { success: false, error: 'Property ID, unit number, summary, and details are required.' },
        { status: 400 }
      );
    }

    const newMemory = await memoryStore.createMemory({
      organization_id: auth.organizationId,
      property_id,
      unit_number,
      source: source || 'operator_note',
      memory_type: memory_type || 'confirmed_history',
      summary,
      details,
      confidence: 1.0,
    });

    return NextResponse.json({ success: true, data: newMemory }, { status: 201 });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record memory' },
      { status: err.status || 500 }
    );
  }
}
