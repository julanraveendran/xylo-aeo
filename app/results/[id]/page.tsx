import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';

export default async function CheckDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: check } = await supabase
    .from('checks')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!check) notFound();

  const appearedCount = [check.chatgpt_score, check.gemini_score].filter(s => (s ?? 0) > 0).length;
  const date = new Date(check.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-gray-950 py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm">
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4 mb-1">Visibility report</h1>
          <p className="text-gray-400 text-sm">
            Query: <span className="text-gray-200 font-medium">"{check.query}"</span>
            <span className="mx-2 text-gray-600">·</span>
            <span className="text-gray-200 font-medium">{check.product_url}</span>
            <span className="mx-2 text-gray-600">·</span>
            <span className="text-gray-500">{date}</span>
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
              {appearedCount}/2
            </div>
            <p className="text-white font-semibold text-lg">
              {appearedCount === 2 ? 'Your product appeared in both AI engines'
              : appearedCount === 1 ? 'Your product appeared in 1 out of 2 AI engines'
              : 'Your product did not appear in either AI engine'}
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResultCard
            title="ChatGPT"
            subtitle="GPT-4o"
            score={check.chatgpt_score}
            response={check.chatgpt_response}
            competitors={check.chatgpt_competitors ?? []}
          />
          <ResultCard
            title="Gemini"
            subtitle="2.5 Flash"
            score={check.gemini_score}
            response={check.gemini_response}
            competitors={check.gemini_competitors ?? []}
          />
        </div>

      </div>
    </main>
  );
}

function ResultCard({ title, subtitle, score, response, competitors }: {
  title: string;
  subtitle: string;
  score: number | null;
  response: string | null;
  competitors: string[];
}) {
  const s = score ?? 0;
  const borderColor =
    s === 3 ? 'bg-green-950/20 border-green-800/60'
    : s === 0 ? 'bg-red-950/20 border-red-800/60'
    : 'bg-amber-950/20 border-amber-800/60';

  const iconBg = s === 3 ? 'bg-green-600' : s === 0 ? 'bg-red-600' : 'bg-amber-600';

  const badgeColor =
    s === 3 ? 'bg-green-600/20 text-green-400 border-green-700/50'
    : s === 0 ? 'bg-red-600/20 text-red-400 border-red-700/50'
    : 'bg-amber-600/20 text-amber-400 border-amber-700/50';

  return (
    <div className={`rounded-xl p-6 border ${borderColor}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
          {s === 3 ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : s === 0 ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <span className="text-white font-bold text-sm">{s}/3</span>
          )}
        </div>
      </div>

      <div title="We run each query 3 times because AI results vary. This gives you a reliable signal rather than a one-off snapshot."
        className={`inline-flex items-center text-sm font-semibold px-3 py-1.5 rounded-full mb-5 border cursor-default ${badgeColor}`}>
        {s}/3 runs
      </div>

      <div className="mb-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">AI response</p>
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-4 max-h-52 overflow-y-auto">
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {response ?? 'No response recorded.'}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
          Also mentioned ({competitors.length})
        </p>
        {competitors.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {competitors.map((name, i) => (
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
