const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(workspaceRoot, 'PAnet 2.0 Home.html');
const outPath = path.join(workspaceRoot, 'public', 'events.json');

const monthMap = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
};

function parseInstanceDate(inst) {
  // Example: 2025-09-24T17:00:00.00
  if (!inst) return null;
  // remove trailing dots and ensure Z
  let s = inst.replace(/\.+$/, '');
  if (!s.endsWith('Z')) s = s + 'Z';
  return s;
}

function isoFromMonthDay(monthStr, dayStr) {
  const year = 2025; // assume 2025 from page
  const m = monthMap[monthStr.trim().slice(0,3)] || '01';
  const d = ('' + dayStr).padStart(2, '0');
  return `${year}-${m}-${d}T12:00:00Z`;
}

const html = fs.readFileSync(htmlPath, 'utf8');

// find the events widget block
const widgetIndex = html.indexOf('class="axero-widget axero-widget-events');
if (widgetIndex === -1) {
  console.error('Events widget not found');
  process.exit(1);
}

const ulStart = html.indexOf('<ul', widgetIndex);
const ulEnd = html.indexOf('</ul>', ulStart);
if (ulStart === -1 || ulEnd === -1) {
  console.error('Events list <ul> not found');
  process.exit(1);
}

const listHtml = html.slice(ulStart, ulEnd + 5);

const liRegex = /<li>[\s\S]*?<\/li>/g;
const items = listHtml.match(liRegex) || [];

const events = items.map((li, idx) => {
  const hrefMatch = li.match(/<a[^>]*href="([^"]+)"/i);
  const href = hrefMatch ? hrefMatch[1] : '';
  const instanceMatch = href.match(/instance=([^&\"]+)/i);
  const instance = instanceMatch ? instanceMatch[1] : null;

  const monthMatch = li.match(/<span class="month">\s*([^<]+)\s*</i);
  const dayMatch = li.match(/<span class="day">\s*([^<]+)\s*</i);
  const titleMatch = li.match(/<div class="title">\s*([^<]+?)\s*<\//i);
  const propertyMatch = li.match(/<div class="property">\s*([^<]*?)\s*<\//i);

  const month = monthMatch ? monthMatch[1].trim() : null;
  const day = dayMatch ? dayMatch[1].trim() : null;
  const title = titleMatch ? titleMatch[1].trim().replace(/&amp;/g, '&') : `Event ${idx+1}`;
  const property = propertyMatch ? propertyMatch[1].trim() : '';

  const date = instance ? parseInstanceDate(instance) : (month && day ? isoFromMonthDay(month, day) : null);

  // build event according to existing app schema
  const event = {
    id: String(idx + 1),
    title: title,
    description: '',
    date: date || null,
    location: {
      name: property || '',
      address: '',
      lat: null,
      lng: null
    },
    category: property && /zoom/i.test(property) ? 'virtual' : 'community',
    town: 'Andover',
    organizer: 'Phillips Academy',
    language: ['en'],
    bilingualFlyerURL: '',
    sourceURL: href
  };

  return event;
});

fs.writeFileSync(outPath, JSON.stringify(events, null, 2), 'utf8');
console.log(`Wrote ${events.length} events to ${outPath}`);
