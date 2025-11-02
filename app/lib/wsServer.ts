import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function getWSServer() {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
    console.log('✅ WebSocketServer created');

    wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
      console.log(ws);
      clients.add(ws);

      ws.on('close', () => {
        clients.delete(ws);
      });
    });
  }
  return wss;
}

export function broadcast(data: any) {
  const message = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
