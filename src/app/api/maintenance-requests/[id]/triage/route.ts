import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromRequest, assertAuthorized } from '@/lib/auth/session';
import { memoryStore } from '@/lib/db/memory-store';
import { runAITriage } from '@/lib/agent/triage-agent';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContextFromRequest(req);
    const requestId = params.id;

    // 1. Load authorized maintenance request
    const request = await memoryStore.getMaintenanceRequest(auth.organizationId, requestId);
    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Maintenance request not found or unauthorized.' },
        { status: 404 }
      );
    }
    assertAuthorized(auth, request.organization_id, 'maintenance request');

    // 2. Load property
    const property = await memoryStore.getProperty(auth.organizationId, request.property_id);
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Associated property not found.' },
        { status: 404 }
      );
    }

    // 3. Load contractors
    const contractors = await memoryStore.getContractors(auth.organizationId);

    // 4. Log triage started audit event
    await memoryStore.createAuditEvent({
      organization_id: auth.organizationId,
      actor_type: 'agent',
      actor_id: 'agent_fixit_orchestrator',
      event_type: 'agent_triage_started',
      entity_type: 'request',
      entity_id: requestId,
      metadata: { unit: request.unit_number, description_preview: request.description.slice(0, 50) },
    });

    // 5. Run AI Triage Engine
    const triageResult = await runAITriage({
      request,
      property,
      contractors,
      organizationId: auth.organizationId,
    });

    // 6. Update maintenance request record
    const updatedRequest = await memoryStore.updateMaintenanceRequest(auth.organizationId, requestId, {
      ai_triage: triageResult,
      urgency: triageResult.urgency,
      category: triageResult.category,
      status: 'triaged',
    });

    // 7. Log classification generated audit event
    await memoryStore.createAuditEvent({
      organization_id: auth.organizationId,
      actor_type: 'agent',
      actor_id: 'agent_fixit_classifier',
      event_type: 'classification_generated',
      entity_type: 'request',
      entity_id: requestId,
      metadata: {
        category: triageResult.category,
        urgency: triageResult.urgency,
        is_emergency: triageResult.is_emergency,
        confidence: triageResult.confidence,
      },
    });

    if (triageResult.recommended_contractor) {
      await memoryStore.createAuditEvent({
        organization_id: auth.organizationId,
        actor_type: 'agent',
        actor_id: 'agent_contractor_engine',
        event_type: 'contractor_recommended',
        entity_type: 'contractor',
        entity_id: triageResult.recommended_contractor.contractor_id,
        metadata: {
          requestId,
          contractor_name: triageResult.recommended_contractor.contractor_name,
          company: triageResult.recommended_contractor.company,
          score: triageResult.recommended_contractor.match_score,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        request: updatedRequest,
        triage: triageResult,
      },
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('Triage endpoint error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Triage execution failed' },
      { status: err.status || 500 }
    );
  }
}
