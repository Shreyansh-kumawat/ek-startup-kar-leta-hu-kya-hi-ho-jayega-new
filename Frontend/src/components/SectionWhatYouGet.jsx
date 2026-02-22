import React, { useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// FADE-IN WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, direction = 'up' }) => {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-72px' });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: direction === 'up' ? 36 : direction === 'down' ? -36 : 0,
        scale: 0.97,
      }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER — counts up to a number when it enters the viewport
// ─────────────────────────────────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '', prefix = '', duration = 1.8, color }) => {
  const ref        = useRef(null);
  const spanRef    = useRef(null);
  const isInView   = useInView(ref, { once: true, margin: '-60px' });
  const hasRun     = useRef(false);

  React.useEffect(() => {
    if (isInView && !hasRun.current && spanRef.current) {
      hasRun.current = true;
      const controls = animate(0, target, {
        duration,
        ease:     'easeOut',
        onUpdate: (v) => {
          if (spanRef.current) {
            spanRef.current.textContent =
              prefix +
              (Number.isInteger(target)
                ? Math.round(v).toLocaleString()
                : v.toFixed(1)) +
              suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView]);

  return (
    <div ref={ref}>
      <span
        ref={spanRef}
        style={{
          fontSize:      'clamp(32px, 5vw, 52px)',
          fontWeight:     900,
          color:          color,
          fontFamily:    "'Inter', system-ui, sans-serif",
          letterSpacing: '-0.025em',
          textShadow:   `0 0 28px ${color}88`,
          display:       'block',
        }}
      >
        {prefix}0{suffix}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE PILL — compact tag chip for features list
// ─────────────────────────────────────────────────────────────────────────────
const FeaturePill = ({ icon, label, accentColor, delay }) => {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85, y: 16 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        scale:     1.08,
        boxShadow: `0 0 22px ${accentColor}55`,
        y:        -2,
      }}
      style={{
        display:    'inline-flex',
        alignItems: 'center',
        gap:         8,
        border:     `1px solid ${accentColor}30`,
        background: `${accentColor}0c`,
        borderRadius: 999,
        padding:    '10px 18px',
        cursor:     'default',
        backdropFilter: 'blur(8px)',
        boxShadow:  `0 0 10px ${accentColor}18`,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <span style={{
        fontSize: 16,
        filter:  `drop-shadow(0 0 6px ${accentColor}88)`,
      }}>
        {icon}
      </span>
      <span style={{
        color:      accentColor,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize:    13,
        fontWeight:  700,
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
      }}>
        {label}
      </span>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD — large number + label
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ prefix, target, suffix, label, sublabel, accentColor, delay }) => {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32, scale: 0.94 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.68, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        scale:     1.04,
        boxShadow: `0 0 42px ${accentColor}44, 0 8px 32px rgba(0,0,0,0.4)`,
        y:        -4,
      }}
      style={{
        position:      'relative',
        background:    `linear-gradient(155deg, ${accentColor}0d, rgba(255,255,255,0.025))`,
        border:        `1px solid ${accentColor}28`,
        borderRadius:   20,
        padding:       '32px 28px',
        overflow:      'hidden',
        cursor:        'default',
        textAlign:     'center',
        transition:    'box-shadow 0.3s ease',
      }}
    >
      {/* Radial glow */}
      <div style={{
        position:   'absolute',
        inset:       0,
        background: `radial-gradient(circle at 50% 0%, ${accentColor}16, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* Top line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, delay: delay + 0.15 }}
        style={{
          position:        'absolute',
          top:              0,
          left:             0,
          right:            0,
          height:           2,
          background:      `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          transformOrigin: 'left',
          borderRadius:   '20px 20px 0 0',
        }}
      />

      {/* Counter */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AnimatedCounter
          target={target}
          prefix={prefix}
          suffix={suffix}
          color={accentColor}
          duration={1.6}
        />

        <p style={{
          margin:        '6px 0 4px',
          fontSize:       16,
          fontWeight:     700,
          color:         '#ffffff',
          fontFamily:    "'Inter', system-ui, sans-serif",
          letterSpacing: '-0.01em',
        }}>
          {label}
        </p>

        <p style={{
          margin:     0,
          fontSize:   12,
          color:      'rgba(255,255,255,0.38)',
          fontFamily: "'Inter', system-ui, sans-serif",
          lineHeight:  1.5,
        }}>
          {sublabel}
        </p>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BENEFIT ROW — icon + title + description in a horizontal layout
// ─────────────────────────────────────────────────────────────────────────────
const BenefitRow = ({ icon, title, description, accentColor, delay }) => {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -28 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 4 }}
      style={{
        display:   'flex',
        alignItems:'flex-start',
        gap:        18,
        padding:   '20px 24px',
        border:    `1px solid ${accentColor}1e`,
        borderRadius: 16,
        background: `${accentColor}07`,
        cursor:    'default',
        transition:'background 0.3s ease',
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width:          48,
        height:         48,
        borderRadius:   '50%',
        background:    `${accentColor}15`,
        border:        `1.5px solid ${accentColor}35`,
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        fontSize:       22,
        flexShrink:     0,
        boxShadow:     `0 0 16px ${accentColor}22`,
      }}>
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{
          margin:        '0 0 5px',
          fontSize:       15,
          fontWeight:     700,
          color:          accentColor,
          fontFamily:    "'Inter', system-ui, sans-serif",
          textShadow:   `0 0 12px ${accentColor}55`,
        }}>
          {title}
        </h4>
        <p style={{
          margin:     0,
          fontSize:   13,
          color:      'rgba(255,255,255,0.46)',
          fontFamily: "'Inter', system-ui, sans-serif",
          lineHeight:  1.65,
        }}>
          {description}
        </p>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DATA
// ─────────────────────────────────────────────────────────────────────────────
const featurePills = [
  { icon: '⚡', label: '3 Days Delivery',         accentColor: '#00ffab' },
  { icon: '🏷️', label: 'Template-Based System',   accentColor: '#06b6d4' },
  { icon: '🔒', label: 'White Label Solution',     accentColor: '#a78bfa' },
  { icon: '🎯', label: 'Your Brand, Our Work',     accentColor: '#f472b6' },
  { icon: '✅', label: 'Predictable Quality',      accentColor: '#fb923c' },
  { icon: '📈', label: 'Scalable Infrastructure',  accentColor: '#34d399' },
  { icon: '🚫', label: 'No Hiring Hassles',        accentColor: '#fbbf24' },
  { icon: '💰', label: 'Better Margins',           accentColor: '#60a5fa' },
  { icon: '🤫', label: 'Fully Invisible',          accentColor: '#e879f9' },
  { icon: '📦', label: 'Full Source Handoff',      accentColor: '#00ffab' },
  { icon: '🔧', label: 'Any Stack Supported',      accentColor: '#06b6d4' },
  { icon: '📱', label: 'Mobile-First Builds',      accentColor: '#a78bfa' },
];

const stats = [
  {
    prefix: '',   target: 3,    suffix: ' Days',
    label:    'Delivery Guarantee',
    sublabel: 'Every single project, always',
    accentColor: '#00ffab',
  },
  {
    prefix: '',   target: 100,  suffix: '%',
    label:    'White Label',
    sublabel: 'Zero 3Digree branding ever',
    accentColor: '#06b6d4',
  },
  {
    prefix: '2×', target: 3,    suffix: '×',
    label:    'More Clients',
    sublabel: 'Average partner intake increase',
    accentColor: '#a78bfa',
  },
  {
    prefix: '',   target: 0,    suffix: ' Hires',
    label:    'Team Expansion',
    sublabel: 'Needed to scale your delivery',
    accentColor: '#f472b6',
  },
];

const benefits = [
  {
    icon:        '🕐',
    title:       'Speed That Scales',
    description: 'Consistent 3 business day turnaround on every project regardless of complexity. No timeline surprises, no excuses. Your clients stay impressed.',
    accentColor: '#00ffab',
  },
  {
    icon:        '📊',
    title:       'Better Margins Every Time',
    description: 'No developer salaries, no freelancer fees per project. Predictable costs mean you keep the difference. Your margin is yours to control.',
    accentColor: '#06b6d4',
  },
  {
    icon:        '🛡️',
    title:       'Your Brand. Only Yours.',
    description: '100% white label. We sign NDAs, never contact your clients, never brand anything with our name. Your client only ever sees you.',
    accentColor: '#a78bfa',
  },
  {
    icon:        '🔁',
    title:       'Infinitely Repeatable',
    description: 'The same quality, same speed, same result every time. Our system is built for repeatability so you can sell with confidence at volume.',
    accentColor: '#f472b6',
  },
  {
    icon:        '🤝',
    title:       'Partnership, Not Outsourcing',
    description: 'We are not a gig platform. We are a long-term backend partner. The longer we work together, the faster and better delivery becomes.',
    accentColor: '#fb923c',
  },
  {
    icon:        '📋',
    title:       'Simple Brief Process',
    description: 'No lengthy forms or complicated systems. Send us the brief on WhatsApp, answer a few targeted questions, and we take it from there.',
    accentColor: '#34d399',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WHAT YOU GET — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function SectionWhatYouGet() {
  return (
    <section
      style={{
        position:   'relative',
        padding:    'clamp(80px, 10vw, 130px) clamp(20px, 5vw, 60px)',
        background: '#0a0f1e',
        overflow:   'hidden',
      }}
    >
      {/* ── Background decorations ──────────────────────────────────────── */}
      <div style={{
        position:   'absolute',
        top:        '10%',
        right:      '-8%',
        width:       500,
        height:      500,
        borderRadius:'50%',
        background: 'radial-gradient(circle, rgba(0,255,171,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position:   'absolute',
        bottom:     '15%',
        left:       '-6%',
        width:       420,
        height:      420,
        borderRadius:'50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position:        'absolute',
        inset:            0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
        backgroundSize:  '60px 60px',
        pointerEvents:   'none',
      }} />

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Section label */}
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div style={{
              display:    'inline-flex',
              alignItems: 'center',
              gap:         8,
              border:     '1px solid rgba(0,255,171,0.3)',
              background: 'rgba(0,255,171,0.06)',
              borderRadius: 999,
              padding:    '5px 16px',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#00ffab', boxShadow: '0 0 8px #00ffab',
              }} />
              <span style={{
                color:         '#00ffab',
                fontFamily:    "'JetBrains Mono', monospace",
                fontSize:       11,
                fontWeight:     700,
                letterSpacing: '0.18em',
              }}>
                WHAT YOU GET
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Headline */}
        <FadeIn delay={0.08}>
          <h2 style={{
            textAlign:     'center',
            fontSize:      'clamp(30px, 5.5vw, 58px)',
            fontWeight:     900,
            color:         '#ffffff',
            fontFamily:    "'Inter', system-ui, sans-serif",
            letterSpacing: '-0.025em',
            lineHeight:     1.1,
            margin:        '0 0 16px',
            textShadow:    '0 0 40px rgba(0,255,171,0.2)',
          }}>
            Everything to Scale Delivery.{' '}
            <br />
            <span style={{
              color:      '#00ffab',
              textShadow: '0 0 30px #00ffabaa, 0 0 60px #00ffab44',
            }}>
              Nothing You Don't Need.
            </span>
          </h2>
        </FadeIn>

        {/* Sub-headline */}
        <FadeIn delay={0.14}>
          <p style={{
            textAlign:  'center',
            fontSize:   'clamp(14px, 1.8vw, 17px)',
            color:      'rgba(255,255,255,0.42)',
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight:  1.7,
            maxWidth:    520,
            margin:     '0 auto 56px',
          }}>
            A complete backend delivery infrastructure. Plug in, scale up, stay invisible.
          </p>
        </FadeIn>

        {/* Feature pills */}
        <FadeIn delay={0.18}>
          <div style={{
            display:        'flex',
            flexWrap:       'wrap',
            gap:             10,
            justifyContent: 'center',
            marginBottom:    64,
          }}>
            {featurePills.map((pill, i) => (
              <FeaturePill
                key={pill.label}
                {...pill}
                delay={0.22 + i * 0.05}
              />
            ))}
          </div>
        </FadeIn>

        {/* Stats row */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap:                  20,
          marginBottom:         64,
        }}>
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              {...stat}
              delay={0.15 + i * 0.12}
            />
          ))}
        </div>

        {/* Divider */}
        <FadeIn delay={0.2}>
          <div style={{
            display:        'flex',
            alignItems:     'center',
            gap:             20,
            marginBottom:    56,
          }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08))' }} />
            <span style={{
              color:         'rgba(255,255,255,0.2)',
              fontFamily:    "'JetBrains Mono', monospace",
              fontSize:       11,
              letterSpacing: '0.2em',
              whiteSpace:    'nowrap',
            }}>
              WHY IT WORKS
            </span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)' }} />
          </div>
        </FadeIn>

        {/* Benefits grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap:                  16,
          marginBottom:         52,
        }}>
          {benefits.map((b, i) => (
            <BenefitRow
              key={b.title}
              {...b}
              delay={0.1 + i * 0.1}
            />
          ))}
        </div>

        {/* CTA strip */}
        <FadeIn delay={0.5}>
          <motion.div
            animate={{
              boxShadow: [
                '0 0 24px rgba(0,255,171,0.1)',
                '0 0 52px rgba(0,255,171,0.24)',
                '0 0 24px rgba(0,255,171,0.1)',
              ],
            }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:    'linear-gradient(135deg, rgba(0,255,171,0.09), rgba(6,182,212,0.07))',
              border:        '1px solid rgba(0,255,171,0.22)',
              borderRadius:   20,
              padding:       'clamp(24px, 4vw, 40px) clamp(24px, 5vw, 56px)',
              textAlign:     'center',
              backdropFilter:'blur(12px)',
            }}
          >
            <p style={{
              margin:        '0 0 8px',
              fontSize:      'clamp(17px, 2.5vw, 24px)',
              fontWeight:     800,
              color:         '#ffffff',
              fontFamily:    "'Inter', system-ui, sans-serif",
              letterSpacing: '-0.015em',
            }}>
              We're not just a service provider.
            </p>
            <p style={{
              margin:     '0 0 24px',
              fontSize:   'clamp(13px, 1.6vw, 16px)',
              color:      'rgba(255,255,255,0.5)',
              fontFamily: "'Inter', system-ui, sans-serif",
              lineHeight:  1.6,
            }}>
              We're your invisible dev team, your delivery infrastructure,
              your growth enabler.
            </p>
            <a
              href="https://wa.me/918741967971"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:            10,
                background:    '#00ffab',
                color:         '#0a0f1e',
                fontFamily:    "'Inter', system-ui, sans-serif",
                fontWeight:     800,
                fontSize:       15,
                padding:       '14px 32px',
                borderRadius:   999,
                textDecoration: 'none',
                boxShadow:     '0 0 28px #00ffab55',
                letterSpacing: '-0.01em',
                transition:    'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform  = 'scale(1.06)';
                e.currentTarget.style.boxShadow  = '0 0 42px #00ffab88';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform  = 'scale(1)';
                e.currentTarget.style.boxShadow  = '0 0 28px #00ffab55';
              }}
            >
              🚀 Start Partnering With Us
            </a>
          </motion.div>
        </FadeIn>

      </div>
    </section>
  );
}
