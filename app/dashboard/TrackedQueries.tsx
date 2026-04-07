'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

const FREE_LIMIT = 3;

interface TrackedQuery {
  id: string;
  product_url: string;
  query: string;
  created_at: string;
}

export function TrackedQueries({ initialQueries, userId, isPaidUser }: {
  initialQueries: TrackedQuery[];
  userId: string;
  isPaidUser: boolean;
}) {
  const [queries, setQueries] = useState(initialQueries);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const atFreeLimit = !isPaidUser && queries.length >= FREE_LIMIT;

  // Group by product_url
  const grouped = queries.reduce<Record<string, TrackedQuery[]>>((acc, q) => {
    if (!acc[q.product_url]) acc[q.product_url] = [];
    acc[q.product_url].push(q);
    return acc;
  }, {});

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (atFreeLimit) return;
    const urlCount = queries.filter(q => q.product_url === url).length;
    if (isPaidUser && urlCount >= 5) {
      setError('Max 5 queries per URL. Remove one to add another.');
      return;
    }

    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data, error: dbError } = await supabase
      .from('tracked_queries')
      .insert({ user_id: userId, product_url: url, query })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message.includes('unique') ? 'That query is already tracked.' : dbError.message);
    } else if (data) {
      setQueries([data, ...queries]);
      setUrl('');
      setQuery('');
      setShowForm(false);
    }
    setLoading(false);
  }

  async function handleRemove(id: string) {
    const supabase = createClient();
    await supabase.from('tracked_queries').delete().eq('id', id);
    setQueries(queries.filter(q => q.id !== id));
  }

  const totalSlots = 5 * Object.keys(grouped).length || 5;
  const usedSlots = queries.length;

  return (
    <div>
      {queries.length === 0 && !showForm ? (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl px-6 py-8 text-center">
          <p className="text-gray-500 text-sm mb-3">
            Track up to 5 queries per product URL to monitor your AI visibility over time.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >
            + Add your first tracked query
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          {/* Grouped queries */}
          {Object.entries(grouped).map(([productUrl, urlQueries]) => (
            <div key={productUrl} className="border-b border-gray-800 last:border-b-0">
              <div className="px-5 py-3 bg-gray-800/40">
                <p className="text-xs text-gray-400 font-medium truncate">{productUrl}</p>
                <p className="text-xs text-gray-600 mt-0.5">{urlQueries.length}/5 queries tracked</p>
              </div>
              <div className="divide-y divide-gray-800">
                {urlQueries.map(q => (
                  <div key={q.id} className="flex items-center justify-between px-5 py-3">
                    <p className="text-gray-300 text-sm">{q.query}</p>
                    <button
                      onClick={() => handleRemove(q.id)}
                      className="text-gray-600 hover:text-red-400 text-xs ml-4 shrink-0 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add button at bottom */}
          <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
            {atFreeLimit ? (
              <div className="flex items-center justify-between w-full">
                <p className="text-gray-500 text-xs">{FREE_LIMIT}/{FREE_LIMIT} free slots used</p>
                <Link
                  href="/upgrade"
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                  Upgrade for unlimited →
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setShowForm(!showForm)}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                {showForm ? 'Cancel' : '+ Add tracked query'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mt-3 bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Product URL</label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://yourproduct.com"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Query to track</label>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="best Reddit marketing tool"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Save query'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); }}
              className="text-gray-500 hover:text-gray-300 text-sm px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
