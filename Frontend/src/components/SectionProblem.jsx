import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// FADE-IN WRAPPER — reusable scroll-triggered entrance animation
// ─────────────────────────────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-72px' });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up'    ?  36 : direction === 'down' ? -36 : 0,
      x: direction === 'left'  ?  36 : direction === 'right'? -36 : 0,
      scale: 0.97,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM CARD — individual pain point
// ─────────────────────────────────────────────────────────────────────────────
const ProblemCard = ({ icon, title, description, accentColor, delay }) => {
  return (
    <FadeIn delay={delay}>
      <motion.div
        whileHover={{
          scale: 1.04,
          boxShadow: `0 0 40px ${accentColor}44, 0 8px 32px rgba(0,0,0,0.4)`,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          position:       'relative',
          background:     `linear-gradient(145deg, ${accentColor}0a, rgba(255,255,255,0.02))`,
          border:         `1px solid ${accentColor}2a`,
          borderRadius:    20,
          padding:        '32px 28px',
          overflow:       'hidden',
          cursor:         'default',
          height:         '100%',
          display:        'flex',
          flexDirection:  'column',
          gap:             16,
        }}
      >
        {/* Corner accent glow */}
        <div style={{
          position:   'absolute',
          top:        -30,
          right:      -30,
          width:       90,
          height:      90,
          borderRadius:'50%',
          background: `radial-gradient(circle, ${accentColor}22, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Bottom accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
          style={{
            position:        'absolute',
            bottom:           0,
            left:             0,
            right:            0,
            height:           2,
            background:      `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            transformOrigin: 'left',
          }}
        />

        {/* Icon */}
        <div style={{
          fontSize:     42,
          lineHeight:    1,
          filter:       `drop-shadow(0 0 12px ${accentColor}88)`,
        }}>
          {icon}
        </div>

        {/* Title */}
        <h3 style={{
          margin:     0,
          fontSize:   20,
          fontWeight:  800,
          color:      '#ffffff',
          fontFamily: "'Inter', system-ui, sans-serif",
          textShadow: `0 0 14px ${accentColor}66`,
          lineHeight:  1.2,
        }}>
          {title}
        </h3>

        {/* Description */}
        <p style={{
          margin:     0,
          fontSize:   14,
          color:      'rgba(255,255,255,0.52)',
          fontFamily: "'Inter', system-ui, sans-serif",
          lineHeight:  1.75,
          flexGrow:    1,
        }}>
          {description}
        </p>

        {/* Accent dot */}
        <div style={{
          width:        8,
          height:       8,
          borderRadius: '50%',
          background:   accentColor,
          boxShadow:   `0 0 10px ${accentColor}`,
          alignSelf:   'flex-start',
        }} />
      </motion.div>
    </FadeIn>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DATA
// ─────────────────────────────────────────────────────────────────────────────
const problems = [
  {
    icon:        '⏱️',
    title:       'Time Drain',
    description: 'You spend weeks building the same types of websites over and over. Each project consumes your bandwidth. Your delivery becomes the bottleneck that caps your revenue.',
    accentColor: '#f87171',
  },
  {
    icon:        '💸',
    title:       'Hiring Hassles',
    description: 'Finding reliable developers project-by-project is expensive, exhausting, and unpredictable. Quality varies wildly. Timelines slip. Client trust erodes. Margins collapse.',
    accentColor: '#fb923c',
  },
  {
    icon:        '📉',
    title:       'Shrinking Margins',
    description: 'High delivery costs eat your profits before you can reinvest them. Scaling feels impossible without sacrificing quality — or your own sanity. Growth hits a wall.',
    accentColor: '#fbbf24',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION PROBLEM — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function SectionProblem() {
  const sectionRef = useRef(null);
  const isInView   = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      style={{
        position:   'relative',
        padding:    'clamp(80px, 10vw, 130px) clamp(20px, 5vw, 60px)',
        background: '#080c18',
        overflow:   'hidden',
      }}
    >
      {/* ── Background decorations ──────────────────────────────────────── */}

      {/* Left radial glow */}
      <div style={{
        position:   'absolute',
        top:        '20%',
        left:       '-10%',
        width:       500,
        height:      500,
        borderRadius:'50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Right radial glow */}
      <div style={{
        position:   'absolute',
        bottom:     '10%',
        right:      '-8%',
        width:       400,
        height:      400,
        borderRadius:'50%',
        background: 'radial-gradient(circle, rgba(248,113,113,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle grid overlay */}
      <div style={{
        position:   'absolute',
        inset:       0,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents:  'none',
      }} />

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Section label */}
        <FadeIn>
          <div style={{
            display:        'flex',
            justifyContent: 'center',
            marginBottom:    18,
          }}>
            <div style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:            8,
              border:        '1px solid rgba(248,113,113,0.3)',
              background:    'rgba(248,113,113,0.06)',
              borderRadius:   999,
              padding:       '5px 16px',
            }}>
              <div style={{
                width:        6,
                height:       6,
                borderRadius: '50%',
                background:   '#f87171',
                boxShadow:    '0 0 8px #f87171',
              }} />
              <span style={{
                color:         '#f87171',
                fontFamily:    "'JetBrains Mono', 'Fira Mono', monospace",
                fontSize:       11,
                fontWeight:     700,
                letterSpacing: '0.18em',
              }}>
                THE PROBLEM
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
            textShadow:    '0 0 40px rgba(59,130,246,0.3)',
          }}>
            The{' '}
            <span style={{
              color:      '#60a5fa',
              textShadow: '0 0 30px #3b82f6aa, 0 0 60px #3b82f644',
            }}>
              Delivery Bottleneck
            </span>
          </h2>
        </FadeIn>

        {/* Sub-headline */}
        <FadeIn delay={0.14}>
          <p style={{
            textAlign:  'center',
            fontSize:   'clamp(14px, 1.8vw, 17px)',
            color:      'rgba(255,255,255,0.45)',
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight:  1.7,
            maxWidth:    560,
            margin:     '0 auto 64px',
          }}>
            If you're a freelancer or running a small agency — you know this pain all too well.
          </p>
        </FadeIn>

        {/* Cards grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap:                  24,
          marginBottom:         40,
        }}>
          {problems.map((p, i) => (
            <ProblemCard
              key={p.title}
              {...p}
              delay={0.18 + i * 0.12}
            />
          ))}
        </div>

        {/* Callout banner */}
        <FadeIn delay={0.5}>
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(59,130,246,0.12)',
                '0 0 45px rgba(0,255,171,0.18)',
                '0 0 20px rgba(59,130,246,0.12)',
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:    'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(0,255,171,0.08))',
              border:        '1px solid rgba(59,130,246,0.22)',
              borderRadius:   20,
              padding:       'clamp(24px, 4vw, 40px) clamp(24px, 5vw, 56px)',
              textAlign:     'center',
              backdropFilter: 'blur(10px)',
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
              Clients keep coming — delivery still can't scale.
            </p>
            <p style={{
              margin:     0,
              fontSize:   'clamp(13px, 1.6vw, 16px)',
              fontWeight:  600,
              color:      '#00ffab',
              fontFamily: "'Inter', system-ui, sans-serif",
              textShadow: '0 0 18px #00ffab66',
            }}>
              That's exactly where 3Digree steps in 🚀
            </p>
          </motion.div>
        </FadeIn>

      </div>
    </section>
  );
}
