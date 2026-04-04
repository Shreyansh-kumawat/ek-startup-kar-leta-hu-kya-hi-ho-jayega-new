import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ── FAQ Accordion ──────────────────────────────────────────────────────────
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 border-2 border-gray-200 hover:border-[#6498fe] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
      >
        <span className="text-base font-bold text-gray-900 pr-6 group-hover:text-[#6498fe] transition-colors duration-300">{question}</span>
        <div className={`flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#6498fe] to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg transition-all duration-500 ${open ? 'rotate-45 scale-110' : 'group-hover:scale-110'}`}>+</div>
      </button>
      <div className={`transition-all duration-500 ease-in-out ${open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-6 pb-6 pt-2">
          <div className="pl-4 border-l-4 border-[#6498fe] bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-r-xl">
            <p className="text-gray-700 leading-relaxed font-medium">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ number, label, emoji }) => (
  <div className="text-center group p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#6498fe] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600 group-hover:scale-110 transition-transform duration-500 mb-2">{number}</div>
    <div className="text-sm text-gray-600 font-bold flex items-center justify-center gap-1">
      <span>{label}</span><span>{emoji}</span>
    </div>
  </div>
);

// ── Value Card ─────────────────────────────────────────────────────────────
const ValueCard = ({ icon, title, desc }) => (
  <div className="relative p-8 bg-gradient-to-br from-white via-blue-50 to-purple-50 border-2 border-gray-100 hover:border-[#6498fe] rounded-2xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6498fe] to-purple-600 opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-all duration-500 -mr-16 -mt-16"></div>
    <div className="text-3xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 inline-block">{icon}</div>
    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#6498fe] transition-colors">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#6498fe] to-purple-600 group-hover:w-full transition-all duration-500"></div>
  </div>
);

// ── Team Member Card ───────────────────────────────────────────────────────
const TeamCard = ({ name, role, emoji, desc }) => (
  <div className="p-8 bg-white border-2 border-gray-100 hover:border-[#6498fe] rounded-2xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group text-center">
    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#6498fe] to-purple-600 rounded-full flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">{emoji}</div>
    <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-[#6498fe] transition-colors">{name}</h3>
    <p className="text-sm font-semibold text-[#6498fe] mb-3">{role}</p>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

// ── ABOUT PAGE ─────────────────────────────────────────────────────────────
export default function About() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => { if (statsRef.current) observer.unobserve(statsRef.current); };
  }, []);

  const values = [
    { icon: '👁️', title: 'Stay Invisible', desc: 'We never compete with our partners. You own the client relationship, the brand, and the credit.' },
    { icon: '⚡', title: 'Move Fast', desc: 'Every website delivered in 3 business days. Because slow delivery kills deals.' },
    { icon: '🔒', title: 'Predictable Cost', desc: 'No surprise invoices. Pick a plan, know your cost, scale without stress.' },
    { icon: '🏗️', title: 'Infrastructure Mindset', desc: 'We think of ourselves as dev infrastructure, not an agency. You plug us in, we do the work.' },
    { icon: '🤝', title: 'Partner-First', desc: 'Freelancers and agencies are our only customers. Their success is literally our success.' },
    { icon: '🌱', title: 'Built to Grow', desc: 'From solo freelancers to scaling agencies — our plans flex with your pipeline.' },
  ];

  const team = [
    { name: 'Shreyansh Kumawat', role: 'Founder & Dev Lead', emoji: '👨‍💻', desc: 'Full-stack engineer obsessed with clean code and faster delivery systems.' },
    { name: '3Digree Team', role: 'Design & Build', emoji: '🎨', desc: 'A compact, focused team that builds and ships real websites, every week.' },
  ];

  const faqs = [
    { question: 'Is 3Digree visible to my clients?', answer: 'Never. We work completely in the background. Your clients only ever see your brand.' },
    { question: 'Who are your ideal partners?', answer: 'Freelancers managing 3–20+ client websites per year, and agencies that want to scale delivery without hiring.' },
    { question: 'What does the website delivery look like?', answer: 'You pick a design from our 100+ templates, share a Design ID via your dashboard, and we deliver a customized website in 3 business days.' },
    { question: 'How did 3Digree start?', answer: 'We started because we were freelancers ourselves — stuck between winning clients and delivering on time. So we built the infrastructure we always needed.' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="h-1.5 bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600"></div>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative bg-white pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#6498fe] to-[#96b1e8] rounded-full px-8 py-3 shadow-xl">
              <span className="text-white font-bold text-xl tracking-wide">3Digree</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="text-gray-900">We Are Your</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600">Invisible</span>
            <span className="text-gray-900"> Dev Team</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto font-medium">
            3Digree is a white-label website delivery service built for freelancers and agencies. We build. You deliver. Your clients never know we exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg group"
            >
              View Pricing <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
            </Link>
            <Link
              to="/labs/about"
              className="inline-flex items-center gap-2 border-2 border-[#6498fe] text-[#6498fe] font-bold px-10 py-4 rounded-2xl hover:bg-[#6498fe] hover:text-white transition-all duration-300 text-lg group"
            >
              <span>&#x2728; 3D Experience</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-16 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '100+', label: 'Templates', emoji: '🎨' },
              { number: '3', label: 'Day Delivery', emoji: '⚡' },
              { number: '100%', label: 'White-label', emoji: '🔒' },
              { number: '2025', label: 'Founded', emoji: '🚀' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  opacity: statsVisible ? 1 : 0,
                  transform: statsVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.8)',
                  transition: `all 0.6s ease ${i * 0.15}s`,
                }}
              >
                <StatCard {...s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STORY ────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-3 bg-white border-2 border-[#6498fe] rounded-full px-6 py-3 shadow-lg mb-6">
                <span className="text-lg">&#x1F4D6;</span>
                <span className="text-sm font-bold text-[#6498fe]">Our Story</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                Built Because We<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600">Needed It Ourselves</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                We were freelancers. We were winning clients and then scrambling to deliver — staying up late, cutting corners, or worse, turning down work.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                The problem wasn't talent. It was capacity. So we built <span className="font-bold text-gray-900">3Digree</span> — a delivery infrastructure that lets any freelancer or agency scale their output without scaling their team.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Today we power websites for clients across India and beyond — all invisibly, under our partners' brands.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6498fe] to-purple-600 rounded-3xl blur-3xl opacity-10"></div>
              <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-10 border-2 border-gray-100">
                <div className="space-y-6">
                  {[
                    { icon: '🎯', text: 'Partner-only model — we never sell direct to end clients' },
                    { icon: '🏭', text: 'Delivery infrastructure, not a typical design agency' },
                    { icon: '📦', text: '100+ ready-to-customize website templates' },
                    { icon: '⚙️', text: 'Simple dashboard for submitting and tracking orders' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                      <p className="text-gray-700 font-medium leading-relaxed pt-1.5">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#6498fe] to-purple-600 rounded-full px-8 py-4 shadow-xl mb-6">
              <span className="text-2xl">&#x1F4A1;</span>
              <span className="text-sm font-bold text-white">What We Stand For</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              The principles that guide every website we build and every partner we serve.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v) => <ValueCard key={v.title} {...v} />)}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-white border-2 border-[#6498fe] rounded-full px-8 py-4 shadow-lg mb-6">
              <span className="text-2xl">&#x1F91D;</span>
              <span className="text-sm font-bold text-[#6498fe]">The People</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Meet The Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Small, focused, and obsessed with delivery.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 max-w-2xl mx-auto gap-8">
            {team.map((m) => <TeamCard key={m.name} {...m} />)}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-white border-2 border-[#6498fe] rounded-full px-8 py-4 shadow-lg mb-6">
              <span className="text-2xl">&#x2753;</span>
              <span className="text-sm font-bold text-[#6498fe]">Got Questions?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">About Us — FAQ</h2>
          </div>
          {faqs.map((f) => <FAQItem key={f.question} {...f} />)}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6498fe] to-purple-600 rounded-3xl blur-3xl opacity-10"></div>
            <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-12 border-2 border-gray-100">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Ready to Scale Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600">Delivery?</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 font-medium">
                Join freelancers and agencies who deliver more — invisibly backed by 3Digree.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg group"
                >
                  Get Started <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 font-bold px-10 py-4 rounded-2xl hover:border-[#6498fe] hover:text-[#6498fe] transition-all duration-300 text-lg group"
                >
                  Contact Us <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
