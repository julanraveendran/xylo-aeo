'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
    >
      Sign out
    </button>
  );
}
