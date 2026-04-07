import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface Suggestion {
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  reason: string;
}

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const u = url.startsWith('http') ? url : `https://${url}`;
    const res = await fetch(u, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; XyloAEO/1.0; +https://xylo.ai)' },
      signal: AbortSignal.timeout(6000),
    });
    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.slice(0, 1000);
  } catch {
    return '';
  }
}

// Check which citation sources appear in the AI responses (indicates competitor presence there)
function detectCitationSources(responses: string[]): string[] {
  const combined = responses.join(' ').toLowerCase();
  const sources: string[] = [];
  if (combined.includes('g2.com') || combined.includes(' g2 ') || combined.includes('g2 review')) sources.push('G2');
  if (combined.includes('capterra')) sources.push('Capterra');
  if (combined.includes('reddit')) sources.push('Reddit');
  if (combined.includes('producthunt') || combined.includes('product hunt')) sources.push('Product Hunt');
  if (combined.includes('trustpilot')) sources.push('Trustpilot');
  return sources;
}

export async function POST(req: NextRequest) {
  try {
    const { productUrl, query, competitors, chatgptResponses, geminiResponses } = await req.json();

    if (!productUrl || !query) {
      return NextResponse.json({ error: 'productUrl and query are required' }, { status: 400 });
    }

    const allResponses = [...(chatgptResponses ?? []), ...(geminiResponses ?? [])];

    // Fetch in parallel: website content + citation source detection
    const [websiteContent] = await Promise.all([
      fetchWebsiteContent(productUrl),
    ]);

    const competitorList = competitors?.length > 0
      ? competitors.join(', ')
      : 'various competitors in the space';

    const citationSources = detectCitationSources(allResponses);
    const citationContext = citationSources.length > 0
      ? `The AI responses cited these platforms when mentioning competitors: ${citationSources.join(', ')}. These are likely sources AI engines are drawing from.`
      : 'No specific review platforms or community sites were cited in the AI responses.';

    // One response from each engine for context
    const responseContext = [
      chatgptResponses?.[0] ? `ChatGPT response:\n${chatgptResponses[0].slice(0, 600)}` : null,
      geminiResponses?.[0] ? `Gemini response:\n${geminiResponses[0].slice(0, 600)}` : null,
    ]
      .filter(Boolean)
      .join('\n\n');

    const websiteContext = websiteContent
      ? `Here is their current website content (first 1000 chars):\n${websiteContent}`
      : 'Website content could not be fetched.';

    const result = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AEO (AI Engine Optimisation) expert. A founder's product at ${productUrl} did not appear when AI engines were asked "${query}".

${websiteContext}

The following competitors DID appear: ${competitorList}

${citationContext}

Based on what you can see they have and haven't done, give 3-5 specific actionable suggestions. For each suggestion, check whether they likely already have this (based on website content) — if they do, skip it and suggest something else. Focus on genuine gaps: missing comparison pages, Reddit/community presence gaps, G2/Capterra if not listed, schema markup, citation-worthy content.

Return as JSON: {"suggestions": [{ "title": string, "description": string, "effort": "low"|"medium"|"high", "impact": "low"|"medium"|"high", "reason": string }]}

The reason field must explain WHY this specific product needs this — reference their actual site content or what's visibly missing. Be specific, not generic.`,
        },
        {
          role: 'user',
          content: `Query: "${query}"\n\nAI responses that did not mention the product:\n${responseContext}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = result.choices[0].message.content || '{"suggestions":[]}';
    const parsed = JSON.parse(content);
    const suggestions: Suggestion[] = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('[/api/suggestions]', err);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
