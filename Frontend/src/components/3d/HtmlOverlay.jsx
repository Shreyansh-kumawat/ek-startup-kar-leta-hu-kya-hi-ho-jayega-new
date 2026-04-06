import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useScroll } from '@react-three/drei';

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL RANGES — must mirror ParticleMorphing.jsx exactly
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  HERO_IN:        0.00,
  HERO_OUT:       0.18,
  PROBLEM_IN:     0.20,
  PROBLEM_OUT:    0.38,
  DORMANT_END:    0.42,
  HOW_IN:         0.44,
  HOW_OUT:        0.58,
  WHO_IN:         0.60,
  WHO_OUT:        0.74,
  SATURN_END:     0.78,
  TEXT_START:     0.78,
  TEXT_LABEL_OUT: 0.92,
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY — map a value from [inMin,inMax] → [0,1], clamped
// ─────────────────────────────────────────────────────────────────────────────
const norm = (val, inMin, inMax) =>
  Math.max(0, Math.min(1, (val - inMin) / (inMax - inMin)));

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY — fade-in then fade-out within a scroll window
// ─────────────────────────────────────────────────────────────────────────────
const windowAlpha = (r, inStart, inEnd, outStart, outEnd) => {
  const fadeIn  = norm(r, inStart, inEnd);
  const fadeOut = 1 - norm(r, outStart, outEnd);
  return Math.min(fadeIn, fadeOut);
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STYLE TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const FONT = "'Inter', 'system-ui', sans-serif";
const MONO = "'JetBrains Mono', 'Fira Mono', monospace";

const card = (accentColor = '#00ffab') => ({
  background:    `rgba(255,255,255,0.04)`,
  border:        `1px solid ${accentColor}28`,
  borderRadius:  16,
  padding:       '18px 22px',
  backdropFilter:'blur(10px)',
  boxShadow:     `0 0 18px ${accentColor}18`,
  minWidth:       170,
  textAlign:     'center',
});

const chip = (color = '#00ffab') => ({
  border:        `1px solid ${color}44`,
  background:    `${color}10`,
  borderRadius:   999,
  padding:       '7px 16px',
  color,
  fontFamily:    MONO,
  fontSize:       12,
  fontWeight:     700,
  letterSpacing: '0.04em',
  whiteSpace:    'nowrap',
});

// ─────────────────────────────────────────────────────────────────────────────
// HERO PANEL
// ─────────────────────────────────────────────────────────────────────────────
function HeroPanel({ r }) {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    const alpha = windowAlpha(r.current, S.HERO_IN, 0.06, S.HERO_OUT - 0.04, S.HERO_OUT);
    ref.current.style.opacity   = alpha;
    ref.current.style.transform = `translateY(${(1 - alpha) * 30}px)`;
    ref.current.style.visibility = alpha < 0.01 ? 'hidden' : 'visible';
  });

  return (
    <div
      ref={ref}
      style={{
        position:      'absolute',
        top:           '13%',
        left:          '50%',
        transform:     'translateX(-50%)',
        width:         'min(760px, 92vw)',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:            20,
        pointerEvents: 'none',
        userSelect:    'none',
        opacity:        0,
        transition:    'none',
      }}
    >
      {/* Badge */}
      <div style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:            8,
        border:        '1px solid rgba(0,255,171,0.35)',
        background:    'rgba(0,255,171,0.08)',
        borderRadius:   999,
        padding:       '6px 20px',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#00ffab', display: 'inline-block',
          boxShadow: '0 0 8px #00ffab',
          animation: 'pulse3d 1.6s ease-in-out infinite',
        }} />
        <span style={{
          color:         '#00ffab',
          fontFamily:    MONO,
          fontSize:       11,
          letterSpacing: '0.22em',
        }}>
          WEBSITE DELIVERY INFRASTRUCTURE
        </span>
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize:      'clamp(38px, 7.5vw, 86px)',
        fontWeight:     900,
        color:         '#ffffff',
        textAlign:     'center',
        lineHeight:     1.08,
        fontFamily:    FONT,
        margin:         0,
        textShadow:    '0 0 50px rgba(0,255,171,0.25), 0 2px 40px rgba(0,0,0,0.8)',
        letterSpacing: '-0.02em',
      }}>
        Your{' '}
        <span style={{
          color:      '#00ffab',
          textShadow: '0 0 35px #00ffab, 0 0 70px #00ffab44',
        }}>
          Invisible
        </span>
        <br />
        Dev Team
      </h1>

      {/* Subline */}
      <div style={{
        border:        '1px solid rgba(255,255,255,0.12)',
        background:    'rgba(255,255,255,0.05)',
        borderRadius:   12,
        padding:       '10px 28px',
        backdropFilter:'blur(8px)',
      }}>
        <p style={{
          color:         'rgba(255,255,255,0.85)',
          fontFamily:    FONT,
          fontSize:       'clamp(14px, 2vw, 19px)',
          fontWeight:     600,
          margin:         0,
          letterSpacing: '0.02em',
        }}>
          You Close.&nbsp;&nbsp;We Build.&nbsp;&nbsp;You Deliver.
        </p>
      </div>

      {/* Stat chips */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { label: '3 Days Delivery',  color: '#00ffab' },
          { label: 'White Label',      color: '#06b6d4' },
          { label: 'Your Brand',       color: '#a78bfa' },
        ].map(({ label, color }) => (
          <div key={label} style={chip(color)}>{label}</div>
        ))}
      </div>

      {/* Description */}
      <p style={{
        color:         'rgba(255,255,255,0.55)',
        fontFamily:    FONT,
        fontSize:       'clamp(13px, 1.6vw, 16px)',
        textAlign:     'center',
        maxWidth:       520,
        lineHeight:     1.7,
        margin:         0,
      }}>
        3Digree is the backend infrastructure for freelancers and small IT companies.
        We handle building &amp; deployment — you focus on clients and growth.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM PANEL
// ─────────────────────────────────────────────────────────────────────────────
function ProblemPanel({ r }) {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    const alpha = windowAlpha(r.current, S.PROBLEM_IN, S.PROBLEM_IN + 0.07, S.PROBLEM_OUT - 0.05, S.PROBLEM_OUT);
    ref.current.style.opacity    = alpha;
    ref.current.style.transform  = `translateX(-50%) translateY(${(1 - alpha) * 25}px)`;
    ref.current.style.visibility = alpha < 0.01 ? 'hidden' : 'visible';
  });

  const problems = [
    { icon: '⏱️', title: 'Time Drain',         desc: 'Weeks on the same sites',    color: '#f87171' },
    { icon: '💸', title: 'Hiring Hassles',      desc: 'Expensive & unpredictable',  color: '#fb923c' },
    { icon: '📉', title: 'Shrinking Margins',   desc: 'Scaling feels impossible',   color: '#fbbf24' },
  ];

  return (
    <div
      ref={ref}
      style={{
        position:      'absolute',
        top:           '16%',
        left:          '50%',
        transform:     'translateX(-50%)',
        width:         'min(820px, 92vw)',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:            24,
        pointerEvents: 'none',
        userSelect:    'none',
        opacity:        0,
      }}
    >
      <h2 style={{
        fontSize:      'clamp(26px, 5vw, 52px)',
        fontWeight:     900,
        color:         '#fff',
        fontFamily:    FONT,
        margin:         0,
        textAlign:     'center',
        textShadow:    '0 0 30px #3b82f6aa',
      }}>
        The{' '}
        <span style={{ color: '#60a5fa', textShadow: '0 0 25px #3b82f6' }}>
          Delivery Bottleneck
        </span>
      </h2>

      <p style={{
        color:      'rgba(255,255,255,0.5)',
        fontFamily: FONT,
        fontSize:    'clamp(13px, 1.5vw, 15px)',
        margin:      0,
        textAlign:  'center',
      }}>
        If you're a freelancer or small agency — you know this pain
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        {problems.map(({ icon, title, desc, color }) => (
          <div key={title} style={card(color)}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>{icon}</div>
            <div style={{
              color,
              fontFamily:  FONT,
              fontWeight:  700,
              fontSize:    15,
              marginBottom: 6,
              textShadow:  `0 0 10px ${color}88`,
            }}>
              {title}
            </div>
            <div style={{
              color:      'rgba(255,255,255,0.45)',
              fontFamily: FONT,
              fontSize:   12,
              lineHeight:  1.5,
            }}>
              {desc}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background:    'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(0,255,171,0.07))',
        border:        '1px solid rgba(59,130,246,0.25)',
        borderRadius:   14,
        padding:       '16px 32px',
        textAlign:     'center',
        backdropFilter:'blur(8px)',
      }}>
        <p style={{
          color:      '#fff',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize:   'clamp(13px, 1.8vw, 17px)',
          margin:     '0 0 4px',
        }}>
          Clients keep coming — delivery can't scale.
        </p>
        <p style={{
          color:      '#00ffab',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize:    13,
          margin:      0,
        }}>
          That's exactly where 3Digree steps in!
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function HowPanel({ r }) {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    const alpha = windowAlpha(r.current, S.HOW_IN, S.HOW_IN + 0.07, S.HOW_OUT - 0.05, S.HOW_OUT);
    ref.current.style.opacity    = alpha;
    ref.current.style.transform  = `translateX(-50%) translateY(${(1 - alpha) * 25}px)`;
    ref.current.style.visibility = alpha < 0.01 ? 'hidden' : 'visible';
  });

  const steps = [
    { num: '01', icon: '🤝', title: 'You Close',   desc: 'Set your price. Own the client. We never contact them.',    color: '#00ffab' },
    { num: '02', icon: '⚡', title: 'We Build',    desc: 'Our system builds & deploys in 3 business days. Guaranteed.', color: '#06b6d4' },
    { num: '03', icon: '🎯', title: 'You Deliver', desc: 'Your brand. Full credit. Healthy margin. Every time.',       color: '#a78bfa' },
  ];

  return (
    <div
      ref={ref}
      style={{
        position:      'absolute',
        top:           '14%',
        left:          '50%',
        transform:     'translateX(-50%)',
        width:         'min(820px, 92vw)',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:            24,
        pointerEvents: 'none',
        userSelect:    'none',
        opacity:        0,
      }}
    >
      <h2 style={{
        fontSize:      'clamp(26px, 5vw, 52px)',
        fontWeight:     900,
        color:         '#fff',
        fontFamily:    FONT,
        margin:         0,
        textAlign:     'center',
        textShadow:    '0 0 30px #00ffabaa',
      }}>
        How{' '}
        <span style={{ color: '#00ffab', textShadow: '0 0 25px #00ffab' }}>
          3Digree
        </span>{' '}
        Works
      </h2>

      <p style={{
        color:      'rgba(255,255,255,0.5)',
        fontFamily: FONT,
        fontSize:   'clamp(13px, 1.5vw, 15px)',
        margin:      0,
        textAlign:  'center',
      }}>
        Simple, transparent, and designed to make you the hero
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        {steps.map(({ num, icon, title, desc, color }) => (
          <div key={title} style={{
            ...card(color),
            position:  'relative',
            overflow:  'hidden',
            minWidth:   200,
            maxWidth:   240,
          }}>
            {/* Big watermark number */}
            <div style={{
              position:   'absolute',
              top:         4,
              right:       10,
              fontSize:    52,
              fontWeight:  900,
              color:       `${color}08`,
              fontFamily:  MONO,
              lineHeight:  1,
              userSelect: 'none',
            }}>
              {num}
            </div>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
            <div style={{
              color,
              fontFamily:   FONT,
              fontWeight:   700,
              fontSize:     15,
              marginBottom:  8,
              textShadow:   `0 0 10px ${color}88`,
            }}>
              {title}
            </div>
            <div style={{
              color:      'rgba(255,255,255,0.45)',
              fontFamily: FONT,
              fontSize:   12,
              lineHeight:  1.6,
            }}>
              {desc}
            </div>
          </div>
        ))}
      </div>

      {/* Promise banner */}
      <div style={{
        background:    'rgba(0,255,171,0.06)',
        border:        '1px solid rgba(0,255,171,0.25)',
        borderRadius:   14,
        padding:       '14px 32px',
        textAlign:     'center',
        backdropFilter:'blur(8px)',
        boxShadow:     '0 0 25px rgba(0,255,171,0.12)',
      }}>
        <p style={{
          color:      '#00ffab',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize:   'clamp(13px, 1.6vw, 16px)',
          margin:      0,
          textShadow: '0 0 15px #00ffab66',
        }}>
          🔒 Your client never knows we exist — that's the promise.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WHO IT'S FOR PANEL
// ─────────────────────────────────────────────────────────────────────────────
function WhoPanel({ r }) {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    const alpha = windowAlpha(r.current, S.WHO_IN, S.WHO_IN + 0.07, S.WHO_OUT - 0.05, S.WHO_OUT);
    ref.current.style.opacity    = alpha;
    ref.current.style.transform  = `translateX(-50%) translateY(${(1 - alpha) * 25}px)`;
    ref.current.style.visibility = alpha < 0.01 ? 'hidden' : 'visible';
  });

  const audience = [
    'Freelancers',        'Small IT Companies',
    'Digital Agencies',   'Web Design Studios',
    'Solopreneurs',       'Sales-Focused Agencies',
    'Business Consultants','Service Providers',
  ];

  return (
    <div
      ref={ref}
      style={{
        position:      'absolute',
        top:           '16%',
        left:          '50%',
        transform:     'translateX(-50%)',
        width:         'min(700px, 92vw)',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:            22,
        pointerEvents: 'none',
        userSelect:    'none',
        opacity:        0,
      }}
    >
      <h2 style={{
        fontSize:      'clamp(24px, 4.5vw, 48px)',
        fontWeight:     900,
        color:         '#fff',
        fontFamily:    FONT,
        margin:         0,
        textAlign:     'center',
        textShadow:    '0 0 30px #a855f7aa',
      }}>
        Who{' '}
        <span style={{ color: '#c084fc', textShadow: '0 0 25px #a855f7' }}>
          3Digree
        </span>{' '}
        Is Built For
      </h2>

      <p style={{
        color:      'rgba(255,255,255,0.5)',
        fontFamily: FONT,
        fontSize:   'clamp(13px, 1.5vw, 15px)',
        margin:      0,
        textAlign:  'center',
      }}>
        If you're one of these — we're your perfect backend partner
      </p>

      <div style={{
        display:        'flex',
        gap:             10,
        flexWrap:       'wrap',
        justifyContent: 'center',
        maxWidth:        620,
      }}>
        {audience.map((label) => (
          <div key={label} style={{
            border:       '1px solid rgba(192,132,252,0.35)',
            background:   'rgba(168,85,247,0.08)',
            borderRadius:  999,
            padding:      '8px 18px',
            color:        '#d8b4fe',
            fontFamily:   FONT,
            fontSize:      13,
            fontWeight:    600,
            backdropFilter:'blur(6px)',
          }}>
            ✓ {label}
          </div>
        ))}
      </div>

      <div style={{
        background:    'rgba(168,85,247,0.07)',
        border:        '1px solid rgba(168,85,247,0.2)',
        borderRadius:   14,
        padding:       '14px 28px',
        textAlign:     'center',
      }}>
        <p style={{
          color:      '#e9d5ff',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize:   'clamp(12px, 1.5vw, 15px)',
          margin:      0,
        }}>
          Want predictable delivery without expanding your team?
          <br />
          <span style={{ color: '#c084fc' }}>That's exactly what 3Digree delivers.</span>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT REVEAL LABEL — appears below the "3Digree" particle text formation
// ─────────────────────────────────────────────────────────────────────────────
function TextRevealLabel({ r }) {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    const alpha = windowAlpha(r.current, S.TEXT_START + 0.04, S.TEXT_START + 0.1, S.TEXT_LABEL_OUT - 0.04, S.TEXT_LABEL_OUT);
    ref.current.style.opacity    = alpha;
    ref.current.style.visibility = alpha < 0.01 ? 'hidden' : 'visible';
  });

  return (
    <div
      ref={ref}
      style={{
        position:       'absolute',
        bottom:         '22%',
        left:           '50%',
        transform:      'translateX(-50%)',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:             12,
        pointerEvents:  'none',
        userSelect:     'none',
        opacity:         0,
        whiteSpace:     'nowrap',
      }}
    >
      <p style={{
        color:         'rgba(255,255,255,0.5)',
        fontFamily:    MONO,
        fontSize:       11,
        letterSpacing: '0.28em',
        margin:         0,
      }}>
        YOUR INVISIBLE DEV TEAM
      </p>
      <div style={{
        display:    'flex',
        gap:         8,
        alignItems: 'center',
      }}>
        <div style={{ height: 1, width: 32, background: 'rgba(255,255,255,0.15)' }} />
        <div style={{ height: 1, width: 14, background: '#00ffab' }} />
        <div style={{ height: 1, width: 32, background: 'rgba(255,255,255,0.15)' }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL HINT — fixed at bottom, fades out after first 10% scroll
// ─────────────────────────────────────────────────────────────────────────────
function ScrollHint({ r }) {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    const alpha = Math.max(0, 1 - r.current / 0.10);
    ref.current.style.opacity = alpha;
  });

  return (
    <div
      ref={ref}
      style={{
        position:       'fixed',
        bottom:          32,
        left:           '50%',
        transform:      'translateX(-50%)',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:             6,
        pointerEvents:  'none',
        userSelect:     'none',
      }}
    >
      <span style={{
        color:         'rgba(255,255,255,0.22)',
        fontFamily:    MONO,
        fontSize:       10,
        letterSpacing: '0.25em',
      }}>
        SCROLL TO EXPLORE
      </span>
      {/* Animated chevron */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width:        10,
            height:       10,
            borderRight:  '1.5px solid rgba(0,255,171,0.4)',
            borderBottom: '1.5px solid rgba(0,255,171,0.4)',
            transform:    'rotate(45deg)',
            animation:    `chevron3d 1.4s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML OVERLAY — root export, renders all panels via a single <Html fullscreen>
// ─────────────────────────────────────────────────────────────────────────────
export default function HtmlOverlay({ scrollProgress }) {
  // scrollProgress is a ref passed from ParticleHero
  const r = scrollProgress;

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      {/* Keyframe injection */}
      <style>{`
        @keyframes pulse3d {
          0%, 100% { opacity: 1;   transform: scale(1);    box-shadow: 0 0 8px #00ffab; }
          50%       { opacity: 0.5; transform: scale(1.35); box-shadow: 0 0 16px #00ffab; }
        }
        @keyframes chevron3d {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.7;  }
        }
      `}</style>

      <HeroPanel        r={r} />
      <ProblemPanel     r={r} />
      <HowPanel         r={r} />
      <WhoPanel         r={r} />
      <TextRevealLabel  r={r} />
      <ScrollHint       r={r} />
    </Html>
  );
}
