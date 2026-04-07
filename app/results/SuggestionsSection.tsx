'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Suggestion } from '@/app/api/suggestions/route';

interface Props {
  productUrl: string;
  query: string;
  competitors: string[];
  chatgptScore: number;
  geminiScore: number;
  chatgptResponses: string[];
  geminiResponses: string[];
  isPaidUser: boolean;
}

const EFFORT_LABEL: Record<string, string> = { low: 'Low effort', medium: 'Medium effort', high: 'High effort' };
const IMPACT_LABEL: Record<string, string> = { low: 'Low impact', medium: 'Medium impact', high: 'High impact' };

const EFFORT_COLOR: Record<string, string> = {
  low: 'bg-green-900/40 text-green-400 border-green-800',
  medium: 'bg-amber-900/40 text-amber-400 border-amber-800',
  high: 'bg-red-900/40 text-red-400 border-red-800',
};

const IMPACT_COLOR: Record<string, string> = {
  low: 'bg-gray-800 text-gray-400 border-gray-700',
  medium: 'bg-amber-900/40 text-amber-400 border-amber-800',
  high: 'bg-green-900/40 text-green-400 border-green-800',
};

export function SuggestionsSection({
  productUrl,
  query,
  competitors,
  chatgptScore,
  geminiScore,
  chatgptResponses,
  geminiResponses,
  isPaidUser,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only fetch if at least one engine scored 0 or 1 out of 3
  const shouldFetch = chatgptScore <= 1 || geminiScore <= 1;

  useEffect(() => {
    if (!shouldFetch) return;

    setLoading(true);
    fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productUrl, query, competitors, chatgptResponses, geminiResponses }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setSuggestions(data.suggestions);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (!shouldFetch) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">AEO fix suggestions</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Specific actions to improve your visibility in AI-generated answers.
          </p>
        </div>
      </div>

      {/* Gate wrapper */}
      <div className="relative">
        {/* Blur/lock overlay for free users */}
        {!isPaidUser && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl">
            <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm rounded-xl" />
            <div className="relative z-10 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <p className="text-white font-semibold mb-1">Upgrade to see fix suggestions</p>
              <p className="text-gray-400 text-sm mb-4">Get actionable recommendations to improve your AI search visibility.</p>
              <Link
                href="/upgrade"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors inline-block"
              >
                Upgrade plan
              </Link>
            </div>
          </div>
        )}

        {/* Content */}
        {loading && (
          <div className={`space-y-3 ${!isPaidUser ? 'pointer-events-none' : ''}`}>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-800 rounded w-full mb-2" />
                <div className="h-3 bg-gray-800 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-950/30 border border-red-800/60 rounded-xl px-5 py-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && suggestions.length > 0 && (
          <div className={`space-y-3 ${!isPaidUser ? 'pointer-events-none select-none' : ''}`}>
            {suggestions.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SuggestionCard({ suggestion, index }: { suggestion: Suggestion; index: number }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start gap-4">
        {/* Number */}
        <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-indigo-400 text-xs font-semibold">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium mb-1">{suggestion.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{suggestion.description}</p>
          {suggestion.reason && (
            <p className="text-gray-600 text-xs italic mt-2 leading-relaxed">{suggestion.reason}</p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${EFFORT_COLOR[suggestion.effort]}`}>
              {EFFORT_LABEL[suggestion.effort]}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${IMPACT_COLOR[suggestion.impact]}`}>
              {IMPACT_LABEL[suggestion.impact]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
