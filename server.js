// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const clients = new Set();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // WS 服务器，指定 path '/api/ws'
  const wss = new WebSocketServer({ server, path: '/api/ws' });

  wss.on('connection', (ws) => {
    console.log('📡 Client connected');
    clients.add(ws);

    ws.on('close', () => {
      console.log('❌ Client disconnected');
      clients.delete(ws);
    });

    ws.on('message', (msg) => {
      console.log('📝 Received from client:', msg.toString());
    });
  });

  // 广播函数，模拟 Twilio incoming webhook 调用
  global.broadcastWS = (data) => {
    const message = JSON.stringify(data);
    for (const ws of clients) {
      if (ws.readyState === ws.OPEN) ws.send(message);
    }
  };

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});
