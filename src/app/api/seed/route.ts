import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/db/memory-store';

export async function POST(req: NextRequest) {
  try {
    await memoryStore.resetToSeed();
    return NextResponse.json({
      success: true,
      message: 'Database reset and re-seeded with synthetic demonstration data successfully.',
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      { success: false, error: err.message || 'Reseed failed' },
      { status: 500 }
    );
  }
}
