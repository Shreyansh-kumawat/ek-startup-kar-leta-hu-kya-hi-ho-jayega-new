import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

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

// ─── LINKEDIN ICON ───────────────────────────────────────────────────────────
const LinkedInIcon = () => (
  <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0
      5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966
      0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75
      1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4
      0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
    />
  </svg>
);

// ─── FOUNDER CARD ────────────────────────────────────────────────────────────
const FounderCard = ({
  image, name, role, tagline, skills, accentColor,
  linkedinUrl, linkedinHandle, delay, side,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [imgErr, setImgErr] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        x: side === 'left' ? -40 : 40,
        y: 24,
      }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -6,
        boxShadow: `0 0 40px ${accentColor}33, 0 16px 48px rgba(0,0,0,0.4)`,
      }}
      style={{
        position: 'relative',
        background: `linear-gradient(170deg, ${accentColor}0d, rgba(255,255,255,0.02))`,
        border: `1px solid ${accentColor}28`,
        borderRadius: 24,
        overflow: 'hidden',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.35s ease',
      }}
    >
      {/* Top border animation */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.0, delay: delay + 0.15, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          transformOrigin: 'left',
          zIndex: 10,
        }}
      />

      {/* Corner glow */}
      <div style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 130,
        height: 130,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}22, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Photo — square aspect ratio, full face visible ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '75%', // 4:3 ratio — square-ish, face fits well
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${accentColor}10, rgba(10,15,30,0.8))`,
        flexShrink: 0,
      }}>
        {!imgErr ? (
          <img
            src={image}
            alt={name}
            onError={() => setImgErr(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 10%', // shows full face, not cropped
              display: 'block',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${accentColor}18, rgba(10,15,30,0.9))`,
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `${accentColor}22`,
              border: `2px solid ${accentColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              color: accentColor,
            }}>
              {name.charAt(0)}
            </div>
          </div>
        )}

        {/* Bottom fade */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: `linear-gradient(to top, #0a0f1e, transparent)`,
          pointerEvents: 'none',
        }} />

        {/* Role badge */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 16,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(10,15,30,0.85)',
          border: `1px solid ${accentColor}40`,
          borderRadius: 999,
          padding: '5px 12px',
        }}>
          <div style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: accentColor,
          }} />
          <span style={{
            color: accentColor,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.07em',
            whiteSpace: 'nowrap',
          }}>
            {role}
          </span>
        </div>
      </div>

      {/* ── Info section ── */}
      <div style={{
        padding: '22px 24px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
        zIndex: 1,
        flexGrow: 1,
      }}>
        {/* Name + tagline */}
        <div>
          <h3 style={{
            margin: '0 0 5px',
            fontSize: 'clamp(20px, 2.5vw, 24px)',
            fontWeight: 900,
            color: '#ffffff',
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            {name}
          </h3>
          <p style={{
            margin: 0,
            fontSize: 13,
            color: 'rgba(255,255,255,0.42)',
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}>
            "{tagline}"
          </p>
        </div>

        {/* Skill tags — plain divs, no motion */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {skills.map((skill) => (
            <span
              key={skill}
              style={{
                border: `1px solid ${accentColor}28`,
                background: `${accentColor}0a`,
                borderRadius: 999,
                padding: '3px 11px',
                fontSize: 11,
                fontWeight: 600,
                color: accentColor,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: `linear-gradient(90deg, ${accentColor}18, transparent)`,
        }} />

        {/* LinkedIn CTA */}
        <motion.a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            background: accentColor,
            color: '#0a0f1e',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 13,
            padding: '11px 20px',
            borderRadius: 999,
            textDecoration: 'none',
            boxShadow: `0 0 16px ${accentColor}38`,
            letterSpacing: '-0.01em',
          }}
        >
          <LinkedInIcon />
          Connect on LinkedIn
          <span style={{
            fontSize: 10,
            opacity: 0.65,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.04em',
          }}>
            @{linkedinHandle}
          </span>
        </motion.a>
      </div>
    </motion.div>
  );
};

// ─── VISION STRIP ────────────────────────────────────────────────────────────
const VisionStrip = () => {
  const phrases = [
    '⚡ 3-Day Delivery',
    '🔒 White Label Always',
    '🚀 You Close We Build',
    '🎯 Your Brand Only',
    '🤝 Long-Term Partner',
    '💰 Better Margins',
    '🛡️ NDA Protected',
    '🌐 Remote Delivery',
  ];
  const doubled = [...phrases, ...phrases];

  return (
    <div style={{
      overflow: 'hidden',
      padding: '18px 0',
      maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
    }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{
          display: 'flex',
          gap: 22,
          width: 'max-content',
          alignItems: 'center',
        }}
      >
        {doubled.map((phrase, i) => (
          <React.Fragment key={i}>
            <span style={{
              color: 'rgba(255,255,255,0.26)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
              fontWeight: 600,
            }}>
              {phrase}
            </span>
            <span style={{ color: 'rgba(0,255,171,0.22)', fontSize: 9, flexShrink: 0 }}>◆</span>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

// ─── CLOSING LINE ─────────────────────────────────────────────────────────────
const ClosingLine = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{
        textAlign: 'center',
        padding: 'clamp(28px, 4vw, 44px)',
        borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(0,255,171,0.04), rgba(59,130,246,0.03))',
        border: '1px solid rgba(0,255,171,0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Static glow blob — no animate loop */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 460,
        height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,255,171,0.05), transparent)',
        pointerEvents: 'none',
      }} />

      <p style={{
        margin: '0 0 8px',
        fontSize: 'clamp(15px, 2.2vw, 20px)',
        fontWeight: 700,
        color: '#ffffff',
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight: 1.5,
        position: 'relative',
        zIndex: 1,
        letterSpacing: '-0.01em',
      }}>
        We've been in your shoes.
      </p>
      <p style={{
        margin: 0,
        fontSize: 'clamp(13px, 1.6vw, 16px)',
        color: 'rgba(255,255,255,0.42)',
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight: 1.65,
        position: 'relative',
        zIndex: 1,
      }}>
        Now we're building the infrastructure{' '}
        <span style={{ color: '#00ffab', fontWeight: 700 }}>
          we wish we had
        </span>{' '}
        — so you can grow without limits.
      </p>
    </motion.div>
  );
};

// ─── FOUNDERS DATA ────────────────────────────────────────────────────────────
const founders = [
  {
    image: '/f1.png',
    name: 'Akshat Raj',
    role: 'Co-Founder & CEO',
    tagline: 'Sales-first. Client-obsessed. The one who closes.',
    skills: ['Business Strategy', 'Client Relations', 'Sales', 'Product Vision', 'Operations'],
    accentColor: '#00ffab',
    linkedinUrl: 'https://www.linkedin.com/in/akssshat/',
    linkedinHandle: 'akssshat',
    side: 'left',
    delay: 0.2,
  },
  {
    image: '/f2.png',
    name: 'Shreyansh Kumawat',
    role: 'Co-Founder, CTO & CMnO',
    tagline: 'Full-stack builder. The one who makes it real.',
    skills: ['React', 'Node.js', 'Three.js', 'System Design', 'Growth Marketing'],
    accentColor: '#06b6d4',
    linkedinUrl: 'https://www.linkedin.com/in/shreyansh-kumawat-405125309/',
    linkedinHandle: 'shreyansh-kumawat',
    side: 'right',
    delay: 0.35,
  },
];

// ─── SECTION FOUNDERS — main export ──────────────────────────────────────────
export default function SectionFounders() {
  return (
    <section style={{
      position: 'relative',
      padding: 'clamp(72px, 10vw, 120px) clamp(20px, 5vw, 60px)',
      background: '#0a0f1e',
      overflow: 'hidden',
    }}>
      {/* Background blobs — static, no animation */}
      <div style={{
        position: 'absolute', top: '0%', left: '50%',
        transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,171,0.035) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-5%', left: '-5%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Section label */}
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(0,255,171,0.25)',
              background: 'rgba(0,255,171,0.05)',
              borderRadius: 999, padding: '5px 14px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ffab' }} />
              <span style={{
                color: '#00ffab', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
              }}>
                THE TEAM
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
            Meet the{' '}
            <span style={{ color: '#00ffab' }}>Founders</span>
          </h2>
        </FadeIn>

        {/* Sub-headline */}
        <FadeIn delay={0.13}>
          <p style={{
            textAlign: 'center',
            fontSize: 'clamp(13px, 1.8vw, 16px)',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight: 1.7, maxWidth: 480,
            margin: '0 auto 18px',
          }}>
            Two freelancers who solved their own delivery problem —
            and now help you solve yours.
          </p>
        </FadeIn>

        {/* Vision strip */}
        <FadeIn delay={0.17}>
          <VisionStrip />
        </FadeIn>

        {/* Founder cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          marginTop: 36,
          marginBottom: 48,
        }}>
          {founders.map((founder) => (
            <FounderCard key={founder.name} {...founder} />
          ))}
        </div>

        {/* Closing line */}
        <ClosingLine />

      </div>
    </section>
  );
}
