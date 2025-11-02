import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json();
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const call = await client.calls.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER!,
      twiml: `<Response><Say>你好，这是一通来自 Jack 的测试呼叫。</Say></Response>`,
    });

    return NextResponse.json({ success: true, sid: call.sid });
  } catch (err: any) {
    console.error('Error creating call:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
