import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text, target } = req.body;
  if (!text || !target) return res.status(400).json({ error: 'text and target required' });

  try {
    const prompt = `Translate the following text to ${target} preserving meaning and civic tone:\n\n${text}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800
    });
    const translation = completion.choices?.[0]?.message?.content ?? '';
    res.status(200).json({ translation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'translation failed' });
  }
}
