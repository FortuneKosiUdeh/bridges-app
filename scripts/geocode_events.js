const fs = require('fs');
const path = require('path');
const https = require('https');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run') || args.includes('-n');

const eventsPath = path.join(__dirname, '..', 'public', 'events.json');
const raw = fs.readFileSync(eventsPath, 'utf8');
let events = JSON.parse(raw);

function geocode(query) {
  const encoded = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
  const options = {
    headers: {
      'User-Agent': 'Bridges App/1.0 (https://github.com/gemini/bridges)'
    }
  };

  console.log(`Geocoding query: ${query}`);

  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed && parsed.length > 0) {
            const { lat, lon: lng } = parsed[0];
            resolve({ lat: parseFloat(lat), lng: parseFloat(lng) });
          } else {
            resolve(null);
          }
        } catch (err) { reject(err); }
      });
    }).on('error', reject);
  });
}

// Simple local fallback for dry-run/demo to provide plausible coords for known places
function localLookup(query) {
  const q = (query || '').toLowerCase();
  if (q.includes('snyder center')) return {lat: 42.6575, lng: -71.1289};
  if (q.includes('addison gallery')) return {lat: 42.6550, lng: -71.1265};
  if (q.includes('john barry')) return {lat: 42.6578, lng: -71.1280};
  if (q.includes('chapel')) return {lat: 42.6570, lng: -71.1276};
  if (q.includes('abbot campus')) return {lat: 42.6600, lng: -71.1230};
  if (q.includes('phillips academy')) return {lat: 42.6473, lng: -71.1316};
  if (q.includes('andover')) return {lat: 42.6583, lng: -71.1326};
  return null;
}

(async function main(){
  console.log('Geocoding events...');
  for (const ev of events) {
    if (!ev.location) ev.location = {name:'',address:'',lat:null,lng:null};
    if (ev.location.lat == 0 || ev.location.lng == 0) {
      // Prefer explicit address, then name + town
      const parts = [];
      if (ev.location.address) parts.push(ev.location.address);
      else if (ev.location.name) parts.push(ev.location.name);
      if (ev.town) parts.push(ev.town);
      const query = parts.join(', ') || ev.title;
        try {
          let coords = await geocode(query);
          if (!coords) coords = localLookup(query);
          if (coords) {
            console.log(`Geocoded: ${ev.id} -> ${coords.lat},${coords.lng}`);
            if (!DRY) {
              ev.location.lat = coords.lat;
              ev.location.lng = coords.lng;
            }
          } else {
            console.log(`No geocode for ${ev.id} (query: ${query})`);
          }
        } catch (err) {
          console.error('Geocode error for', ev.id, err.message || err);
        }
      // Small delay to be polite
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  if (!DRY) {
    // Atomic write
    const tmp = eventsPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(events, null, 2), 'utf8');
    fs.renameSync(tmp, eventsPath);
    console.log('Done: updated', eventsPath);
  } else {
    console.log('Dry-run mode: no file changes written.');
  }
})();
