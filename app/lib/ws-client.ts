let ws: WebSocket | null = null;

export function getWebSocket(): WebSocket {
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    ws = new WebSocket(`ws://${window.location.host}/api/ws`);

    ws.onopen = () => console.log('✅ WebSocket connected');
    ws.onmessage = (event) => console.log('📡 WS message:', event.data);
    ws.onclose = (event) =>
      console.log('❌ WebSocket closed — code:', event.code, 'reason:', event.reason);
    ws.onerror = (err) => console.warn('⚠️ WS error:', err);
  }
  return ws;
}
