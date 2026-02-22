import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// FADE-IN WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-72px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: direction === 'up' ? 36 : -36, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTOR LINE — animated dashed line between steps on desktop
// ─────────────────────────────────────────────────────────────────────────────
const ConnectorLine = ({ delay }) => {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      style={{
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 28,           // Align with card icon area
        flexShrink: 0,
      }}
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        style={{
          width:           64,
          height:           2,
          transformOrigin: 'left',
          background:      'linear-gradient(90deg, #00ffab44, #06b6d444)',
          borderRadius:     4,
          position:        'relative',
        }}
      >
        {/* Travelling dot */}
        <motion.div
          animate={{ x: [0, 64, 0] }}
          transition={{ duration: 15.4, repeat: Infinity, ease: 'easeInOut', delay }}
          style={{
            position:     'absolute',
            top:          -2,
            left:          0,
            transform:    'translateY(-40%)',
            width:         6,
            height:        6,
            borderRadius: '50%',
            background:   '#00ffab',
            boxShadow:    '0 0 8px #00ffab',
          }}
        />
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP CARD
// ─────────────────────────────────────────────────────────────────────────────
const StepCard = ({ step, icon, title, description, accentColor, bulletPoints, delay }) => {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        scale:     1.03,
        boxShadow: `0 0 45px ${accentColor}44, 0 12px 40px rgba(0,0,0,0.5)`,
        y:        -4,
      }}
      style={{
        position:      'relative',
        background:    `linear-gradient(160deg, ${accentColor}0c, rgba(255,255,255,0.025))`,
        border:        `1px solid ${accentColor}28`,
        borderRadius:   22,
        padding:       '36px 30px 32px',
        overflow:      'hidden',
        cursor:        'default',
        flex:          '1 1 260px',
        minWidth:       260,
        maxWidth:       360,
        display:       'flex',
        flexDirection: 'column',
        gap:            20,
        transition:    'box-shadow 0.3s ease',
      }}
    >
      {/* Step number watermark */}
      <div style={{
        position:   'absolute',
        top:         8,
        right:       16,
        fontSize:    72,
        fontWeight:  900,
        color:      `${accentColor}07`,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight:  1,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        {String(step).padStart(2, '0')}
      </div>

      {/* Top accent bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, delay: delay + 0.15 }}
        style={{
          position:        'absolute',
          top:              0,
          left:             0,
          right:            0,
          height:           3,
          background:      `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          transformOrigin: 'left',
          borderRadius:   '22px 22px 0 0',
        }}
      />

      {/* Icon ring */}
      <div style={{
        width:          60,
        height:         60,
        borderRadius:  '50%',
        border:        `1.5px solid ${accentColor}40`,
        background:    `${accentColor}10`,
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        fontSize:       28,
        flexShrink:     0,
        boxShadow:     `0 0 20px ${accentColor}22`,
      }}>
        {icon}
      </div>

      {/* Step label */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:         8,
      }}>
        <div style={{
          background:    accentColor,
          borderRadius:   6,
          padding:       '2px 10px',
          fontSize:       11,
          fontWeight:     700,
          color:         '#0a0f1e',
          fontFamily:    "'JetBrains Mono', monospace",
          letterSpacing: '0.1em',
        }}>
          STEP {step}
        </div>
      </div>

      {/* Title */}
      <h3 style={{
        margin:        0,
        fontSize:      22,
        fontWeight:    800,
        color:         accentColor,
        fontFamily:    "'Inter', system-ui, sans-serif",
        letterSpacing: '-0.015em',
        lineHeight:     1.2,
        textShadow:   `0 0 18px ${accentColor}66`,
      }}>
        {title}
      </h3>

      {/* Description */}
      <p style={{
        margin:     0,
        fontSize:   14,
        color:      'rgba(255,255,255,0.5)',
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight:  1.75,
      }}>
        {description}
      </p>

      {/* Bullet points */}
      <ul style={{
        margin:     0,
        padding:    0,
        listStyle:  'none',
        display:    'flex',
        flexDirection: 'column',
        gap:         10,
        flexGrow:    1,
      }}>
        {bulletPoints.map((point) => (
          <li key={point} style={{
            display:    'flex',
            alignItems: 'flex-start',
            gap:         10,
            fontSize:    13,
            color:      'rgba(255,255,255,0.6)',
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight:  1.5,
          }}>
            <div style={{
              width:        16,
              height:       16,
              borderRadius: '50%',
              border:       `1.5px solid ${accentColor}60`,
              background:   `${accentColor}14`,
              display:      'flex',
              alignItems:   'center',
              justifyContent:'center',
              flexShrink:    0,
              marginTop:     1,
            }}>
              <div style={{
                width:        5,
                height:       5,
                borderRadius: '50%',
                background:   accentColor,
              }} />
            </div>
            {point}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROMISE BANNER
// ─────────────────────────────────────────────────────────────────────────────
const PromiseBanner = () => {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      animate-extra={{
        boxShadow: [
          '0 0 25px rgba(0,255,171,0.12)',
          '0 0 50px rgba(0,255,171,0.25)',
          '0 0 25px rgba(0,255,171,0.12)',
        ],
      }}
      style={{
        display:       'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap:            1,
        borderRadius:   22,
        overflow:      'hidden',
        border:        '1px solid rgba(0,255,171,0.2)',
        background:    'rgba(0,255,171,0.03)',
        backdropFilter:'blur(12px)',
        marginTop:      48,
      }}
    >
      {[
        { label: 'Client Confidentiality', value: '100%',         color: '#00ffab' },
        { label: 'On-Time Delivery',        value: 'Guaranteed',   color: '#06b6d4' },
        { label: 'White Label',             value: 'Always',       color: '#a78bfa' },
        { label: 'Your Brand',              value: 'Exclusively',  color: '#f472b6' },
      ].map(({ label, value, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
          whileHover={{ background: `${color}10` }}
          style={{
            padding:       '28px 24px',
            textAlign:     'center',
            borderRight:   i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            transition:    'background 0.3s ease',
          }}
        >
          <div style={{
            fontSize:   'clamp(20px, 3vw, 28px)',
            fontWeight:  900,
            color,
            fontFamily: "'Inter', system-ui, sans-serif",
            textShadow: `0 0 20px ${color}88`,
            marginBottom: 6,
          }}>
            {value}
          </div>
          <div style={{
            fontSize:   12,
            color:      'rgba(255,255,255,0.4)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.1em',
          }}>
            {label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DATA
// ─────────────────────────────────────────────────────────────────────────────
const steps = [
  {
    step:        1,
    icon:        '🤝',
    title:       'You Close the Deal',
    description: 'Your client, your price, your relationship. We are completely invisible — we never reach out to your clients, never brand anything with our name.',
    accentColor: '#00ffab',
    bulletPoints: [
      'You set your own pricing and margins',
      'Full ownership of client relationship',
      'We sign NDAs if required',
      'We never contact your clients directly',
    ],
  },
  {
    step:        2,
    icon:        '⚡',
    title:       'We Build in 3 Days',
    description: 'Send us the brief. Our tested delivery system spins up the website fast — built, reviewed, and deployed within 3 business days. Consistent quality, every time.',
    accentColor: '#06b6d4',
    bulletPoints: [
      'Send brief via WhatsApp or email',
      'Built on your preferred stack',
      'Internal QA before handoff',
      '3 business day turnaround, always',
    ],
  },
  {
    step:        3,
    icon:        '🎯',
    title:       'You Deliver & Win',
    description: 'You receive the finished product and deliver it to your client under your own brand. Take the credit, keep the margin, grow your reputation.',
    accentColor: '#a78bfa',
    bulletPoints: [
      'Delivered as your brand, not ours',
      'Source code handed over fully',
      'You take 100% of the credit',
      'Keep scaling without limits',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HOW IT WORKS — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function SectionHowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        position:   'relative',
        padding:    'clamp(80px, 10vw, 130px) clamp(20px, 5vw, 60px)',
        background: '#0a0f1e',
        overflow:   'hidden',
      }}
    >
      {/* ── Background decorations ──────────────────────────────────────── */}

      {/* Top-right orb */}
      <div style={{
        position:     'absolute',
        top:          '-5%',
        right:        '-5%',
        width:         500,
        height:        500,
        borderRadius: '50%',
        background:   'radial-gradient(circle, rgba(0,255,171,0.06) 0%, transparent 65%)',
        pointerEvents:'none',
      }} />

      {/* Bottom-left orb */}
      <div style={{
        position:     'absolute',
        bottom:       '-5%',
        left:         '-5%',
        width:         400,
        height:        400,
        borderRadius: '50%',
        background:   'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 65%)',
        pointerEvents:'none',
      }} />

      {/* Grid overlay */}
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
                THE PROCESS
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
            How{' '}
            <span style={{
              color:      '#00ffab',
              textShadow: '0 0 30px #00ffabaa, 0 0 60px #00ffab44',
            }}>
              3Digree
            </span>{' '}
            Works
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
            margin:     '0 auto 64px',
          }}>
            Simple, transparent, and designed to make you the hero in your client's eyes.
          </p>
        </FadeIn>

        {/* Steps row — cards + connectors */}
        <div style={{
          display:        'flex',
          flexWrap:       'wrap',
          gap:             0,
          justifyContent: 'center',
          alignItems:     'flex-start',
        }}>
          {steps.map((step, i) => (
            <React.Fragment key={step.step}>
              <StepCard {...step} delay={0.2 + i * 0.15} />
              {i < steps.length - 1 && (
                // Hide connector on mobile via CSS (we use inline style only
                // so add a wrapper that collapses on small screens)
                <div style={{
                  display:    'flex',
                  alignItems: 'center',
                  padding:    '40px 0 0',
                }}>
                  <ConnectorLine delay={0.35 + i * 0.15} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Promise banner */}
        <PromiseBanner />

        {/* Bottom CTA nudge */}
        <FadeIn delay={0.6}>
          <div style={{
            textAlign:  'center',
            marginTop:   32,
          }}>
            <p style={{
              fontSize:   'clamp(13px, 1.6vw, 16px)',
              color:      'rgba(255,255,255,0.35)',
              fontFamily: "'Inter', system-ui, sans-serif",
              margin:      0,
            }}>
              Ready to hand off delivery?{' '}
              <a
                href="https://wa.me/918741967971"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color:          '#00ffab',
                  textDecoration: 'none',
                  fontWeight:      700,
                  textShadow:     '0 0 12px #00ffab66',
                }}
              >
                Let's talk →
              </a>
            </p>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
