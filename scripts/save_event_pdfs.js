#!/usr/bin/env node
// Save each event detail page as a PDF using Puppeteer (requires Node + puppeteer).
// Usage:
//   node scripts/save_event_pdfs.js --cookie-file=~/.panet_cookie.txt [--out=public/flyers] [--dry-run]
// The script will load cookies from the file, open each event.sourceURL, save a PDF named <id>.pdf
// and update public/events.json.bak (writes to events.json when not --dry-run).

const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const cookieFileArg = args.find(a => a.startsWith('--cookie-file='));
const OUT = (args.find(a => a.startsWith('--out=')) || '--out=public/flyers').split('=')[1];
const DRY = args.includes('--dry-run') || args.includes('-n');

if (!cookieFileArg) {
  console.error('Missing --cookie-file argument.');
  process.exit(2);
}
const cookieFile = path.resolve(cookieFileArg.split('=')[1]);
if (!fs.existsSync(cookieFile)) {
  console.error('Cookie file not found:', cookieFile);
  process.exit(2);
}

const eventsPath = path.join(__dirname, '..', 'public', 'events.json');
let events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

(async function(){
  console.log('Preparing to save PDFs to', OUT, DRY ? '(dry-run)' : '');
  if (!DRY) fs.mkdirSync(OUT, { recursive: true });

  // parse cookie file into cookie header string
  const cookieHeader = fs.readFileSync(cookieFile, 'utf8').trim();

  // Lazy require puppeteer only when running (avoid install if not needed)
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.error('Puppeteer not installed. Run: npm install puppeteer --save-dev');
    process.exit(3);
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // set cookie header on every request
  await page.setExtraHTTPHeaders({ 'Cookie': cookieHeader, 'User-Agent': 'save_event_pdfs/1.0' });

  for (const ev of events) {
    const src = ev.sourceURL || ev.bilingualFlyerURL;
    if (!src) { console.log(ev.id, 'skipping (no sourceURL)'); continue; }
    const outFile = path.join(OUT, `${ev.id}.pdf`);
    try {
      console.log('Loading', ev.id, src);
      await page.goto(src, { waitUntil: 'networkidle2', timeout: 30000 });
      // optionally remove nav/footer if needed using page.evaluate
      if (!DRY) {
        await page.pdf({ path: outFile, format: 'A4' });
  // update ev bilingualFlyerURL to point to the saved file (front-facing path)
  ev.bilingualFlyerURL = `/flyers/${ev.id}.pdf`;
        console.log('Saved', outFile);
      } else {
        console.log('(dry-run) would save to', outFile);
      }
    } catch (err) {
      console.error(ev.id, 'failed:', err.message || err);
    }
  }

  await browser.close();

  if (!DRY) {
    // atomic write
    const tmp = eventsPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(events, null, 2), 'utf8');
    fs.renameSync(tmp, eventsPath);
    console.log('Updated', eventsPath);
    // post-check: confirm each saved PDF exists and is non-empty
    const failures = [];
    for (const ev of events) {
      const p = path.join(OUT, `${ev.id}.pdf`);
      try {
        const st = fs.statSync(p);
        if (!st.isFile() || st.size < 100) { // small threshold for empty PDFs
          failures.push({ id: ev.id, path: p, size: st.size });
        }
      } catch (e) {
        failures.push({ id: ev.id, path: p, reason: e.message });
      }
    }
    if (failures.length) {
      console.error('Post-check found problems with saved PDFs:');
      for (const f of failures) console.error(f);
      process.exit(4);
    } else {
      console.log('Post-check OK: all saved PDFs exist and appear non-empty.');
    }
  } else {
    console.log('Dry-run complete. No file changes written.');
  }
})();
