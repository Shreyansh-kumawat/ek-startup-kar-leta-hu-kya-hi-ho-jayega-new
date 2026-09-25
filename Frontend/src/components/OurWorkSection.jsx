import React, { useState } from 'react';
import { FaBriefcase, FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa';

const projects = [
  {
    name: 'Royal Art Club',
    url: 'https://royalart.club/',
    images: [
      'https://picsum.photos/seed/royalart-1/1200/750',
      'https://picsum.photos/seed/royalart-2/1200/750',
      'https://picsum.photos/seed/royalart-3/1200/750',
    ],
    client: {
      name: 'Tapesh R. Panwar',
      photo: 'https://picsum.photos/seed/tapesh/200/200',
      quote:
        'The team delivered exactly what we envisioned — a premium presence that reflects the club\'s heritage. Truly invisible partners.',
    },
    note: null,
  },
  {
    name: 'Pace Up Run',
    url: 'https://www.paceuprun.in/',
    images: [
      'https://picsum.photos/seed/paceup-1/1200/750',
      'https://picsum.photos/seed/paceup-2/1200/750',
      'https://picsum.photos/seed/paceup-3/1200/750',
    ],
    client: {
      name: 'Mohit Khatri',
      photo: 'https://picsum.photos/seed/mohit/200/200',
      quote:
        'Fast turnaround, clean execution. My clients see me as the developer — that\'s exactly what I wanted from a white-label partner.',
    },
    note: null,
  },
  {
    name: 'Shreeji Clothing',
    url: 'https://shreejiiclothing.com/',
    images: [
      'https://picsum.photos/seed/shreeji-1/1200/750',
      'https://picsum.photos/seed/shreeji-2/1200/750',
      'https://picsum.photos/seed/shreeji-3/1200/750',
    ],
    client: {
      name: 'Shelja Sharma',
      photo: 'https://picsum.photos/seed/shelja/200/200',
      quote:
        'They understood our brand instantly. The store looks and feels exactly the way we wanted it to feel to our customers.',
    },
    note: null,
  },
  {
    name: "Rakyan's Jewelers",
    url: 'https://rakyans.co.in/',
    images: [
      'https://picsum.photos/seed/rakyans-1/1200/750',
      'https://picsum.photos/seed/rakyans-2/1200/750',
      'https://picsum.photos/seed/rakyans-3/1200/750',
    ],
    client: {
      name: 'Tapesh R. Panwar',
      photo: 'https://picsum.photos/seed/tapesh/200/200',
      quote:
        'Second project with 3Digree and same story — consistent quality, on time, no drama. That\'s why we keep coming back.',
    },
    note: null,
  },
  {
    name: 'Stable Solar Dekho',
    url: 'https://stablesolardekho.com/',
    images: [
      'https://picsum.photos/seed/stablesolar-1/1200/750',
      'https://picsum.photos/seed/stablesolar-2/1200/750',
      'https://picsum.photos/seed/stablesolar-3/1200/750',
    ],
    client: {
      name: 'Roshan Lal Jhallandra',
      photo: 'https://picsum.photos/seed/roshan/200/200',
      quote:
        'The admin panel is powerful yet simple — my team runs the whole operation from it without ever calling for support.',
    },
    note: 'Admin Panel only',
  },
  {
    name: 'SKCGI',
    url: 'https://skcgi.com/',
    images: [
      'https://picsum.photos/seed/skcgi-1/1200/750',
      'https://picsum.photos/seed/skcgi-2/1200/750',
      'https://picsum.photos/seed/skcgi-3/1200/750',
    ],
    client: {
      name: 'Gabe Hom',
      company: 'kb.solutions',
      photo: 'https://picsum.photos/seed/gabe/200/200',
      quote:
        'Reliable partner for our agency deliveries. They ship polished work under our brand every single time.',
    },
    note: null,
  },
  {
    name: 'Vanto Shoes',
    url: 'https://www.vantoshoes.com/',
    images: [
      'https://picsum.photos/seed/vanto-1/1200/750',
      'https://picsum.photos/seed/vanto-2/1200/750',
      'https://picsum.photos/seed/vanto-3/1200/750',
    ],
    client: {
      name: 'Suhani Lekhram',
      photo: 'https://picsum.photos/seed/suhani/200/200',
      quote:
        'From concept to launch was seamless. The store converts, looks premium, and my customers love it.',
    },
    note: null,
  },
];

const OurWorkSection = () => {
  const [index, setIndex] = useState(0);
  const total = projects.length;

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1));

  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <section className="relative py-24 bg-gray-50 overflow-hidden">
      {/* ── Animated grid background ─────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="ow-grid ow-grid-h" />
        <div className="ow-grid ow-grid-v" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section header ───────────────────────────────── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 bg-white border-2 border-[#6498fe] rounded-full px-6 py-3 shadow-lg mb-6">
            <FaBriefcase className="text-lg text-[#6498fe]" />
            <span className="text-sm font-bold text-[#6498fe]">Our Work</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Websites We've Delivered
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A glimpse at some of the partners and clients we've built for — always invisibly, always under their brand.
          </p>
        </div>

        {/* ── Slider counter ───────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-semibold text-gray-500 tracking-wider">
            <span className="text-2xl font-black text-gray-900">{String(index + 1).padStart(2, '0')}</span>
            <span className="mx-2 text-gray-300">/</span>
            <span>{String(total).padStart(2, '0')}</span>
          </div>
          <div className="hidden sm:flex flex-1 mx-8 items-center gap-1.5">
            {projects.map((_, i) => (
              <div
                key={i}
                className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${
                  i === index ? 'bg-[#6498fe]' : i < index ? 'bg-gray-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={isFirst}
              aria-label="Previous project"
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                isFirst
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white hover:scale-110 shadow-md'
              }`}
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={isLast}
              aria-label="Next project"
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                isLast
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white hover:scale-110 shadow-md'
              }`}
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        </div>

        {/* ── Sliding panel viewport ───────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {projects.map((project) => (
              <div key={project.name} className="w-full flex-shrink-0 px-1">
                <ProjectPanel project={project} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Local animation styles ───────────────────────────── */}
      <style>{`
        .ow-grid {
          position: absolute;
          inset: 0;
          background-repeat: repeat;
          opacity: 0.35;
        }
        .ow-grid-h {
          background-image: linear-gradient(to right, rgba(100, 152, 254, 0.08) 1px, transparent 1px);
          background-size: 80px 100%;
          animation: ow-slide-h 22s linear infinite;
        }
        .ow-grid-v {
          background-image: linear-gradient(to bottom, rgba(100, 152, 254, 0.08) 1px, transparent 1px);
          background-size: 100% 80px;
          animation: ow-slide-v 26s linear infinite;
        }
        @keyframes ow-slide-h {
          0%   { background-position: 0 0; }
          100% { background-position: 80px 0; }
        }
        @keyframes ow-slide-v {
          0%   { background-position: 0 0; }
          100% { background-position: 0 80px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ow-grid-h, .ow-grid-v { animation: none; }
        }
      `}</style>
    </section>
  );
};

// ── Individual project panel ────────────────────────────────
const ProjectPanel = ({ project }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-xl overflow-hidden">
      {/* Top bar — website name + link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 sm:px-10 py-5 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {project.name}
          </h3>
          {project.note && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-[#6498fe] text-xs font-bold border border-blue-100">
              {project.note}
            </span>
          )}
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#6498fe] transition-colors group"
        >
          <span className="truncate max-w-[220px] sm:max-w-none">{project.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
          <FaExternalLinkAlt className="text-xs group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {/* Images — 3 across */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 sm:p-4 bg-gray-50">
        {project.images.map((src, i) => (
          <div
            key={i}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-200 group"
          >
            <img
              src={src}
              alt={`${project.name} screenshot ${i + 1}`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>

      {/* Client quote */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 px-6 sm:px-10 py-6 sm:py-7 border-t border-gray-100 bg-white">
        <div className="flex-shrink-0">
          <img
            src={project.client.photo}
            alt={project.client.name}
            loading="lazy"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-blue-100"
          />
        </div>
        <div className="flex-1 min-w-0">
          <blockquote className="text-gray-700 text-sm sm:text-base leading-relaxed italic">
            <span className="text-[#6498fe] text-2xl leading-none mr-1 font-serif">"</span>
            {project.client.quote}
            <span className="text-[#6498fe] text-2xl leading-none ml-1 font-serif">"</span>
          </blockquote>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="font-bold text-gray-900">— {project.client.name}</span>
            {project.client.company && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500">{project.client.company}</span>
              </>
            )}
            {project.note && (
              <span className="sm:hidden inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-[#6498fe] text-[10px] font-bold border border-blue-100">
                {project.note}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurWorkSection;
