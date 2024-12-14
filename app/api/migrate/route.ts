import { NextResponse } from 'next/server';
import { migrateAddedByField } from '@/lib/spotify';

export async function GET() {
    try {
        await migrateAddedByField();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json(
            { error: 'Migration failed' },
            { status: 500 }
        );
    }
} 