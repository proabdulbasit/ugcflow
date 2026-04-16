import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Log for debugging - in production, integrate with Resend or SendGrid
    console.log(`[Notification] ${type}:`, data);

    // Example: Send email to creator when deliverable is reviewed
    // if (type === 'DELIVERABLE_REVIEWED') { ... }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
