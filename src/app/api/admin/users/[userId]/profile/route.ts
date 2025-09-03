// Admin User Profile API route (minimal)
import { NextResponse } from 'next/server';

export async function GET(
	_request: Request,
	context: { params: Promise<{ userId: string }> }
) {
	const { userId } = await context.params;
	return NextResponse.json({ ok: true, userId, message: 'Profile endpoint under construction' });
}

