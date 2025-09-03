// Admin Users Analytics API route (minimal)
import { NextResponse } from 'next/server';

export async function GET() {
	return NextResponse.json({ ok: true, message: 'Analytics endpoint under construction' });
}

