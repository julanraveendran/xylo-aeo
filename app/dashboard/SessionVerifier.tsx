'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SessionVerifier({ sessionId }: { sessionId: string }) {
  const router = useRouter();

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (data.success) {
          // Remove session_id from URL then hard reload so isPaidUser re-evaluates
          router.replace('/dashboard');
          setTimeout(() => window.location.reload(), 100);
        }
      } catch (err) {
        console.error('[SessionVerifier]', err);
        router.replace('/dashboard');
      }
    }

    verify();
  }, [sessionId]);

  // Renders nothing — runs silently in the background
  return null;
}
