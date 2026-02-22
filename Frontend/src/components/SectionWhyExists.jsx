import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaCode, FaRocket, FaShieldAlt } from 'react-icons/fa';

// ─── FADE-IN WRAPPER ────────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: direction === 'up' ? 24 : direction === 'down' ? -24 : 0,
        x: direction === 'left' ? 24 : direction === 'right' ? -24 : 0,
      }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ─── ORIGIN CARD ─────────────────────────────────────────────────────────────
const OriginCard = ({ Icon, title, body, accentColor, index, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -5,
        boxShadow: `0 0 36px ${accentColor}33, 0 14px 40px rgba(0,0,0,0.4)`,
      }}
      style={{
        position: 'relative',
        background: `linear-gradient(160deg, ${accentColor}0d, rgba(255,255,255,0.02))`,
        border: `1px solid ${accentColor}28`,
        borderRadius: 22,
        padding: '32px 28px',
        overflow: 'hidden',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        height: '100%',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Watermark index */}
      <div style={{
        position: 'absolute',
        bottom: -14,
        right: 10,
        fontSize: 100,
        fontWeight: 900,
        color: `${accentColor}05`,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        {String(index).padStart(2, '0')}
      </div>

      {/* Top bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, delay: delay + 0.15, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          transformOrigin: 'left',
        }}
      />

      {/* Corner glow */}
      <div style={{
        position: 'absolute',
        top: -36, right: -36,
        width: 110, height: 110,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}20, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Icon — no motion on hover */}
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: `${accentColor}12`,
        border: `1.5px solid ${accentColor}32`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ fontSize: 24, color: accentColor }} />
      </div>

      {/* Title */}
      <h3 style={{
        margin: 0,
        fontSize: 20,
        fontWeight: 800,
        color: '#ffffff',
        fontFamily: "'Inter', system-ui, sans-serif",
        letterSpacing: '-0.015em',
        lineHeight: 1.25,
      }}>
        {title}
      </h3>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexGrow: 1 }}>
        {body.map((para, i) => (
          <p key={i} style={{
            margin: 0,
            fontSize: 13,
            color: i === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)',
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight: 1.72,
          }}>
            {para}
          </p>
        ))}
      </div>

      {/* Accent dot */}
      <div style={{
        width: 7, height: 7,
        borderRadius: '50%',
        background: accentColor,
        alignSelf: 'flex-start',
      }} />
    </motion.div>
  );
};

// ─── TIMELINE ITEM ────────────────────────────────────────────────────────────
const TimelineItem = ({ year, event, detail, accentColor, isLast, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', gap: 20, position: 'relative' }}
    >
      {/* Spine */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        width: 22,
      }}>
        {/* Node — plain div, no spring */}
        <div style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: accentColor,
          border: `3px solid ${accentColor}40`,
          zIndex: 1,
          flexShrink: 0,
        }} />
        {!isLast && (
          <div style={{
            width: 2,
            flex: 1,
            minHeight: 36,
            background: `linear-gradient(180deg, ${accentColor}44, ${accentColor}0a)`,
            marginTop: 4,
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : 36, flex: 1 }}>
        <div style={{ marginBottom: 7 }}>
          <span style={{
            background: accentColor,
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: 10,
            fontWeight: 700,
            color: '#0a0f1e',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.1em',
          }}>
            {year}
          </span>
        </div>
        <h4 style={{
          margin: '0 0 5px',
          fontSize: 15,
          fontWeight: 700,
          color: '#ffffff',
          fontFamily: "'Inter', system-ui, sans-serif",
          lineHeight: 1.3,
        }}>
          {event}
        </h4>
        <p style={{
          margin: 0,
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)',
          fontFamily: "'Inter', system-ui, sans-serif",
          lineHeight: 1.65,
        }}>
          {detail}
        </p>
      </div>
    </motion.div>
  );
};

// ─── MISSION STATEMENT ────────────────────────────────────────────────────────
const MissionStatement = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        textAlign: 'center',
        padding: 'clamp(36px, 6vw, 64px) clamp(24px, 6vw, 72px)',
        borderRadius: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(0,255,171,0.05), rgba(124,58,237,0.05), rgba(6,182,212,0.03))',
        border: '1px solid rgba(0,255,171,0.13)',
      }}
    >
      {/* Static glow — no animate loop */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 560, height: 360,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,255,171,0.06), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Quote mark */}
      <div style={{
        fontSize: 72,
        lineHeight: 0.8,
        color: 'rgba(0,255,171,0.1)',
        fontFamily: 'Georgia, serif',
        marginBottom: 22,
        userSelect: 'none',
      }}>
        "
      </div>

      <blockquote style={{
        margin: 0,
        fontSize: 'clamp(17px, 3vw, 26px)',
        fontWeight: 700,
        color: '#ffffff',
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight: 1.55,
        letterSpacing: '-0.015em',
        position: 'relative',
        zIndex: 1,
        maxWidth: 720,
        marginInline: 'auto',
      }}>
        We're not just a service provider. We're the{' '}
        <span style={{ color: '#00ffab' }}>invisible infrastructure</span>{' '}
        that makes your delivery faster, your margins better, and your{' '}
        <span style={{ color: '#06b6d4' }}>growth possible</span>.
      </blockquote>

      <div style={{
        marginTop: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ height: 1, width: 36, background: 'rgba(0,255,171,0.28)' }} />
        <span style={{
          color: 'rgba(255,255,255,0.3)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.2em',
        }}>
          3DIGREE MISSION
        </span>
        <div style={{ height: 1, width: 36, background: 'rgba(0,255,171,0.28)' }} />
      </div>
    </motion.div>
  );
};

// ─── SECTION DATA ─────────────────────────────────────────────────────────────
const cards = [
  {
    Icon: FaCode,
    title: 'Built from Real Experience',
    accentColor: '#06b6d4',
    body: [
      "We didn't build 3Digree in a vacuum. We built it because we lived the problem. As freelancers, we were drowning in the same delivery bottleneck we now help others escape.",
      "Every feature of 3Digree exists because we needed it ourselves and couldn't find it anywhere else.",
    ],
  },
  {
    Icon: FaRocket,
    title: 'A Universal Problem',
    accentColor: '#00ffab',
    body: [
      'Once we solved it for ourselves, we looked around and realized every freelancer and small agency was facing the exact same wall. Delivery is the ceiling for growth — everywhere.',
      'That realization turned a personal fix into a platform built for an entire industry.',
    ],
  },
  {
    Icon: FaShieldAlt,
    title: 'Your Infrastructure Partner',
    accentColor: '#a78bfa',
    body: [
      "We're not a marketplace. We're not a gig platform. We're a dedicated backend partner — the silent engine behind your client-facing business.",
      "The longer we work together, the more seamlessly we integrate into your workflow and the faster everything moves.",
    ],
  },
];

const timeline = [
  {
    year: 'The Pain',
    event: 'Freelancers Hitting a Ceiling',
    detail: 'Both founders were independent freelancers closing more deals than they could build. Delivery kept slipping. Quality was inconsistent. Growth stalled.',
    accentColor: '#f87171',
  },
  {
    year: 'The Insight',
    event: 'Delivery Is the Real Product',
    detail: "The realization: clients don't pay for code — they pay for confidence. Fast, reliable, on-brand delivery IS the product. Everything else is noise.",
    accentColor: '#fb923c',
  },
  {
    year: 'The Build',
    event: '3Digree Is Born',
    detail: 'We systematized the entire delivery process — templates, QA, handoff protocols — into a repeatable machine. Then we opened it to other freelancers.',
    accentColor: '#00ffab',
  },
  {
    year: 'Now',
    event: 'Your Backend Infrastructure',
    detail: '3Digree runs silently behind dozens of freelancers and agencies, delivering websites in 3 days under their brands while they focus on sales and clients.',
    accentColor: '#06b6d4',
  },
];

// ─── SECTION WHY EXISTS — main export ────────────────────────────────────────
export default function SectionWhyExists() {
  return (
    <section style={{
      position: 'relative',
      padding: 'clamp(72px, 10vw, 120px) clamp(20px, 5vw, 60px)',
      background: '#080c18',
      overflow: 'hidden',
    }}>
      {/* Static bg blobs — no grid overlay */}
      <div style={{
        position: 'absolute', top: '5%', left: '-5%',
        width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-6%',
        width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,171,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Section label */}
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(124,58,237,0.28)',
              background: 'rgba(124,58,237,0.05)',
              borderRadius: 999, padding: '5px 14px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed' }} />
              <span style={{
                color: '#a78bfa', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
              }}>
                OUR STORY
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Headline */}
        <FadeIn delay={0.08}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(28px, 5.5vw, 54px)',
            fontWeight: 900, color: '#ffffff',
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: '-0.025em', lineHeight: 1.1,
            margin: '0 0 14px',
          }}>
            Why{' '}
            <span style={{ color: '#a78bfa' }}>3Digree</span>{' '}
            Exists
          </h2>
        </FadeIn>

        {/* Sub-headline */}
        <FadeIn delay={0.13}>
          <p style={{
            textAlign: 'center',
            fontSize: 'clamp(13px, 1.8vw, 16px)',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight: 1.7, maxWidth: 500,
            margin: '0 auto 56px',
          }}>
            Not a pitch. Not a product story. The real reason we built this — because we needed it ourselves.
          </p>
        </FadeIn>

        {/* Origin cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 64,
        }}>
          {cards.map((card, i) => (
            <OriginCard
              key={card.title}
              {...card}
              index={i + 1}
              delay={0.15 + i * 0.12}
            />
          ))}
        </div>

        {/* Two-column: timeline + stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 48,
          marginBottom: 60,
          alignItems: 'start',
        }}>
          {/* Timeline */}
          <div>
            <FadeIn delay={0.1}>
              <h3 style={{
                margin: '0 0 28px',
                fontSize: 18,
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: '-0.01em',
              }}>
                How We Got Here
              </h3>
            </FadeIn>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {timeline.map((item, i) => (
                <TimelineItem
                  key={item.year}
                  {...item}
                  isLast={i === timeline.length - 1}
                  delay={0.12 + i * 0.1}
                />
              ))}
            </div>
          </div>

          {/* Stats column — Parallax removed, plain div */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <FadeIn delay={0.18}>
              <h3 style={{
                margin: '0 0 6px',
                fontSize: 18,
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: '-0.01em',
              }}>
                The Numbers Behind It
              </h3>
            </FadeIn>

            {[
              { label: 'Average time wasted on repeat builds',              value: '60%',  color: '#f87171' },
              { label: 'Of agencies say delivery is their #1 bottleneck',   value: '78%',  color: '#fb923c' },
              { label: 'Revenue increase after removing delivery overhead',  value: '2.4×', color: '#00ffab' },
              { label: 'Of freelancers never hire despite needing help',     value: '85%',  color: '#06b6d4' },
            ].map(({ label, value, color }, i) => (
              <FadeIn key={label} delay={0.22 + i * 0.08}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '16px 20px',
                  border: `1px solid ${color}1a`,
                  borderRadius: 13,
                  background: `${color}06`,
                }}>
                  <span style={{
                    fontSize: 'clamp(20px, 3.5vw, 28px)',
                    fontWeight: 900,
                    color,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    flexShrink: 0,
                    minWidth: 64,
                    textAlign: 'right',
                  }}>
                    {value}
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.42)',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    lineHeight: 1.55,
                  }}>
                    {label}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Mission statement */}
        <FadeIn delay={0.28}>
          <MissionStatement />
        </FadeIn>

      </div>
    </section>
  );
}
