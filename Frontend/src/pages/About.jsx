import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ── FAQ ──────────────────────────────────────────────────────────────────────
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 border-2 border-gray-200 hover:border-[#6498fe] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl bg-white">
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

// ── STAT CARD ─────────────────────────────────────────────────────────────────
const StatCard = ({ number, label, emoji }) => (
  <div className="text-center group p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#6498fe] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600 group-hover:scale-110 transition-transform duration-500 mb-2">{number}</div>
    <div className="text-sm text-gray-600 font-bold flex items-center justify-center gap-1"><span>{label}</span><span>{emoji}</span></div>
  </div>
);

// ── VALUE CARD ────────────────────────────────────────────────────────────────
const ValueCard = ({ icon, title, desc }) => (
  <div className="relative p-8 bg-gradient-to-br from-white via-blue-50 to-purple-50 border-2 border-gray-100 hover:border-[#6498fe] rounded-2xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6498fe] to-purple-600 opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-all duration-500 -mr-16 -mt-16"></div>
    <div className="text-3xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 inline-block">{icon}</div>
    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#6498fe] transition-colors">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#6498fe] to-purple-600 group-hover:w-full transition-all duration-500"></div>
  </div>
);

// ── TEAM CARD (light theme, real photo) ──────────────────────────────────────────
const TeamCard = ({ image, name, role, tagline, skills, linkedinUrl, linkedinHandle, accentClass }) => {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="bg-white border-2 border-gray-100 hover:border-[#6498fe] rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
      {/* Photo */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50" style={{ paddingBottom: '75%' }}>
        {!imgErr ? (
          <img
            src={image}
            alt={name}
            onError={() => setImgErr(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 10%' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6498fe] to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">{name.charAt(0)}</div>
          </div>
        )}
        <div className="absolute bottom-3 left-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${accentClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70"></span>
            {role}
          </span>
        </div>
      </div>
      {/* Info */}
      <div className="p-6">
        <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-[#6498fe] transition-colors">{name}</h3>
        <p className="text-sm text-gray-500 italic mb-4">&ldquo;{tagline}&rdquo;</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {skills.map((s) => (
            <span key={s} className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#6498fe] border border-blue-100">{s}</span>
          ))}
        </div>
        <div className="h-px bg-gradient-to-r from-blue-100 to-purple-100 mb-5"></div>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#6498fe] to-blue-600 text-white font-bold text-sm py-3 px-5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          Connect &mdash; @{linkedinHandle}
        </a>
      </div>
    </div>
  );
};

// ── ABOUT PAGE ────────────────────────────────────────────────────────────────
export default function About() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.2 });
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
    {
      image: '/f1.png',
      name: 'Akshat Raj',
      role: 'Co-Founder & CEO',
      tagline: 'Sales-first. Client-obsessed. The one who closes.',
      skills: ['Business Strategy', 'Client Relations', 'Sales', 'Product Vision', 'Operations'],
      linkedinUrl: 'https://www.linkedin.com/in/akssshat/',
      linkedinHandle: 'akssshat',
      accentClass: 'bg-emerald-500 text-white',
    },
    {
      image: '/f2.png',
      name: 'Shreyansh Kumawat',
      role: 'Co-Founder, CTO & CMnO',
      tagline: 'Full-stack builder. The one who makes it real.',
      skills: ['React', 'Node.js', 'Three.js', 'System Design', 'Growth Marketing'],
      linkedinUrl: 'https://www.linkedin.com/in/shreyansh-kumawat-405125309/',
      linkedinHandle: 'shreyansh-kumawat',
      accentClass: 'bg-cyan-500 text-white',
    },
  ];

  const vision = [
    { icon: '⚡', text: '3-Day Delivery' },
    { icon: '🔒', text: 'White Label Always' },
    { icon: '🚀', text: 'You Close, We Build' },
    { icon: '🎯', text: 'Your Brand Only' },
    { icon: '🤝', text: 'Long-Term Partner' },
    { icon: '💰', text: 'Better Margins' },
    { icon: '🛡️', text: 'NDA Protected' },
    { icon: '🌐', text: 'Remote Delivery' },
  ];

  const faqs = [
    { question: 'Is 3Digree visible to my clients?', answer: 'Never. We work completely in the background. Your clients only ever see your brand.' },
    { question: 'Who are your ideal partners?', answer: 'Freelancers managing 3–20+ client websites per year, and agencies that want to scale delivery without hiring.' },
    { question: 'What does the website delivery look like?', answer: 'You pick a design from our 100+ templates, share a Design ID via your dashboard, and we deliver a customized website in 3 business days.' },
    { question: 'How did 3Digree start?', answer: 'We started because we were freelancers ourselves — stuck between winning clients and delivering on time. So we built the infrastructure we always needed.' },
    { question: "What if I don't use all websites in my plan?", answer: 'No problem — your credits stay safe in your account. Contact support and we\'ll recover or transfer them.' },
    { question: 'Can I white-label everything?', answer: 'Absolutely! Your clients will only see your brand. We stay completely invisible as your delivery infrastructure.' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="h-1.5 bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600"></div>

      {/* ── HERO ── */}
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
            {' '}<span className="text-gray-900">Dev Team</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto font-medium">
            3Digree is a white-label website delivery service built for freelancers and agencies. We build. You deliver. Your clients never know we exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg group">
              View Pricing <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
            </Link>
            <Link to="/labs/about" className="inline-flex items-center gap-2 border-2 border-[#6498fe] text-[#6498fe] font-bold px-10 py-4 rounded-2xl hover:bg-[#6498fe] hover:text-white transition-all duration-300 text-lg group">
              &#10024; 3D Experience <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} className="py-16 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '100+', label: 'Templates', emoji: '🎨' },
              { number: '3', label: 'Day Delivery', emoji: '⚡' },
              { number: '100%', label: 'White-label', emoji: '🔒' },
              { number: '2025', label: 'Founded', emoji: '🚀' },
            ].map((s, i) => (
              <div key={i} style={{ opacity: statsVisible ? 1 : 0, transform: statsVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.8)', transition: `all 0.6s ease ${i * 0.15}s` }}>
                <StatCard {...s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-3 bg-white border-2 border-[#6498fe] rounded-full px-6 py-3 shadow-lg mb-6">
                <span className="text-lg">📖</span>
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

      {/* ── VISION STRIP (marquee) ── */}
      <section className="py-5 bg-white overflow-hidden border-y border-gray-100">
        <style>{`@keyframes marqueeAbout { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        <div style={{ maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)' }}>
          <div style={{ display: 'flex', gap: '2rem', width: 'max-content', animation: 'marqueeAbout 30s linear infinite' }}>
            {[...vision, ...vision].map((v, i) => (
              <React.Fragment key={i}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ca3af', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <span>{v.icon}</span>{v.text}
                </span>
                <span style={{ color: '#bfdbfe', fontSize: '0.75rem' }}>◆</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#6498fe] to-purple-600 rounded-full px-8 py-4 shadow-xl mb-6">
              <span className="text-2xl">💡</span>
              <span className="text-sm font-bold text-white">What We Stand For</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">The principles that guide every website we build and every partner we serve.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v) => <ValueCard key={v.title} {...v} />)}
          </div>
        </div>
      </section>

      {/* ── MEET THE FOUNDERS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 border-2 border-[#6498fe] rounded-full px-6 py-3 shadow-lg mb-6">
              <span className="w-2 h-2 rounded-full bg-[#6498fe]"></span>
              <span className="text-sm font-bold text-[#6498fe] tracking-widest uppercase">The Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Meet the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600">Founders</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Two freelancers who solved their own delivery problem — and now help you solve yours.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {team.map((m) => <TeamCard key={m.name} {...m} />)}
          </div>
          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-gray-100 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">We've been in your shoes.</p>
            <p className="text-gray-600">Now we're building the infrastructure <span className="text-[#6498fe] font-bold">we wish we had</span> — so you can grow without limits.</p>
          </div>
        </div>
      </section>

      {/* ── WHY 3DIGREE EXISTS ── */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-white border-2 border-[#6498fe] rounded-full px-8 py-4 shadow-lg mb-6">
              <span className="text-2xl">🔍</span>
              <span className="text-sm font-bold text-[#6498fe]">The Problem We Solve</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Why 3Digree Exists</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              Freelancers and agencies hit the same wall. Great at selling — but delivery becomes the bottleneck.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: '😓', problem: 'You win the client', solution: 'But scramble to deliver on time', color: 'from-red-50 to-orange-50', border: 'border-red-100' },
              { emoji: '💸', problem: 'You hire freelancers', solution: 'But quality is unpredictable and costs spike', color: 'from-orange-50 to-yellow-50', border: 'border-orange-100' },
              { emoji: '📉', problem: 'You turn down work', solution: 'Because you\'re already at capacity', color: 'from-yellow-50 to-red-50', border: 'border-yellow-100' },
            ].map((item, i) => (
              <div key={i} className={`p-8 rounded-2xl bg-gradient-to-br ${item.color} border-2 ${item.border} group hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{item.emoji}</div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{item.problem}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.solution}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <div className="inline-block p-8 bg-white rounded-3xl border-2 border-[#6498fe] shadow-xl max-w-2xl">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">3Digree is the fix.</h3>
              <p className="text-gray-600 leading-relaxed">Plug us in as your invisible backend team. We build under your brand in 3 days, so you can close more and deliver more — without hiring a single person.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#6498fe] to-purple-600 rounded-full px-8 py-4 shadow-xl mb-6">
              <span className="text-2xl">🗺️</span>
              <span className="text-sm font-bold text-white">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">Four steps. That's it.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              { step: '1', title: 'Choose a plan & book a call', desc: 'Pick the plan that fits your pipeline, then jump on a quick call to align expectations.' },
              { step: '2', title: 'Get your partner dashboard', desc: 'After onboarding, access a simple dashboard showing your plan, remaining credits, and Design IDs.' },
              { step: '3', title: 'Pick a template with your client', desc: 'Use our 100+ Website Designs, choose one with your client, and submit the Design ID. No heavy forms.' },
              { step: '4', title: 'Website delivered in 3 business days', desc: 'Once content is clear, we deliver in 3 business days. You present it under your own brand.' },
            ].map((s, i) => (
              <div key={i} className="relative p-7 bg-white border-2 border-gray-100 hover:border-[#6498fe] rounded-2xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group">
                <div className="absolute -top-5 left-6 bg-gradient-to-br from-[#6498fe] via-blue-600 to-purple-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">{s.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 mt-4 group-hover:text-[#6498fe] transition-colors">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#6498fe] to-purple-600 group-hover:w-full transition-all duration-500 rounded-b-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-3 bg-white border-2 border-[#6498fe] rounded-full px-8 py-4 shadow-lg mb-6">
              <span className="text-2xl">❓</span>
              <span className="text-sm font-bold text-[#6498fe]">Got Questions?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">About Us &mdash; FAQ</h2>
          </div>
          {faqs.map((f) => <FAQItem key={f.question} {...f} />)}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6498fe] to-purple-600 rounded-3xl blur-3xl opacity-10"></div>
            <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-12 border-2 border-gray-100">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Ready to Scale Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6498fe] to-purple-600">Delivery?</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 font-medium">Join freelancers and agencies who deliver more — invisibly backed by 3Digree.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pricing" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6498fe] via-blue-600 to-purple-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg group">
                  Get Started <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 font-bold px-10 py-4 rounded-2xl hover:border-[#6498fe] hover:text-[#6498fe] transition-all duration-300 text-lg group">
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
