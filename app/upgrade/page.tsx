'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FEATURES = [
  { text: 'Unlimited AEO checks across any query or product' },
  { text: 'AI fix suggestions personalised to your site content' },
  { text: 'Unlimited tracked queries per product URL' },
  { text: 'Weekly monitoring reports emailed to you' },
  { text: '3× runs per check for reliable, non-random results' },
];

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
    setLoading(true);
    setError('');

    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const data = await res.json();

    if (!res.ok || data.error) {
      if (res.status === 401) {
        router.push('/login?next=/upgrade');
        return;
      }
      setError(data.error || 'Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Back link */}
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">
          ← Back
        </Link>

        {/* Header */}
        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Unlock your full AEO report
          </h1>
          <p className="text-gray-400">
            See exactly why your product isn't being recommended — and how to fix it.
          </p>
        </div>

        {/* Pricing card */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-7">
          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$39</span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="text-indigo-400 text-sm font-medium mt-1">
              3-day free trial — cancel anytime
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-7">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300 text-sm">{f.text}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
          >
            {loading ? 'Redirecting to checkout...' : 'Start free trial'}
          </button>

          <p className="text-gray-600 text-xs text-center mt-4">
            No charge for 7 days. Cancel before the trial ends and you won't be billed.
          </p>
        </div>

      </div>
    </main>
  );
}
