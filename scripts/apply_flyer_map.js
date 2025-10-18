#!/usr/bin/env node
// Apply a mapping of event id -> flyer PDF URL to public/events.json
// Place a JSON file at data/flyer_map.json with content like:
// { "CF-1": "https://example.org/flyers/cf-1.pdf", "A-2": "..." }
// Then run: node scripts/apply_flyer_map.js

const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, '..', 'data', 'flyer_map.json');
const eventsPath = path.join(__dirname, '..', 'public', 'events.json');

if (!fs.existsSync(mapPath)) {
  console.error('Mapping file not found:', mapPath);
  console.error('Create a mapping file at data/flyer_map.json with a JSON object of event id -> pdf URL.');
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

let changed = 0;
for (const ev of events) {
  if (map[ev.id]) {
    const old = ev.bilingualFlyerURL || null;
    ev.bilingualFlyerURL = map[ev.id];
    changed++;
    console.log(`Applied: ${ev.id} -> ${map[ev.id]} (was: ${old})`);
  }
}

if (changed === 0) {
  console.log('No mappings applied (no matching event ids found).');
  process.exit(0);
}

// atomic write
const tmp = eventsPath + '.tmp';
fs.writeFileSync(tmp, JSON.stringify(events, null, 2), 'utf8');
fs.renameSync(tmp, eventsPath);
console.log(`Updated ${eventsPath} with ${changed} mappings.`);
