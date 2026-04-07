'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TEAL = '#00d4aa';
const BG = '#080e1d';
const CARD_BG = '#0d1726';
const BORDER = '#1a2742';

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav
      style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: `${BG}ee` }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-white font-bold text-lg tracking-tight">Xylo AEO</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/upgrade"
            style={{ backgroundColor: TEAL }}
            className="text-[#080e1d] text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, query }),
      });
      if (!res.ok) throw new Error('Check failed');
      const data = await res.json();
      sessionStorage.setItem('xylo_results', JSON.stringify({ url, query, ...data }));
      router.push('/results');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20"
      style={{ backgroundColor: BG }}
    >
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${BORDER} 1px, transparent 1px), linear-gradient(90deg, ${BORDER} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.3,
        }}
      />
      {/* Radial fade over grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, ${BG} 70%)`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8"
          style={{ border: `1px solid ${TEAL}33`, color: TEAL, backgroundColor: `${TEAL}11` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: TEAL }}
          />
          AI Search Visibility for SaaS Founders
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white uppercase leading-none tracking-tight mb-6">
          Does your SaaS{' '}
          <br />
          <span style={{ color: TEAL }}>appear in AI search?</span>
          <br />
          Find out now.
        </h1>

        {/* Subheadline */}
        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Most SaaS products are invisible in ChatGPT and Gemini. Xylo AEO shows you where you stand, who's beating you, and exactly what to fix.
        </p>

        {/* Inline form */}
        <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-4">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Your product URL"
            required
            className="flex-1 text-sm text-white placeholder-gray-500 px-4 py-3.5 rounded-lg focus:outline-none"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Target query (e.g. best Reddit marketing tool)"
            required
            className="flex-1 text-sm text-white placeholder-gray-500 px-4 py-3.5 rounded-lg focus:outline-none"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: TEAL }}
            className="text-[#080e1d] font-bold text-sm px-6 py-3.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap shrink-0"
          >
            {loading ? 'Checking...' : 'Check now'}
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <p className="text-gray-600 text-sm">Free to try — no account needed</p>
      </div>
    </section>
  );
}

// ─── Problem ──────────────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    title: 'Your competitors appear. You don\'t.',
    body: 'The same 5–6 tools dominate every AI recommendation. Yours isn\'t one of them — and your potential customers are being sent elsewhere.',
  },
  {
    title: 'Google rankings don\'t transfer.',
    body: 'Only 12% of ChatGPT citations match Google page 1. Your SEO work means nothing here. It\'s a completely different game.',
  },
  {
    title: 'You\'re optimising blind.',
    body: 'You can\'t fix what you can\'t measure. Most founders don\'t even know they have this problem until a competitor is already entrenched.',
  },
  {
    title: 'The gap is widening.',
    body: 'AI search is growing fast. Every week you\'re not cited is a week competitors build that advantage. The window is closing.',
  },
];

function Problem() {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: BG }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: TEAL }}>
            The Problem
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white uppercase tracking-tight">
            Every founder faces<br />this blind spot
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PROBLEMS.map((p, i) => (
            <div
              key={i}
              className="p-6 rounded-xl"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
            >
              <div
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: TEAL }}
              >
                0{i + 1}
              </div>
              <h3 className="text-white font-bold text-lg uppercase tracking-tight mb-2">
                {p.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Enter your URL',
    body: 'Add your product URL and the query your customers would search. Takes 10 seconds.',
  },
  {
    n: '02',
    title: 'We run the checks',
    body: 'We query ChatGPT and Gemini 3 times each for a reliable signal, not a one-off snapshot.',
  },
  {
    n: '03',
    title: 'See your report',
    body: 'Visibility scores, competitor analysis, and personalised fix suggestions based on your actual site.',
  },
];

function HowItWorks() {
  return (
    <section
      className="py-24 px-6"
      style={{ backgroundColor: '#060b18', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: TEAL }}>
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white uppercase tracking-tight">
            Three steps to<br />visibility
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-8 left-full w-full h-px z-0"
                  style={{ backgroundColor: BORDER }}
                />
              )}
              <div
                className="relative z-10 p-7 rounded-xl h-full"
                style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
              >
                <div
                  className="text-3xl font-black mb-5 tracking-tighter"
                  style={{ color: `${TEAL}44` }}
                >
                  {s.n}
                </div>
                <h3 className="text-white font-bold text-xl uppercase tracking-tight mb-3">
                  {s.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── What you get ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '◉',
    title: 'Visibility score',
    body: '0–3 per AI engine, aggregated from 3 independent runs so you get signal, not noise.',
  },
  {
    icon: '⬡',
    title: 'Competitor breakdown',
    body: 'See every product AI engines recommend instead of you, extracted from the actual responses.',
  },
  {
    icon: '⚡',
    title: 'Personalised fix suggestions',
    body: 'GPT-4o analyses your site and generates specific recommendations — not generic SEO advice.',
    pro: false,
  },
  {
    icon: '◷',
    title: 'Check history',
    body: 'Every check saved to your dashboard. Track your score over time as you implement fixes.',
  },
  {
    icon: '◎',
    title: 'Tracked queries',
    body: 'Pin up to 5 queries per URL to monitor regularly. Know the moment your visibility changes.',
  },
  {
    icon: '✉',
    title: 'Weekly monitoring',
    body: 'Automated weekly reports emailed to you. See trends without logging in.',
    pro: true,
  },
];

function WhatYouGet() {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: BG }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: TEAL }}>
            What you get
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white uppercase tracking-tight">
            Everything you need<br />to own AI search
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-xl relative"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
            >
              {f.pro && (
                <span
                  className="absolute top-4 right-4 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${TEAL}22`, color: TEAL }}
                >
                  Pro
                </span>
              )}
              <div className="text-2xl mb-4" style={{ color: TEAL }}>{f.icon}</div>
              <h3 className="text-white font-bold uppercase tracking-tight mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <section
      className="py-24 px-6"
      style={{ backgroundColor: '#060b18', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-14 text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: TEAL }}>
            Pricing
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white uppercase tracking-tight">
            Simple, honest pricing
          </h2>
        </div>

        <div className="max-w-md mx-auto">
          {/* Pro */}
          <div
            className="p-8 rounded-2xl relative"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${TEAL}` }}
          >
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ backgroundColor: TEAL, color: BG }}
            >
              3-day free trial
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: TEAL }}>Pro</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-black text-white">$39</span>
              <span className="text-gray-400">/mo</span>
            </div>
            <p className="text-sm mb-6" style={{ color: TEAL }}>3-day free trial — cancel anytime</p>
            <ul className="space-y-3 mb-8 text-sm text-gray-300">
              {[
                'Unlimited checks',
                'AI fix suggestions personalised to your site',
                'Full check history',
                'Tracked queries (up to 5 per URL)',
                'Weekly email reports',
                '3× runs per check for reliable results',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span style={{ color: TEAL }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/upgrade"
              style={{ backgroundColor: TEAL }}
              className="block w-full text-center text-[#080e1d] font-black text-sm py-3.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'How is this different from regular SEO tools?',
    a: 'SEO tools track Google rankings. Xylo AEO tracks whether AI engines actually cite and recommend your product. These are completely different systems — a page 1 Google ranking does not mean you appear in ChatGPT.',
  },
  {
    q: 'How accurate are the results?',
    a: 'We run each query 3 times per engine and aggregate the scores. This gives you a reliable signal rather than a one-off result. AI responses are non-deterministic, so single-run tools can mislead you.',
  },
  {
    q: 'Which AI engines do you check?',
    a: 'Currently ChatGPT (GPT-4o) and Gemini (2.5 Flash). More engines are coming, including Perplexity and Claude.',
  },
  {
    q: 'What if my product already appears?',
    a: "Great — you'll see your score and which queries you're strongest on. Use Xylo to monitor for drops and to find queries where you're still missing.",
  },
  {
    q: 'Can I check competitors too?',
    a: 'Yes. Enter any product URL and query to see how they perform. Useful for benchmarking and understanding why specific competitors are winning.',
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 px-6" style={{ backgroundColor: BG }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: TEAL }}>
            FAQ
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white uppercase tracking-tight">
            Common questions
          </h2>
        </div>

        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${open === i ? TEAL + '66' : BORDER}`, backgroundColor: CARD_BG }}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-white font-semibold text-sm pr-4">{f.q}</span>
                <span
                  className="text-xl shrink-0 transition-transform"
                  style={{
                    color: TEAL,
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed">{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer CTA ───────────────────────────────────────────────────────────────

function FooterCTA() {
  return (
    <section
      className="py-24 px-6 text-center"
      style={{
        backgroundColor: '#060b18',
        borderTop: `1px solid ${BORDER}`,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: TEAL }}>
          Get started
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-white uppercase tracking-tight mb-4">
          Start knowing<br />where you stand
        </h2>
        <p className="text-gray-400 mb-10">
          Join founders who check their AI visibility every week.
        </p>
        <Link
          href="/upgrade"
          style={{ backgroundColor: TEAL }}
          className="inline-block text-[#080e1d] font-black text-base px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
        >
          Start free trial
        </Link>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="px-6 py-10"
      style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-gray-600 text-sm font-bold tracking-tight">Xylo AEO</span>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            Log in
          </Link>
          <Link href="/upgrade" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            Upgrade
          </Link>
          <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            Privacy Policy
          </Link>
        </div>
        <p className="text-gray-700 text-xs">© 2025 Xylo AEO. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: BG }}>
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <WhatYouGet />
      <Pricing />
      <FAQ />
      <FooterCTA />
      <Footer />
    </div>
  );
}
