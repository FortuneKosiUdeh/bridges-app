import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'public', 'events.json');
  const data = fs.readFileSync(filePath, 'utf8');
  const events = JSON.parse(data);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(events);
}
