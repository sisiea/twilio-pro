// app/api/incoming/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const from = body.get('From') as string;
  const callSid = body.get('CallSid') as string;

  console.log('📞 Incoming call from', from);

  // ✅ 通知前端有来电
  if (global.broadcastWS) {
    global.broadcastWS({
      type: 'incoming_call',
      from,
      callSid,
    });
  }

  // 返回简单的 TwiML，先等待接听命令
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();
  twiml.say('正在等待接听。');

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
