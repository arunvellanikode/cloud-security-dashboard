const WebSocket = require('ws');
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

// WebSocket server for SSH
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const host = url.searchParams.get('host');
  const username = url.searchParams.get('username');
  const port = url.searchParams.get('port') || 22;

  if (!host || !username) {
    ws.send('Error: Missing host or username');
    ws.close();
    return;
  }

  const conn = new Client();
  conn.on('ready', () => {
    console.log('SSH connection established');
    conn.shell((err, stream) => {
      if (err) {
        ws.send('Error: ' + err.message);
        ws.close();
        return;
      }

      stream.on('close', () => {
        console.log('SSH stream closed');
        conn.end();
        ws.close();
      });

      stream.on('data', (data) => {
        ws.send(data.toString());
      });

      ws.on('message', (message) => {
        stream.write(message);
      });

      ws.on('close', () => {
        stream.end();
      });
    });
  });

  conn.on('error', (err) => {
    console.error('SSH connection error:', err);
    ws.send('SSH connection error: ' + err.message);
    ws.close();
  });

  conn.connect({
    host: host,
    port: port,
    username: username,
    privateKey: fs.readFileSync(path.join(__dirname, 'keyfile', 'NewPem.pem')),
    // For demo, assuming no passphrase
  });
});

console.log('SSH WebSocket server running on port 8080');