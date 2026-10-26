import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromRequest } from '@/lib/auth/session';
import { memoryStore } from '@/lib/db/memory-store';
import { runEvaluationSuite } from '@/lib/agent/evaluation-suite';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContextFromRequest(req);
    const contractors = await memoryStore.getContractors(auth.organizationId);
    const properties = await memoryStore.getProperties(auth.organizationId);

    const report = await runEvaluationSuite(contractors, properties, auth.organizationId);

    return NextResponse.json({
      success: true,
      data: report,
      eon_integration: {
        status: process.env.EON_API_KEY ? 'active' : 'local_standalone_suite',
        description: 'FixIt AI Benchmark Suite compatible with Era by Eon evaluation framework specifications.',
      },
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    return NextResponse.json(
      { success: false, error: err.message || 'Evaluation suite run failed' },
      { status: err.status || 500 }
    );
  }
}
