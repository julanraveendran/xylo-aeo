import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function extractDomain(url: string): string {
  try {
    const u = url.startsWith('http') ? url : `https://${url}`;
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
  }
}

async function extractCompetitors(response: string, query: string): Promise<string[]> {
  try {
    const result = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `From this AI response about "${query}", extract the names of any products, tools or companies mentioned. Return as JSON array of strings.\n\nResponse:\n${response}\n\nReturn format: {"items": ["Name1", "Name2"]}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = result.choices[0].message.content || '{"items":[]}';
    const parsed = JSON.parse(content);
    const arr = parsed.items || parsed.products || parsed.tools || parsed.companies || [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export interface ModelResult {
  appeared: boolean;
  score: number;        // 0–3: how many of 3 runs the product appeared in
  response: string;     // first response, for display
  responses: string[];  // all 3 raw responses
  competitors: string[];
  error?: string;
}

// Run a single ChatGPT call
async function chatGPTOnce(query: string, domain: string): Promise<{ text: string; appeared: boolean }> {
  const result = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: query }],
  });
  const text = result.choices[0].message.content || '';
  return { text, appeared: text.toLowerCase().includes(domain.toLowerCase()) };
}

// Run a single Gemini call
async function geminiOnce(query: string, domain: string): Promise<{ text: string; appeared: boolean }> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: query }] }] }),
    }
  );
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(`Gemini API error: ${data.error?.message || res.status}`);
  if (!data.candidates?.length) throw new Error('Gemini returned no candidates');
  const text = data.candidates[0].content.parts[0].text;
  return { text, appeared: text.toLowerCase().includes(domain.toLowerCase()) };
}

async function runChatGPT(query: string, domain: string): Promise<ModelResult> {
  try {
    const runs = await Promise.all([
      chatGPTOnce(query, domain),
      chatGPTOnce(query, domain),
      chatGPTOnce(query, domain),
    ]);

    const score = runs.filter(r => r.appeared).length;
    const responses = runs.map(r => r.text);

    // Extract competitors from all 3 responses, deduplicate
    const allCompetitors = await Promise.all(responses.map(r => extractCompetitors(r, query)));
    const competitors = [...new Set(allCompetitors.flat())];

    return { appeared: score > 0, score, response: responses[0], responses, competitors };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ChatGPT]', message);
    return { appeared: false, score: 0, response: '', responses: [], competitors: [], error: message };
  }
}

async function runGemini(query: string, domain: string): Promise<ModelResult> {
  try {
    const runs = await Promise.all([
      geminiOnce(query, domain),
      geminiOnce(query, domain),
      geminiOnce(query, domain),
    ]);

    const score = runs.filter(r => r.appeared).length;
    const responses = runs.map(r => r.text);

    const allCompetitors = await Promise.all(responses.map(r => extractCompetitors(r, query)));
    const competitors = [...new Set(allCompetitors.flat())];

    return { appeared: score > 0, score, response: responses[0], responses, competitors };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Gemini]', message);
    return { appeared: false, score: 0, response: '', responses: [], competitors: [], error: message };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, query, email } = await req.json();

    if (!url || !query) {
      return NextResponse.json({ error: 'url and query are required' }, { status: 400 });
    }

    const domain = extractDomain(url);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Run both engines (each 3×) in parallel
    const [chatgpt, gemini] = await Promise.all([
      runChatGPT(query, domain),
      runGemini(query, domain),
    ]);

    supabaseAdmin
      .from('checks')
      .insert({
        product_url: url,
        query,
        email: email ?? null,
        user_id: user?.id ?? null,
        chatgpt_appeared: chatgpt.appeared,
        chatgpt_score: chatgpt.score,
        chatgpt_response: chatgpt.response,
        chatgpt_responses: chatgpt.responses,
        chatgpt_competitors: chatgpt.competitors,
        gemini_appeared: gemini.appeared,
        gemini_score: gemini.score,
        gemini_response: gemini.response,
        gemini_responses: gemini.responses,
        gemini_competitors: gemini.competitors,
      })
      .then(({ error }) => {
        if (error) console.error('[Supabase insert]', error.message);
      });

    return NextResponse.json({ chatgpt, gemini });
  } catch (err) {
    console.error('[/api/check]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
