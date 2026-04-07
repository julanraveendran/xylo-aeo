import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { isPaidUser } from '@/lib/subscription';
import { TrackedQueries } from './TrackedQueries';
import { SignOutButton } from './SignOutButton';
import { SessionVerifier } from './SessionVerifier';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: checks }, { data: trackedQueries }, paid] = await Promise.all([
    supabase
      .from('checks')
      .select('id, created_at, product_url, query, chatgpt_appeared, gemini_appeared')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tracked_queries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    isPaidUser(user.id),
  ]);

  const total = checks?.length ?? 0;
  const chatgptPct = total > 0
    ? Math.round(((checks?.filter(c => c.chatgpt_appeared).length ?? 0) / total) * 100)
    : 0;
  const geminiPct = total > 0
    ? Math.round(((checks?.filter(c => c.gemini_appeared).length ?? 0) / total) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-gray-950 py-10 px-6">
      {searchParams.session_id && <SessionVerifier sessionId={searchParams.session_id} />}
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <SignOutButton />
            <Link
              href="/"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Run new check
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard label="Total checks" value={total} />
          <StatCard label="ChatGPT visibility" value={`${chatgptPct}%`} />
          <StatCard label="Gemini visibility" value={`${geminiPct}%`} />
        </div>

        {/* Tracked queries */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Tracked queries</h2>
          <TrackedQueries
            initialQueries={trackedQueries ?? []}
            userId={user.id}
            isPaidUser={paid}
          />
        </section>

        {/* Past checks */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Check history</h2>
          {!checks || checks.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-10 text-center">
              <p className="text-gray-500 text-sm">No checks yet.</p>
              <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                Run your first check →
              </Link>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
              {checks.map(check => (
                <CheckRow key={check.id} check={check} />
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function CheckRow({ check }: {
  check: {
    id: string;
    created_at: string;
    product_url: string;
    query: string;
    chatgpt_appeared: boolean | null;
    gemini_appeared: boolean | null;
  };
}) {
  const date = new Date(check.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{check.query}</p>
        <p className="text-gray-500 text-xs mt-0.5 truncate">{check.product_url}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ModelDot label="ChatGPT" appeared={check.chatgpt_appeared} />
        <ModelDot label="Gemini" appeared={check.gemini_appeared} />
      </div>

      <p className="text-gray-600 text-xs shrink-0 w-24 text-right">{date}</p>

      <Link
        href={`/results/${check.id}`}
        className="text-indigo-400 hover:text-indigo-300 text-xs font-medium shrink-0"
      >
        View details
      </Link>
    </div>
  );
}

function ModelDot({ label, appeared }: { label: string; appeared: boolean | null }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${
        appeared === true ? 'bg-green-500' : appeared === false ? 'bg-red-500' : 'bg-gray-600'
      }`} />
      <span className="text-gray-400 text-xs">{label}</span>
    </div>
  );
}
