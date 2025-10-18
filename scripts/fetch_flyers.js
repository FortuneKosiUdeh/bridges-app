#!/usr/bin/env node
// Fetch event detail pages and extract /files/... PDF links to set bilingualFlyerURL
// Usage:
//   node scripts/fetch_flyers.js --check     # check connectivity to first event
//   node scripts/fetch_flyers.js --dry-run   # preview replacements, don't write
//   node scripts/fetch_flyers.js               # run and update public/events.json
// Optional auth (for SSO-protected pages):
//   node scripts/fetch_flyers.js --cookie="name=...; name2=..."    # pass cookie string
//   node scripts/fetch_flyers.js --cookie-file="/path/to/cookie.txt" # read cookie from file
// NOTE: Do NOT paste sensitive cookies into public channels. Prefer using a local cookie file and
//       run this script locally on your machine where your browser session is active.

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run') || args.includes('-n');
const CHECK = args.includes('--check');

// cookie handling: --cookie="k=v; k2=v2"  or --cookie-file="/abs/path"
const cookieArg = args.find(a => a.startsWith('--cookie='));
const cookieFileArg = args.find(a => a.startsWith('--cookie-file='));
let COOKIE = null;
if (cookieArg) {
  COOKIE = cookieArg.split('=')[1];
} else if (cookieFileArg) {
  const p = cookieFileArg.split('=')[1];
  try {
    COOKIE = fs.readFileSync(path.resolve(p), 'utf8').trim();
  } catch (e) {
    console.error('Failed to read cookie file', p, e.message || e);
    process.exit(2);
  }
}

const eventsPath = path.join(__dirname, '..', 'public', 'events.json');
const raw = fs.readFileSync(eventsPath, 'utf8');
let events = JSON.parse(raw);

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    try {
      const headers = { 'User-Agent': 'fetch_flyers/1.0' };
      if (COOKIE) headers['Cookie'] = COOKIE;
      const req = https.get(url, { headers }, (res) => {
        const { statusCode, headers } = res;
        if (statusCode >= 300 && statusCode < 400 && headers.location && redirects < 5) {
          // follow redirect
          const next = new URL(headers.location, url).toString();
          res.resume();
          resolve(fetchUrl(next, redirects + 1));
          return;
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => body += c);
        res.on('end', () => resolve({ statusCode, body }));
      });
      req.on('error', reject);
      req.setTimeout(15000, () => { req.destroy(new Error('timeout')); });
    } catch (err) { reject(err); }
  });
}

function findFileLinks(html, baseUrl) {
  const links = [];
  // match href=".../files/..."
  const re = /href\s*=\s*"([^"]*\/files\/[^"']+)"/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const u = new URL(m[1], baseUrl).toString();
      links.push(u);
    } catch (e) {
      // ignore
    }
  }
  // prefer pdf links
  const pdfs = links.filter(l => l.toLowerCase().endsWith('.pdf'));
  return { all: links, pdfs };
}

(async function main(){
  if (!events || !events.length) {
    console.error('No events found in', eventsPath);
    process.exit(1);
  }

  if (CHECK) {
    const first = events[0];
    console.log('Checking connectivity to', first.sourceURL);
    try {
      const r = await fetchUrl(first.sourceURL);
      console.log('Status:', r.statusCode);
      console.log('Snippet:', r.body.slice(0, 400));
      process.exit(0);
    } catch (err) {
      console.error('Request failed:', err.message || err);
      process.exit(2);
    }
  }

  console.log((DRY ? 'Dry-run: previewing' : 'Running') + ' — fetching event detail pages to extract /files/ links');
  const report = [];
  for (const ev of events) {
    const src = ev.sourceURL || ev.bilingualFlyerURL;
    if (!src) { report.push({ id: ev.id, found: false, reason: 'no sourceURL' }); continue; }
    try {
      const res = await fetchUrl(src);
      const { statusCode, body } = res;
      if (!body) { report.push({ id: ev.id, found: false, reason: 'empty body', statusCode }); continue; }
      const { all, pdfs } = findFileLinks(body, src);
      let chosen = null;
      if (pdfs.length) chosen = pdfs[0];
      else if (all.length) chosen = all[0];
      if (chosen) {
        report.push({ id: ev.id, found: true, statusCode, old: ev.bilingualFlyerURL || null, next: chosen });
        if (!DRY) ev.bilingualFlyerURL = chosen;
      } else {
        report.push({ id: ev.id, found: false, statusCode, reason: 'no /files/ links' });
      }
    } catch (err) {
      report.push({ id: ev.id, found: false, reason: (err.message || err).toString() });
    }
    // polite delay
    await new Promise(r => setTimeout(r, 200));
  }

  // show report summary
  for (const r of report) {
    if (r.found) console.log(`${r.id}: found -> ${r.next}`);
    else console.log(`${r.id}: NOT FOUND (${r.reason || r.statusCode || 'unknown'})`);
  }

  if (!DRY) {
    // atomic write
    const tmp = eventsPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(events, null, 2), 'utf8');
    fs.renameSync(tmp, eventsPath);
    console.log('Updated', eventsPath);
  } else {
    console.log('Dry-run: no file changes written.');
  }
})();
