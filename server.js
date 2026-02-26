const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_DIR = __dirname;
const OUTPUT_DIR = path.join(BASE_DIR, 'output');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const MIME = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildOutputHtml(data, template) {
  let html = '<html><head><meta charset="utf-8"><title>Pediatric Registration - '
    + escapeHtml(data.patient_info?.patient_name || 'Unknown') + '</title></head><body>\n';
  html += '<h1>Pediatric Registration</h1>\n';

  for (const section of template.sections) {
    html += '<h2>' + escapeHtml(section.title) + '</h2>\n';
    if (section.description) html += '<p><em>' + escapeHtml(section.description) + '</em></p>\n';

    const sectionData = data[section.id] || {};

    for (const field of section.fields) {
      html += renderFieldHtml(field, sectionData);
    }
  }

  html += '</body></html>';
  return html;
}

function renderFieldHtml(field, sectionData) {
  let html = '';
  const value = sectionData[field.id];

  if (field.type === 'checkboxGroup') {
    html += '<p><strong>' + escapeHtml(field.label) + ':</strong> ';
    if (Array.isArray(value) && value.length > 0) {
      const labels = {};
      if (field.options) field.options.forEach(o => labels[o.id || o] = o.label || o);
      const parts = value.map(v => {
        let text = escapeHtml(labels[v] || v);
        // check for detail value (checkboxGroup with hasDetail)
        const detailKey = field.id + '_' + v + '_detail';
        if (sectionData[detailKey]) text += ' (' + escapeHtml(sectionData[detailKey]) + ')';
        return text;
      });
      html += parts.join(', ');
    } else {
      html += '<em>None selected</em>';
    }
    html += '</p>\n';

  } else if (field.type === 'fieldGroup') {
    html += '<p><strong>' + escapeHtml(field.label) + ':</strong></p>\n<ul>\n';
    for (const sub of field.fields) {
      const sv = sectionData[sub.id];
      if (sv) {
        html += '<li>' + escapeHtml(sub.label) + ': ' + escapeHtml(sv) + '</li>\n';
      }
    }
    html += '</ul>\n';

  } else if (field.type === 'repeatingGroup') {
    html += '<p><strong>' + escapeHtml(field.label) + ':</strong></p>\n';
    if (Array.isArray(value) && value.length > 0) {
      html += '<table border="1" cellpadding="4" cellspacing="0">\n<tr>';
      for (const col of field.fields) html += '<th>' + escapeHtml(col.label) + '</th>';
      html += '</tr>\n';
      for (const row of value) {
        html += '<tr>';
        for (const col of field.fields) html += '<td>' + escapeHtml(row[col.id] || '') + '</td>';
        html += '</tr>\n';
      }
      html += '</table>\n';
    } else {
      html += '<p><em>No entries</em></p>\n';
    }

  } else {
    if (value !== undefined && value !== null && value !== '') {
      html += '<p><strong>' + escapeHtml(field.label) + ':</strong> ' + escapeHtml(value) + '</p>\n';
    }
  }

  return html;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Save endpoint - outputs HTML
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const data = payload.data;
        const template = payload.template;
        const patientName = (data.patient_info?.patient_name || 'unknown')
          .replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_');
        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `intake_${patientName}_${ts}.html`;
        const filePath = path.join(OUTPUT_DIR, filename);

        const outputHtml = buildOutputHtml(data, template);
        fs.writeFileSync(filePath, outputHtml, 'utf-8');

        // Also save the raw JSON alongside for re-loading
        const jsonPath = path.join(OUTPUT_DIR, filename.replace('.html', '.json'));
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, filename, path: filePath }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // List saved files
  if (req.method === 'GET' && req.url === '/saved') {
    const files = fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => ({ name: f, modified: fs.statSync(path.join(OUTPUT_DIR, f)).mtime }))
      .sort((a, b) => b.modified - a.modified);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(files));
    return;
  }

  // Load a saved file (JSON data for re-editing)
  if (req.method === 'GET' && req.url.startsWith('/load/')) {
    const filename = decodeURIComponent(req.url.slice(6));
    const filePath = path.join(OUTPUT_DIR, path.basename(filename));
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(fs.readFileSync(filePath, 'utf-8'));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File not found' }));
    }
    return;
  }

  // Serve static files
  let filePath = req.url === '/' ? '/intakeform.html' : req.url;
  filePath = path.join(BASE_DIR, filePath);
  const ext = path.extname(filePath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Intake form server running at http://localhost:${PORT}`);
});
