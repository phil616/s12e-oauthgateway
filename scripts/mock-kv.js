const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const DATA_FILE = path.join(__dirname, '../kv-data.json');

// Load initial data
let store = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log('Loaded KV data from disk.');
  } catch (e) {
    console.error('Failed to load KV data:', e);
  }
}

function saveStore() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-KV-KEY');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse URL: /api/:key
  const urlParts = req.url.split('/');
  // Expected format: /api/some-key
  if (urlParts[1] !== 'api' || !urlParts[2]) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid path. Use /api/:key' }));
    return;
  }

  const key = urlParts.slice(2).join('/'); // Allow keys with slashes if encoded properly, but simple split works for basic
  
  console.log(`[${req.method}] Key: ${key}`);

  if (req.method === 'GET') {
    if (store[key]) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(store[key]));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Key not found' }));
    }
  } else if (req.method === 'PUT' || req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const value = JSON.parse(body);
        store[key] = value;
        saveStore();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
  } else if (req.method === 'DELETE') {
    if (store[key]) {
      delete store[key];
      saveStore();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Key not found' }));
    }
  } else {
    res.writeHead(405);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Mock KV Server running at http://localhost:${PORT}/api`);
  console.log(`Data file: ${DATA_FILE}`);
});
