'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { SuggestionsSection } from './SuggestionsSection';

interface ModelResult {
  appeared: boolean;
  score: number;
  response: string;
  responses: string[];
  competitors: string[];
  error?: string;
}

interface Results {
  url: string;
  query: string;
  chatgpt: ModelResult;
  gemini: ModelResult;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Results | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('xylo_results');
    if (stored) setResults(JSON.parse(stored));

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (!user) return;

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', user.id)
        .single();

      const active = sub?.status === 'active' || sub?.status === 'trialing';
      const notExpired = sub ? new Date(sub.current_period_end) > new Date() : false;
      setIsPaid(active && notExpired);
    });
  }, []);

  if (!results) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No results found.</p>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">← Run a check</Link>
        </div>
      </main>
    );
  }

  const appearedCount = [results.chatgpt, results.gemini].filter(r => !r.error && r.appeared).length;
  const totalCount = [results.chatgpt, results.gemini].filter(r => !r.error).length;

  return (
    <main className="min-h-screen bg-gray-950 py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">← New check</Link>
          <h1 className="text-3xl font-bold text-white mt-5 mb-1">Visibility report</h1>
          <p className="text-gray-400 text-sm">
            Query: <span className="text-gray-200 font-medium">"{results.query}"</span>
            <span className="mx-2 text-gray-600">·</span>
            <span className="text-gray-200 font-medium">{results.url}</span>
          </p>
        </div>

        {/* Summary banner */}
        <div className={`rounded-xl px-6 py-5 mb-8 border ${
          appearedCount === 2 ? 'bg-green-950/40 border-green-800'
          : appearedCount === 1 ? 'bg-yellow-950/40 border-yellow-800'
          : 'bg-red-950/40 border-red-800'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${
              appearedCount === 2 ? 'text-green-400' : appearedCount === 1 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {appearedCount}/{totalCount}
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                {appearedCount === 2 ? 'Your product appeared in both AI engines'
                : appearedCount === 1 ? 'Your product appeared in 1 out of 2 AI engines'
                : 'Your product did not appear in either AI engine'}
              </p>
              <p className="text-gray-400 text-sm mt-0.5">
                {appearedCount === 0 ? "Consider improving your AEO coverage — you're not being recommended yet."
                : appearedCount === 1 ? "Partial coverage. One engine is recommending you, one isn't."
                : 'Strong AEO coverage. Both engines are aware of and recommending your product.'}
              </p>
            </div>
          </div>
        </div>

        {/* Save prompt */}
        {isLoggedIn === false && <SavePrompt />}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModelCard title="ChatGPT" subtitle="GPT-4o" result={results.chatgpt} />
          <ModelCard title="Gemini" subtitle="2.5 Flash" result={results.gemini} />
        </div>

        {/* Fix suggestions */}
        <SuggestionsSection
          productUrl={results.url}
          query={results.query}
          competitors={[
            ...results.chatgpt.competitors,
            ...results.gemini.competitors,
          ].filter((v, i, a) => a.indexOf(v) === i)}
          chatgptScore={results.chatgpt.score ?? 0}
          geminiScore={results.gemini.score ?? 0}
          chatgptResponses={results.chatgpt.responses ?? []}
          geminiResponses={results.gemini.responses ?? []}
          isPaidUser={isPaid}
        />

      </div>
    </main>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const colour =
    score === 3 ? 'bg-green-600/20 text-green-400 border-green-700/50'
    : score === 0 ? 'bg-red-600/20 text-red-400 border-red-700/50'
    : 'bg-amber-600/20 text-amber-400 border-amber-700/50';

  return (
    <div className="relative group inline-block">
      <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border cursor-default ${colour}`}>
        {score}/3 runs
      </span>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-xs text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
        We run each query 3 times because AI results vary. This gives you a reliable signal rather than a one-off snapshot.
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
      </div>
    </div>
  );
}

function ModelCard({ title, subtitle, result }: { title: string; subtitle: string; result: ModelResult }) {
  const [expanded, setExpanded] = useState(false);
  const truncated = result.response.slice(0, 300);
  const needsTruncation = result.response.length > 300;

  if (result.error) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-900/50 border border-yellow-700 flex items-center justify-center">
            <span className="text-yellow-400 text-lg">⚠</span>
          </div>
        </div>
        <div className="bg-yellow-950/40 border border-yellow-800/60 rounded-lg px-4 py-3">
          <p className="text-yellow-300 text-sm font-medium mb-0.5">API error</p>
          <p className="text-yellow-400/70 text-sm">{result.error}</p>
        </div>
      </div>
    );
  }

  const borderColor =
    result.score === 3 ? 'bg-green-950/20 border-green-800/60'
    : result.score === 0 ? 'bg-red-950/20 border-red-800/60'
    : 'bg-amber-950/20 border-amber-800/60';

  const iconBg = result.score === 3 ? 'bg-green-600' : result.score === 0 ? 'bg-red-600' : 'bg-amber-600';

  return (
    <div className={`rounded-xl p-6 border ${borderColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
          {result.score === 3 ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : result.score === 0 ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <span className="text-white font-bold text-sm">{result.score}/3</span>
          )}
        </div>
      </div>

      {/* Score badge with tooltip */}
      <div className="mb-5">
        <ScoreBadge score={result.score} />
      </div>

      {/* AI Response */}
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">AI response (run 1)</p>
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            {expanded || !needsTruncation ? result.response : `${truncated}…`}
          </p>
          {needsTruncation && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-indigo-400 hover:text-indigo-300 text-xs font-medium"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>

      {/* Competitors */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
          Also mentioned ({result.competitors.length})
        </p>
        {result.competitors.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {result.competitors.map((name, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300">
                {name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No other products mentioned</p>
        )}
      </div>
    </div>
  );
}

function SavePrompt() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl px-6 py-5 mb-8 flex items-center gap-4">
        <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-gray-300 text-sm">Magic link sent — check your email to save your results and track changes over time.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-6 py-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-white font-medium text-sm">Save your results and track changes over time</p>
          <p className="text-gray-500 text-xs mt-0.5">Enter your email — we'll send a magic link, no password needed.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 sm:shrink-0">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-52"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            {loading ? 'Sending...' : 'Save results'}
          </button>
        </form>
      </div>
    </div>
  );
}
