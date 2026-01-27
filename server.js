import { WebSocketServer } from 'ws';
import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create temp directory for downloads
const tempDir = path.join(__dirname, 'temp_logs');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Function to recursively download files from a directory URL
async function downloadLogsFromUrl(baseUrl, localDir) {
  try {
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);
    const links = $('a').map((i, el) => $(el).attr('href')).get();

    for (const link of links) {
      if (link === '../') continue;
      const fullUrl = new URL(link, baseUrl).href;
      const localPath = path.join(localDir, link);

      if (link.endsWith('/')) {
        // Directory
        const dirPath = path.join(localDir, link);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        await downloadLogsFromUrl(fullUrl, dirPath);
      } else {
        // File
        const fileResponse = await axios.get(fullUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(localPath);
        fileResponse.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
      }
    }
  } catch (error) {
    console.error(`Error downloading from ${baseUrl}:`, error.message);
  }
}

// API endpoint to download logs
app.get('/api/download-logs', async (req, res) => {
  try {
    const urls = ['http://172.31.28.18/log1/', 'http://172.31.18.207/log2/'];
    
    for (const url of urls) {
      const urlObj = new URL(url);
      const localDir = path.join(tempDir, urlObj.hostname + urlObj.pathname.replace(/\/$/, ''));
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      await downloadLogsFromUrl(url, localDir);
    }
    
    res.json({ message: 'Logs downloaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to parse logs from downloaded files
function parseLogs() {
  const logs = [];
  
  function readDirRecursive(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        readDirRecursive(fullPath);
      } else {
        // Read file and parse logs
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            let logEntry = null;
            
            // Try to parse as JSON (Wazuh, Suricata)
            try {
              const json = JSON.parse(line);
              let source = 'unknown';
              if (json.rule && json.rule.groups) {
                source = 'wazuh';
              } else if (json.event_type === 'alert' || json.event_type === 'http' || json.event_type === 'dns') {
                source = 'suricata';
              } else if (json.action === 'FOUND' || json.action === 'OK') {
                source = 'clamav';
              }
              
              logEntry = {
                timestamp: json.timestamp || json.time || new Date().toISOString(),
                level: json.level || json.rule?.level || json.alert?.severity || 'info',
                message: json.message || json.rule?.description || json.alert?.signature || JSON.stringify(json),
                source: source
              };
            } catch {
              // Not JSON, parse as text log (ClamAV)
              // Assume format: timestamp level message
              const parts = line.split(' ');
              if (parts.length >= 3) {
                let source = 'unknown';
                if (line.includes('FOUND') || line.includes('OK')) {
                  source = 'clamav';
                }
                logEntry = {
                  timestamp: parts[0] + ' ' + parts[1],
                  level: parts[2],
                  message: parts.slice(3).join(' '),
                  source: source
                };
              }
            }
            
            if (logEntry) {
              logs.push(logEntry);
            }
          } catch (error) {
            console.error(`Error parsing line: ${line}`, error);
          }
        }
      }
    }
  }
  
  if (fs.existsSync(tempDir)) {
    readDirRecursive(tempDir);
  }
  
  return logs;
}

// API endpoint to get logs
app.get('/api/logs', (req, res) => {
  const logs = parseLogs();
  res.json(logs);
});

// WebSocket server for SSH
const wss = new WebSocketServer({ port: 8080 });

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

// Start Express server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});