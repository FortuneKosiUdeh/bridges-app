const translate = require('@iamtraction/google-translate');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, target } = req.body;

  if (!text || !target) {
    return res.status(400).json({ error: 'text and target required' });
  }

  try {
    const result = await translate(text, { to: target });
    res.status(200).json({ translation: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'translation failed' });
  }
}