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
    messages: [
      {
        role: 'system',
        content:
          'You are a Greek language expert. Convert Greeklish or Latin-script Greek names to proper Modern Greek with correct accent marks (τόνοι). Always respond with valid JSON only, no extra text.',
      },
      {
        role: 'user',
        content: `Convert these names to proper Modern Greek with correct accents.
First name: "${firstName}"
Last name: "${lastName}"

Respond with ONLY this JSON (no markdown, no explanation):
{"firstNameGr": "...", "lastNameGr": "..."}

Examples: "Ilias" → "Ηλίας", "Zampetakis" → "Ζαμπετάκης", "Nikos" → "Νίκος", "Braoudaki" → "Μπραουδάκη"`,
      },
    ],
  });

  const raw = (completion.choices[0]?.message?.content ?? '').trim();
  // Strip markdown code fences if the model wraps the JSON
  const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(jsonStr);

  if (!parsed.firstNameGr || !parsed.lastNameGr) {
    throw new Error('Could not convert names. Please fill in manually.');
  }

  return { firstNameGr: parsed.firstNameGr, lastNameGr: parsed.lastNameGr };
}
