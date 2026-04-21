import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

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
        x: direction === 'left' ? 36 : direction === 'right' ? -36 : 0,
        scale: 0.97,
      }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1 } : {}}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIENCE CARD — hoverable tile with expand-on-click detail
// ─────────────────────────────────────────────────────────────────────────────
const AudienceCard = ({ icon, title, subtitle, detail, accentColor, delay }) => {
  const ref        = useRef(null);
  const isInView   = useInView(ref, { once: true, margin: '-60px' });
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        scale:     1.04,
        boxShadow: `0 0 36px ${accentColor}44, 0 8px 28px rgba(0,0,0,0.4)`,
        y:        -3,
      }}
      onClick={() => setOpen((v) => !v)}
      style={{
        position:      'relative',
        background:    `linear-gradient(150deg, ${accentColor}0c, rgba(255,255,255,0.02))`,
        border:        `1px solid ${accentColor}28`,
        borderRadius:   18,
        padding:       '26px 22px',
        cursor:        'pointer',
        overflow:      'hidden',
        display:       'flex',
        flexDirection: 'column',
        gap:            14,
        userSelect:    'none',
        transition:    'box-shadow 0.3s ease, transform 0.3s ease',
      }}
    >
      {/* Corner sparkle */}
      <div style={{
        position:   'absolute',
        top:        -20,
        right:      -20,
        width:       60,
        height:      60,
        borderRadius:'50%',
        background: `radial-gradient(circle, ${accentColor}30, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Top accent line — animates in */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.75, delay: delay + 0.2 }}
        style={{
          position:        'absolute',
          top:              0,
          left:             0,
          right:            0,
          height:           2,
          background:      `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          transformOrigin: 'left',
          borderRadius:   '18px 18px 0 0',
        }}
      />

      {/* Icon */}
      <div style={{
        fontSize:   32,
        lineHeight:  1,
        filter:    `drop-shadow(0 0 10px ${accentColor}99)`,
      }}>
        {icon}
      </div>

      {/* Title */}
      <h3 style={{
        margin:        0,
        fontSize:       16,
        fontWeight:     800,
        color:         '#ffffff',
        fontFamily:    "'Inter', system-ui, sans-serif",
        lineHeight:     1.3,
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h3>

      {/* Subtitle */}
      <p style={{
        margin:     0,
        fontSize:   12,
        color:      'rgba(255,255,255,0.42)',
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight:  1.55,
      }}>
        {subtitle}
      </p>

      {/* Expandable detail */}
      <motion.div
        initial={false}
        animate={{
          height:  open ? 'auto' : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{
          paddingTop:  12,
          borderTop:  `1px solid ${accentColor}22`,
          fontSize:    12,
          color:       accentColor,
          fontFamily: "'Inter', system-ui, sans-serif",
          lineHeight:  1.65,
          fontWeight:  500,
        }}>
          {detail}
        </div>
      </motion.div>

      {/* Expand hint */}
      <motion.div
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          alignSelf:  'flex-end',
          fontSize:    11,
          color:       `${accentColor}80`,
          fontFamily: "'JetBrains Mono', monospace",
          marginTop:  -6,
        }}
      >
        ▾
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MARQUEE ROW — scrolling ticker of use cases
// ─────────────────────────────────────────────────────────────────────────────
const MarqueeRow = ({ items, direction = 1 }) => {
  const doubled = [...items, ...items]; // seamless loop

  return (
    <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}>
      <motion.div
        animate={{ x: direction > 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        style={{
          display:    'flex',
          gap:         14,
          width:      'max-content',
          paddingBottom: 4,
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            style={{
              border:       `1px solid ${item.color}33`,
              background:   `${item.color}09`,
              borderRadius:  999,
              padding:      '7px 18px',
              whiteSpace:   'nowrap',
              display:      'flex',
              alignItems:   'center',
              gap:           8,
              flexShrink:    0,
            }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span style={{
              color:      item.color,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize:    13,
              fontWeight:  600,
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DATA
// ─────────────────────────────────────────────────────────────────────────────
const audience = [
  {
    icon:        '🧑‍💻',
    title:       'Freelancers',
    subtitle:    'Delivering 50–100 websites a year but drowning in build time.',
    detail:      'You close deals fast but building is the bottleneck. 3Digree lets you take on 3× more clients without hiring a single developer.',
    accentColor: '#00ffab',
  },
  {
    icon:        '🏢',
    title:       'Small IT Companies',
    subtitle:    '2–10 person teams that want to scale output without scaling headcount.',
    detail:      "Your team sells well but can't keep up with delivery. We become your silent production floor — predictable, fast, invisible.",
    accentColor: '#06b6d4',
  },
  {
    icon:        '📣',
    title:       'Digital Marketing Agencies',
    subtitle:    'Agencies that sell websites as part of a bigger package.',
    detail:      "You're great at marketing — not necessarily at web builds. Hand off the development, keep the margin, impress your clients every time.",
    accentColor: '#a78bfa',
  },
  {
    icon:        '🎨',
    title:       'Web Design Studios',
    subtitle:    'Designers who want to focus on design, not development.',
    detail:      'Your value is in design strategy and visuals. 3Digree turns your Figma files into live, deployed websites without you writing a line of code.',
    accentColor: '#f472b6',
  },
  {
    icon:        '💼',
    title:       'Business Consultants',
    subtitle:    'Consultants adding web services to their offering.',
    detail:      'Your clients trust you for business advice and now they need a website too. We make you look like a full-service firm without any tech overhead.',
    accentColor: '#fb923c',
  },
  {
    icon:        ' ',
    title:       'Solopreneurs Scaling Up',
    subtitle:    'Solo operators building an agency without a team.',
    detail:      "You've outgrown solo freelancing but aren't ready to hire. 3Digree is your first silent team member — the one who actually builds everything.",
    accentColor: '#34d399',
  },
  {
    icon:        '📈',
    title:       'Sales-Focused Agencies',
    subtitle:    'Teams that close fast but struggle to deliver fast.',
    detail:      'Your sales machine is strong but delivery always lags. With 3Digree in the backend, every sale closes confidently with a 3-day promise.',
    accentColor: '#fbbf24',
  },
  {
    icon:        '🌐',
    title:       'Service Providers',
    subtitle:    'Any service business adding websites to their portfolio.',
    detail:      'Accountants, lawyers, marketers — anyone who serves businesses and wants to add websites as a revenue stream without the technical complexity.',
    accentColor: '#60a5fa',
  },
];

const marqueeRow1 = [
  { icon: '⚡', label: '3-Day Turnaround',      color: '#00ffab' },
  { icon: '🔒', label: 'NDA Protected',          color: '#06b6d4' },
  { icon: '🎨', label: 'Custom Design',           color: '#a78bfa' },
  { icon: '📱', label: 'Mobile First',            color: '#f472b6' },
  { icon: ' ', label: 'Fast Deployment',         color: '#fb923c' },
  { icon: '💰', label: 'Better Margins',          color: '#34d399' },
  { icon: '🛡️', label: 'White Label',            color: '#fbbf24' },
  { icon: '🤝', label: 'Partner Network',         color: '#60a5fa' },
];

const marqueeRow2 = [
  { icon: '🌍', label: 'Remote Delivery',         color: '#a78bfa' },
  { icon: '📊', label: 'Scalable Volume',         color: '#00ffab' },
  { icon: '🔧', label: 'Clean Code',              color: '#fb923c' },
  { icon: '📦', label: 'Full Source Handoff',     color: '#06b6d4' },
  { icon: '🎯', label: 'Brand Aligned',           color: '#f472b6' },
  { icon: '💬', label: 'WhatsApp Updates',        color: '#34d399' },
  { icon: '⚙️', label: 'Any Stack',              color: '#fbbf24' },
  { icon: '🏆', label: 'Quality Reviewed',        color: '#60a5fa' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WHO FOR — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function SectionWhoFor() {
  return (
    <section
      style={{
        position:   'relative',
        padding:    'clamp(80px, 10vw, 130px) clamp(20px, 5vw, 60px)',
        background: '#080c18',
        overflow:   'hidden',
      }}
    >
      {/* ── Background decorations ──────────────────────────────────────── */}
      <div style={{
        position:   'absolute',
        top:        '30%',
        left:       '50%',
        transform:  'translateX(-50%)',
        width:       800,
        height:      800,
        borderRadius:'50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 65%)',
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
              border:     '1px solid rgba(167,139,250,0.3)',
              background: 'rgba(167,139,250,0.06)',
              borderRadius: 999,
              padding:    '5px 16px',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#a78bfa', boxShadow: '0 0 8px #a78bfa',
              }} />
              <span style={{
                color:         '#a78bfa',
                fontFamily:    "'JetBrains Mono', monospace",
                fontSize:       11,
                fontWeight:     700,
                letterSpacing: '0.18em',
              }}>
                WHO IT'S FOR
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
            textShadow:    '0 0 40px rgba(167,139,250,0.25)',
          }}>
            Who{' '}
            <span style={{
              color:      '#c084fc',
              textShadow: '0 0 30px #a855f7aa, 0 0 60px #a855f744',
            }}>
              3Digree
            </span>{' '}
            Is Built For
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
            margin:     '0 auto 18px',
          }}>
            If you're one of these — we're your perfect silent backend partner.
            Tap any card to learn more.
          </p>
        </FadeIn>

        {/* Marquee rows */}
        <FadeIn delay={0.2}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 56 }}>
            <MarqueeRow items={marqueeRow1} direction={1}  />
            <MarqueeRow items={marqueeRow2} direction={-1} />
          </div>
        </FadeIn>

        {/* Cards grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap:                  20,
          marginBottom:         52,
        }}>
          {audience.map((item, i) => (
            <AudienceCard
              key={item.title}
              {...item}
              delay={0.08 + i * 0.07}
            />
          ))}
        </div>

        {/* Bottom callout */}
        <FadeIn delay={0.5}>
          <motion.div
            animate={{
              boxShadow: [
                '0 0 22px rgba(167,139,250,0.1)',
                '0 0 48px rgba(167,139,250,0.22)',
                '0 0 22px rgba(167,139,250,0.1)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:    'linear-gradient(135deg, rgba(167,139,250,0.09), rgba(0,255,171,0.06))',
              border:        '1px solid rgba(167,139,250,0.2)',
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
              Want predictable delivery without expanding your team?
            </p>
            <p style={{
              margin:     0,
              fontSize:   'clamp(13px, 1.6vw, 16px)',
              fontWeight:  600,
              color:      '#c084fc',
              fontFamily: "'Inter', system-ui, sans-serif",
              textShadow: '0 0 18px #a855f766',
            }}>
              That's exactly what 3Digree delivers. 🎯
            </p>
          </motion.div>
        </FadeIn>

      </div>
    </section>
  );
}
