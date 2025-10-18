#!/usr/bin/env node
// Simple Mapbox API test: checks for MAPBOX_TOKEN and does a harmless forward geocode for 'Andover, MA'
const https = require('https');

const token = process.env.MAPBOX_TOKEN;
if (!token) {
  console.error('MAPBOX_TOKEN is not set. Set it and re-run:');
  console.error('  export MAPBOX_TOKEN=pk.your_token_here');
  process.exit(2);
}

const query = encodeURIComponent('Andover, MA');
const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1`;

https.get(url, (res) => {
  let out = '';
  res.on('data', (c) => out += c);
  res.on('end', () => {
    try {
      const j = JSON.parse(out);
      if (j.features && j.features.length) {
        const [lng, lat] = j.features[0].center;
        console.log('Mapbox test OK — sample geocode for Andover, MA ->', lat, lng);
        process.exit(0);
      } else {
        console.error('Mapbox responded but no features returned');
        process.exit(3);
      }
    } catch (err) {
      console.error('Failed to parse Mapbox response', err.message || err);
      process.exit(4);
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message || err);
  process.exit(5);
});
