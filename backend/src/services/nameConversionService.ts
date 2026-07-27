import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export async function suggestGreekNames(
  firstName: string,
  lastName: string,
): Promise<{ firstNameGr: string; lastNameGr: string }> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'You are a Greek language expert. Convert Greeklish or Latin-script Greek names to proper Modern Greek with correct accent marks (τόνοι). Return only a JSON object.',
      },
      {
        role: 'user',
        content: `Convert these names to proper Modern Greek with correct accents.
First name: "${firstName}"
Last name: "${lastName}"

Return ONLY this JSON, nothing else:
{"firstNameGr": "...", "lastNameGr": "..."}

Examples: "Ilias" → "Ηλίας", "Zampetakis" → "Ζαμπετάκης", "Nikos" → "Νίκος", "Braoudaki" → "Μπραουδάκη"`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw);

  if (!parsed.firstNameGr || !parsed.lastNameGr) {
    throw new Error('Could not convert names. Please fill in manually.');
  }

  return { firstNameGr: parsed.firstNameGr, lastNameGr: parsed.lastNameGr };
}
