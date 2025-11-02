'use client';
import { useState, useEffect } from "react";
import { Phone_status } from "./const";
import { getWebSocket } from './lib/ws-client';

let ws: WebSocket | null = null;
let defaultTestNumber = '+12340987098';

export default function Home() {
  const [phoneStatus, setPhoneStatus] = useState(Phone_status.normal);
  const [phoneNumber, setPhoneNumber] = useState(defaultTestNumber);
  const [incomingNumber, setIncomingNumber] = useState<string | null>(null);

  // WebSocket
  useEffect(() => {
    ws = getWebSocket();

    const handleMessage = (event: MessageEvent) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.error('data parse error', err);
        data = {};
      }
      console.log('📡 WebSocket message:', data);

      if (data.type === 'incoming_call') {
        setPhoneStatus(Phone_status.incoming);
        setIncomingNumber(data.from);
      } else if (data.type === 'call_connected') {
        // 来电接通或拨号接通
        setPhoneStatus(Phone_status.talking);
      }
    };

    ws.addEventListener('message', handleMessage);
    ws.onopen = () => console.log('✅ WebSocket connected');
    ws.onclose = () => console.log('❌ WebSocket closed');

    return () => {
      ws?.removeEventListener('message', handleMessage);
      ws = null;
    };
  }, []);

  const handleCall = async (toNumber?: string) => {
    const target = toNumber || phoneNumber;
    if (!target) return alert("请输入电话号码");

    setPhoneStatus(Phone_status.calling);

    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: target }),
      });
      const data = await res.json();

      if (data.success) {
        console.log(`呼叫成功，SID: ${data.sid}`);
        // 如果立即认为对方接听，也可直接进入 talking
        // setPhoneStatus(Phone_status.talking);
      } else {
        console.log('呼叫失败: ' + data.error);
        alert("呼叫失败请稍后重试");
        setPhoneStatus(Phone_status.normal);
      }
    } catch (err) {
      console.error(err);
      setPhoneStatus(Phone_status.normal);
    }
  };

  const handleAnswerIncoming = () => {
    // 接听电话
    setPhoneStatus(Phone_status.talking);
    // TODO: 可以向服务端发送接听事件
    ws?.send(JSON.stringify({ type: 'answer_call', from: incomingNumber }));
  };

  const handleHangUp = () => {
    // 挂断电话
    setPhoneStatus(Phone_status.normal);
    setIncomingNumber(null);
    // TODO: 可以向服务端发送挂断事件
    ws?.send(JSON.stringify({ type: 'hangup_call' }));
  };

  const renderNormalUI = () => (
    <div className="flex flex-col items-center gap-4">
      <input
        type="text"
        placeholder="输入电话号码"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="border px-3 py-2 rounded w-64"
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => handleCall(phoneNumber)}
      >
        Call
      </button>
    </div>
  );

  const renderCallingUI = () => (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg">📞 电话正在拨出...</p>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={handleHangUp}
      >
        取消
      </button>
    </div>
  );

  const renderIncomingUI = () => (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg">📞 来电: {incomingNumber}</p>
      <div className="flex gap-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleAnswerIncoming}
        >
          接听
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleHangUp}
        >
          拒接
        </button>
      </div>
    </div>
  );

  const renderTalkingUI = () => (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg">💬 通话中 {incomingNumber || phoneNumber}</p>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={handleHangUp}
      >
        挂断
      </button>
    </div>
  );

  const renderPhoneUI = () => {
    switch (phoneStatus) {
      case Phone_status.normal:
        return renderNormalUI();
      case Phone_status.calling:
        return renderCallingUI();
      case Phone_status.incoming:
        return renderIncomingUI();
      case Phone_status.talking:
        return renderTalkingUI();
      default:
        console.error('未知状态: ', phoneStatus);
        return <p>未知状态</p>;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-md flex-col items-center justify-center py-32 px-8 bg-white dark:bg-black rounded shadow-lg">
        {renderPhoneUI()}
      </main>
    </div>
  );
}
